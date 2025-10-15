<?php
// Script to add date_of_birth column to existing form_submissions table
require_once 'config/db.php';

try {
    // Check if the column already exists
    $checkColumnSql = "SHOW COLUMNS FROM form_submissions LIKE 'date_of_birth'";
    $result = $conn->query($checkColumnSql);
    
    if ($result && $result->num_rows == 0) {
        // Column does not exist, add it
        $addColumnSql = "ALTER TABLE form_submissions ADD COLUMN date_of_birth DATE DEFAULT NULL AFTER previousname";
        if ($conn->query($addColumnSql) === TRUE) {
            echo "Column 'date_of_birth' added to 'form_submissions' table successfully.<br>";
        } else {
            throw new Exception("Error adding column: " . $conn->error);
        }
    } else {
        echo "Column 'date_of_birth' already exists in 'form_submissions' table.<br>";
    }
    
    echo "Database migration for date_of_birth complete!";
    
} catch (Exception $e) {
    die("Database migration failed: " . $e->getMessage());
} finally {
    if (isset($conn) && $conn) {
        $conn->close();
    }
}
?>
