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
$formData['url'] = $formData['url'] ?? 'https://reclaimsfinance.co.uk/';

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


$apiResponse = trim($response);
error_log("PCP Pro API Response: " . $apiResponse);

// --- Send to additional API endpoint ---
$newApiUrl = 'https://gateway.claim3000.uk/api/send-stepper-form'; // <-- Change to your actual endpoint
$referralId = ''; // You can generate or fetch this as needed

// Helper: extract day, month, year from date_of_birth (format: YYYY-MM-DD or DD/MM/YYYY)
function extractDayMonthYear($dob) {
    if (strpos($dob, '-') !== false) {
        $parts = explode('-', $dob);
        if (strlen($parts[0]) === 4) {
            // YYYY-MM-DD
            return ['day' => ltrim($parts[2], '0'), 'month' => ltrim($parts[1], '0'), 'year' => $parts[0]];
        }
    } elseif (strpos($dob, '/') !== false) {
        $parts = explode('/', $dob);
        if (strlen($parts[2]) === 4) {
            // DD/MM/YYYY
            return ['day' => ltrim($parts[0], '0'), 'month' => ltrim($parts[1], '0'), 'year' => $parts[2]];
        }
    }
    return ['day' => '', 'month' => '', 'year' => ''];
}

$dobParts = extractDayMonthYear($formData['date_of_birth']);

$newPayload = [
    'referralId' => $referralId,
    'addressData' => [
        'Address Line 1' => $formData['street'] ?? '',
        'post_town' => $formData['postTown'] ?? '',
        'county' => $formData['county'] ?? '',
        'postcode' => $formData['postCode'] ?? ''
    ],
    'contactData' => [
        'title' => $formData['title'] ?? '',
        'firstName' => $formData['firstname'] ?? '',
        'lastName' => $formData['lastname'] ?? '',
        'day' => $dobParts['day'],
        'month' => $dobParts['month'],
        'year' => $dobParts['year']
    ],
    'commData' => [
        'mobile' => $formData['phone'] ?? '',
        'email' => $formData['email'] ?? ''
    ],
    'personalData' => [
        'title' => $formData['title'] ?? '',
        'firstName' => $formData['firstname'] ?? '',
        'iva' => $formData['iva'] ?? '',
        'lastName' => $formData['lastname'] ?? '',
        'day' => $dobParts['day'],
        'month' => $dobParts['month'],
        'year' => $dobParts['year'],
        'mobile' => $formData['phone'] ?? '',
        'email' => $formData['email'] ?? '',
        'buildingNumber' => $formData['houseNumber'] ?? '',
        'buildingName' => '',
        'street' => $formData['street'] ?? '',
        'town' => $formData['postTown'] ?? '',
        'postcode' => $formData['postCode'] ?? '',
        'county' => $formData['county'] ?? ''
    ],
    'imageData' => null,
    'hrefs' => [
        $formData['url']
    ]
];

$ch2 = curl_init();
curl_setopt($ch2, CURLOPT_URL, $newApiUrl);
curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch2, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch2, CURLOPT_TIMEOUT, 30);
curl_setopt($ch2, CURLOPT_SSL_VERIFYPEER, true);
curl_setopt($ch2, CURLOPT_USERAGENT, 'PHP-Proxy/1.0');
curl_setopt($ch2, CURLOPT_POST, true);
curl_setopt($ch2, CURLOPT_POSTFIELDS, json_encode($newPayload));
curl_setopt($ch2, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);
$newApiResponse = curl_exec($ch2);
$newApiHttpCode = curl_getinfo($ch2, CURLINFO_HTTP_CODE);
$newApiError = curl_error($ch2);
curl_close($ch2);
error_log("New API response: $newApiResponse, HTTP code: $newApiHttpCode, Error: $newApiError");
// --- End additional API call ---

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
    // ...existing code...
    $rejectedData = [
        'form_data' => $formData,
        'api_response' => 'No',
        'timestamp' => date('Y-m-d H:i:s')
    ];
    // ...existing code...
    $rejectedFile = __DIR__ . '/rejected_submissions_' . date('Y-m-d') . '.json';
    $existingRejected = [];
    if (file_exists($rejectedFile)) {
        $existingRejected = json_decode(file_get_contents($rejectedFile), true) ?? [];
    }
    $existingRejected[] = $rejectedData;
    file_put_contents($rejectedFile, json_encode($existingRejected, JSON_PRETTY_PRINT));
    // ...existing code...
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
    // ...existing code...
    $unexpectedData = [
        'form_data' => $formData,
        'api_response' => $apiResponse,
        'timestamp' => date('Y-m-d H:i:s')
    ];
    // ...existing code...
    $unexpectedFile = __DIR__ . '/unexpected_responses_' . date('Y-m-d') . '.json';
    $existingUnexpected = [];
    if (file_exists($unexpectedFile)) {
        $existingUnexpected = json_decode(file_get_contents($unexpectedFile), true) ?? [];
    }
    $existingUnexpected[] = $unexpectedData;
    file_put_contents($unexpectedFile, json_encode($existingUnexpected, JSON_PRETTY_PRINT));
    // ...existing code...
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
