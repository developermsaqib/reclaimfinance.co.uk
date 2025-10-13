<?php
// webhook-proxy.php
// Accepts JSON payload from client and forwards to LeadConnector webhook

header('Content-Type: application/json');

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$input = file_get_contents('php://input');
if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Empty request body']);
    exit;
}

$data = json_decode($input, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON']);
    exit;
}

// Prepare cURL to forward to LeadConnector webhook
$webhookUrl = 'https://services.leadconnectorhq.com/hooks/zBJu5qJyHfFxo3pOO1k5/webhook-trigger/5ec57cc7-9c6f-49b8-b352-315993502538';
$authHeader = 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6InpCSnU1cUp5SGZGeG8zcE9PMWs1IiwidmVyc2lvbiI6MSwiaWF0IjoxNzU5ODQ5OTczMzc3LCJzdWIiOiJSUnl2dVB4NlV6ZndiTWttWlgwRiJ9.0i7D0WWzD-Izse3DmNEsvDanvNQ_soNGWUffh56quvA';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $webhookUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    $authHeader
]);

$response = curl_exec($ch);
$err = curl_error($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($err) {
    http_response_code(502);
    echo json_encode(['success' => false, 'error' => 'Curl error', 'detail' => $err]);
    exit;
}

// Try to decode response if possible
$decoded = json_decode($response, true);

// Return the webhook response and status
http_response_code($httpCode ?: 200);
if ($decoded !== null) {
    echo json_encode(['success' => true, 'status' => $httpCode, 'response' => $decoded]);
} else {
    echo json_encode(['success' => true, 'status' => $httpCode, 'response' => $response]);
}

?>
