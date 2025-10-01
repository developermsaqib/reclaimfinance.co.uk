<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Get form data from POST request
$formData = $_POST;

// Validate required fields (only the most essential ones)
$requiredFields = [
    'postCode', 'email', 'firstname', 'lastname', 'title', 'date_of_birth', 
    'phone', 'iva', 'fullAddressCurrent', 'signatureBase64'
];

foreach ($requiredFields as $field) {
    if (!isset($formData[$field]) || empty($formData[$field])) {
        http_response_code(400);
        echo json_encode(['error' => "Missing required field: $field"]);
        exit();
    }
}

// Set default values for optional fields
$formData['street'] = $formData['street'] ?? '';
$formData['postTown'] = $formData['postTown'] ?? '';
$formData['houseNumber'] = $formData['houseNumber'] ?? '';
$formData['county'] = $formData['county'] ?? '';
$formData['signatureUrl'] = $formData['signatureUrl'] ?? '';
$formData['aff_id'] = $formData['aff_id'] ?? '666';
$formData['fullAddressPrevious'] = $formData['fullAddressPrevious'] ?? '';
$formData['street2'] = $formData['street2'] ?? '12';
$formData['source'] = $formData['source'] ?? 'Reclaims';
$formData['userBrowser'] = $formData['userBrowser'] ?? 'Unknown';
$formData['userOs'] = $formData['userOs'] ?? 'Unknown';
$formData['userDevice'] = $formData['userDevice'] ?? 'Desktop';
$formData['landingTime'] = $formData['landingTime'] ?? date('d/m/Y, H:i:s');
$formData['signatureTime'] = $formData['signatureTime'] ?? date('d/m/Y, H:i:s');
$formData['submissionTime'] = $formData['submissionTime'] ?? date('d/m/Y, H:i:s');
$formData['userAgent'] = $formData['userAgent'] ?? $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';
$formData['claimPdfUrl'] = $formData['claimPdfUrl'] ?? '';
$formData['contactId'] = $formData['contactId'] ?? '';
$formData['ipAddress'] = $formData['ipAddress'] ?? $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
$formData['kyc'] = $formData['kyc'] ?? '';

// Build the API URL with parameters
$apiUrl = 'https://pcpclaim.pro/api/v1/webhooks/claims';
$params = [
    'postCode' => $formData['postCode'],
    'street' => $formData['street'],
    'postTown' => $formData['postTown'],
    'houseNumber' => $formData['houseNumber'] ?? '',
    'email' => $formData['email'],
    'firstname' => $formData['firstname'],
    'lastname' => $formData['lastname'],
    'county' => $formData['county'],
    'title' => $formData['title'],
    'date_of_birth' => $formData['date_of_birth'],
    'phone' => $formData['phone'],
    'signatureUrl' => $formData['signatureUrl'] ?? '',
    'aff_id' => $formData['aff_id'] ?? '666',
    'fullAddressPrevious' => $formData['fullAddressPrevious'] ?? '',
    'street2' => $formData['street2'] ?? '12',
    'iva' => $formData['iva'],
    'fullAddressCurrent' => $formData['fullAddressCurrent'],
    'source' => $formData['source'] ?? 'Reclaims',
    'signatureBase64' => $formData['signatureBase64'],
    'userBrowser' => $formData['userBrowser'],
    'userOs' => $formData['userOs'],
    'userDevice' => $formData['userDevice'],
    'landingTime' => $formData['landingTime'],
    'signatureTime' => $formData['signatureTime'],
    'submissionTime' => $formData['submissionTime'],
    'userAgent' => $formData['userAgent'],
    'claimPdfUrl' => $formData['claimPdfUrl'] ?? '',
    'contactId' => $formData['contactId'] ?? '',
    'ipAddress' => $formData['ipAddress'],
    'kyc' => $formData['kyc'] ?? ''
];

