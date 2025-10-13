<?php
$host = 'sdb-c.hosting.stackcp.net';
$dbname = 'reclaims_finance-31373147c8';
$username = 'root';  // Replace with your database username
$password = 'hwf7etr8p8';      // Replace with your database password

try {
    $conn = new mysqli($host, $username, $password, $dbname);
    
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    
    // Set charset to utf8mb4
    if (!$conn->set_charset("utf8mb4")) {
        throw new Exception("Error setting charset: " . $conn->error);
    }
} catch (Exception $e) {
    die("Database connection failed: " . $e->getMessage());
}
?>