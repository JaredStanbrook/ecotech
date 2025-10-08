<?php
// adminGetUsers.php - Fetch all users for admin panel
session_start();
header('Content-Type: application/json');

// Check if user is logged in and is staff
if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'staff') {
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized access. Staff privileges required.'
    ]);
    exit;
}

require_once 'config.php';

try {
    // Create database connection
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    
    if ($conn->connect_error) {
        throw new Exception('Database connection failed: ' . $conn->connect_error);
    }
    
    // Fetch all users with relevant information
    $query = "
        SELECT 
            user_id,
            username,
            email,
            user_type,
            first_name,
            last_name,
            phone,
            address,
            city,
            state,
            postcode,
            created_at,
            last_login
        FROM users
        ORDER BY created_at DESC
    ";
    
    $result = $conn->query($query);
    
    if (!$result) {
        throw new Exception('Query failed: ' . $conn->error);
    }
    
    $users = [];
    while ($row = $result->fetch_assoc()) {
        // Don't include password in the response
        $users[] = $row;
    }
    
    $conn->close();
    
    echo json_encode([
        'success' => true,
        'data' => $users,
        'count' => count($users)
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching users: ' . $e->getMessage()
    ]);
}
?>