// Log the request for debugging (remove in production)
error_log("Form data received: " . json_encode($formData));
error_log("Submitting to: " . $apiUrl);

// Make the request to PCP Pro API
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
curl_setopt($ch, CURLOPT_USERAGENT, 'PHP-Proxy/1.0');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($params));

// Set headers
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/x-www-form-urlencoded',
    'Accept: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

// Handle cURL errors
if ($error) {
    error_log("cURL Error: " . $error);
    http_response_code(500);
    echo json_encode([
        'error' => 'Server error occurred while submitting form',
        'details' => $error,
        'debug' => 'cURL connection failed'
    ]);
    exit();
}

// Handle API response (Yes/No or HTTP errors)
if ($httpCode >= 400) {
    error_log("API Error - HTTP Code: $httpCode, Response: $response");
    
    // Store form data locally as backup when API fails
    $backupData = [
        'form_data' => $formData,
        'api_error' => [
            'http_code' => $httpCode,
            'response' => $response,
            'timestamp' => date('Y-m-d H:i:s')
        ]
    ];
    
    $backupFile = __DIR__ . '/failed_submissions_' . date('Y-m-d') . '.json';
    $existingBackups = [];
    if (file_exists($backupFile)) {
        $existingBackups = json_decode(file_get_contents($backupFile), true) ?? [];
    }
    $existingBackups[] = $backupData;
    file_put_contents($backupFile, json_encode($existingBackups, JSON_PRETTY_PRINT));
    
    // Return success to user but log the API error
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Form submitted successfully (stored locally due to API issue)',
        'note' => 'Your form has been received and will be processed. API endpoint needs to be verified.',
        'submission_id' => uniqid()
    ]);
    exit();
}

// Handle PCP Pro API response (Yes/No)
$apiResponse = trim($response);
error_log("PCP Pro API Response: " . $apiResponse);

if ($apiResponse === 'Yes') {
    // Success - API accepted the submission
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Form submitted successfully to PCP Pro',
        'api_response' => 'Yes',
        'submission_id' => uniqid()
    ]);
    exit();
} elseif ($apiResponse === 'No') {
    // API rejected the submission
    error_log("PCP Pro API rejected submission: " . $apiResponse);
    
    // Store rejected submission for review
    $rejectedData = [
        'form_data' => $formData,
        'api_response' => 'No',
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    $rejectedFile = __DIR__ . '/rejected_submissions_' . date('Y-m-d') . '.json';
    $existingRejected = [];
    if (file_exists($rejectedFile)) {
        $existingRejected = json_decode(file_get_contents($rejectedFile), true) ?? [];
    }
    $existingRejected[] = $rejectedData;
    file_put_contents($rejectedFile, json_encode($existingRejected, JSON_PRETTY_PRINT));
    
    // Return success to user but note the rejection
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Form submitted successfully (API response: No)',
        'note' => 'Your form has been received. API returned "No" - please check with PCP Pro support.',
        'api_response' => 'No',
        'submission_id' => uniqid()
    ]);
    exit();
} else {
    // Unexpected response
    error_log("Unexpected API response: " . $apiResponse);
    
    // Store for review
    $unexpectedData = [
        'form_data' => $formData,
        'api_response' => $apiResponse,
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    $unexpectedFile = __DIR__ . '/unexpected_responses_' . date('Y-m-d') . '.json';
    $existingUnexpected = [];
    if (file_exists($unexpectedFile)) {
        $existingUnexpected = json_decode(file_get_contents($unexpectedFile), true) ?? [];
    }
    $existingUnexpected[] = $unexpectedData;
    file_put_contents($unexpectedFile, json_encode($existingUnexpected, JSON_PRETTY_PRINT));
    
    // Return success to user
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Form submitted successfully',
        'note' => 'Your form has been received. API returned unexpected response.',
        'api_response' => $apiResponse,
        'submission_id' => uniqid()
    ]);
    exit();
}

?>
