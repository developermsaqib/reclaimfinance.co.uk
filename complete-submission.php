<?php
header('Content-Type: application/json');
require_once 'config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
if (!$data || !isset($data['token']) || !isset($data['signature'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid data']);
    exit;
}

try {
    // Update the submission
    $stmt = $conn->prepare("
        UPDATE form_submissions 
        SET signature_long = ?,
            authority_accepted = 1,
            completed = 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE token = ? 
        AND expires_at > NOW() 
        AND completed = 0"
    );

    $stmt->bind_param("ss", $data['signature'], $data['token']);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode(['success' => true, 'message' => 'Submission completed successfully']);
        } else {
            throw new Exception('No valid submission found or already completed');
        }
    } else {
        throw new Exception('Failed to update submission');
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>