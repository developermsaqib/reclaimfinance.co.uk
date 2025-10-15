<?php
// Disable display of errors to prevent HTML output
error_reporting(0);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/debug.log');

// Ensure no output before headers
ob_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Function to log debug information
function debug_log($message, $data = null) {
    $log = "[" . date('Y-m-d H:i:s') . "] " . $message;
    if ($data !== null) {
        $log .= "\n" . print_r($data, true);
    }
    error_log($log . "\n", 3, __DIR__ . '/debug.log');
}

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Verify POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    debug_log("Invalid request method: " . $_SERVER['REQUEST_METHOD']);
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

try {
    // Get POST data
    $raw_data = file_get_contents('php://input');
    debug_log("Received raw data: " . $raw_data);
    
    $data = json_decode($raw_data, true);
    if (!$data) {
        $error = json_last_error_msg();
        debug_log("JSON decode error: " . $error);
        throw new Exception("Invalid JSON data: " . $error);
    }
    
    // If token exists, update existing record instead of creating new one
    $token = isset($data['token']) ? $data['token'] : null;
    if ($token) {
        // Check if the token exists and form is not completed
        $check_stmt = $conn->prepare("SELECT id FROM submissions WHERE token = ? AND is_complete = 0");
        $check_stmt->bind_param("s", $token);
        $check_stmt->execute();
        $result = $check_stmt->get_result();
        
        if ($result->num_rows === 0) {
            throw new Exception('Invalid token or form already completed');
        }
        
        $submission = $result->fetch_assoc();
        $submission_id = $submission['id'];
        $check_stmt->close();
    }
    
    debug_log("Decoded data", $data);

    // Connect to database
    $conn = new mysqli('sdb-c.hosting.stackcp.net', 'root', 'hwf7etr8p8', 'reclaims_finance-31373147c8');
    if ($conn->connect_error) {
        debug_log("Database connection error: " . $conn->connect_error);
        throw new Exception("Database connection failed: " . $conn->connect_error);
    }
    debug_log("Database connected successfully");

    // Create table if not exists
    $createTable = "CREATE TABLE IF NOT EXISTS form_submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        token VARCHAR(64) UNIQUE NOT NULL,
        postcode VARCHAR(255) DEFAULT '',
        address TEXT DEFAULT '',
        iva_bankruptcy_status VARCHAR(100) DEFAULT '',
        title VARCHAR(50) DEFAULT '',
        firstname VARCHAR(100) DEFAULT '',
        lastname VARCHAR(100) DEFAULT '',
        previousname VARCHAR(100) DEFAULT '',
        date_of_birth DATE DEFAULT NULL,
        email VARCHAR(255) DEFAULT '',
        phone VARCHAR(50) DEFAULT '',
        authority_accepted TINYINT(1) DEFAULT 0,
        signature_long TEXT DEFAULT NULL,
        completed TINYINT(1) DEFAULT 0,
        expires_at DATETIME DEFAULT NULL,
        agent_ip VARCHAR(45) DEFAULT NULL,
        agent_useragent TEXT DEFAULT NULL,
        agent_os VARCHAR(100) DEFAULT NULL,
        user_ip VARCHAR(45) DEFAULT NULL,
        user_useragent TEXT DEFAULT NULL,
        user_os VARCHAR(100) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";

    if (!$conn->query($createTable)) {
        debug_log("Table creation error: " . $conn->error);
        throw new Exception("Failed to create table: " . $conn->error);
    }

    // Generate token and get user info
    $token = bin2hex(random_bytes(32));
    $user_ip = $_SERVER['REMOTE_ADDR'];
    $user_useragent = $_SERVER['HTTP_USER_AGENT'] ?? '';
    $user_os = php_uname('s');

    // Get date of birth from form data
    $dateOfBirth = null;
    if (isset($data['dateOfBirth']) && !empty($data['dateOfBirth'])) {
        $dateOfBirth = $data['dateOfBirth'];
    } elseif (isset($data['dayOfBirth']) && isset($data['monthOfBirth']) && isset($data['yearOfBirth'])) {
        // Construct date from separate day, month, year fields
        $day = str_pad($data['dayOfBirth'], 2, '0', STR_PAD_LEFT);
        $month = str_pad($data['monthOfBirth'], 2, '0', STR_PAD_LEFT);
        $year = $data['yearOfBirth'];
        if ($day && $month && $year) {
            $dateOfBirth = "$year-$month-$day";
        }
    }
    
    debug_log("Date of birth extracted: " . ($dateOfBirth ?: 'NULL'));

    // Validate required fields
    $required_fields = ['title', 'firstName', 'lastName', 'email', 'phoneNumber', 'postcode', 'address'];
    foreach ($required_fields as $field) {
        if (empty($data[$field])) {
            debug_log("Missing required field: " . $field);
            throw new Exception("Missing required field: " . $field);
        }
    }

    // Prepare and execute INSERT
    $sql = "INSERT INTO form_submissions (
        token, title, firstname, lastname, previousname, date_of_birth,
        email, phone, postcode, address, user_ip, 
        user_useragent, user_os, expires_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))";

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        debug_log("Prepare statement failed: " . $conn->error);
        throw new Exception("Prepare failed: " . $conn->error);
    }

    $previousName = isset($data['previousName']) ? $data['previousName'] : '';
    
    $stmt->bind_param("sssssssssssss",
        $token,
        $data['title'],
        $data['firstName'],
        $data['lastName'],
        $previousName,
        $dateOfBirth,
        $data['email'],
        $data['phoneNumber'],
        $data['postcode'],
        $data['address'],
        $user_ip,
        $user_useragent,
        $user_os
    );

    if (!$stmt->execute()) {
        debug_log("Execute failed: " . $stmt->error);
        throw new Exception("Execute failed: " . $stmt->error);
    }

    debug_log("Data inserted successfully");

    // Send confirmation email
    $to = $data['email'];
    $subject = "Complete Your Car Finance Claim";
    $uniqueLink = "https://reclaimsfinance.co.uk/?token=" . $token;
    
    $message = "
    <html>
    <head>
        <title>Complete Your Car Finance Claim</title>
    </head>
    <body>
        <h2>Thank you for starting your claim</h2>
        <p>Please click the link below to complete your submission:</p>
        <p><a href='{$uniqueLink}'>{$uniqueLink}</a></p>
        <p>This link will expire in 24 hours.</p>
    </body>
    </html>";

    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8\r\n";
    $headers .= 'From: Reclaim Finance <noreply@reclaimfinance.co.uk>\r\n';

    $mail_result = mail($to, $subject, $message, $headers);
    debug_log("Email send result: " . ($mail_result ? "Success" : "Failed"));

    // Send success response
    $response = [
        'success' => true,
        'message' => 'Data saved successfully. Please check your email to complete the submission.',
        'token' => $token
    ];
    echo json_encode($response);

} catch (Exception $e) {
    debug_log("Error occurred: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>