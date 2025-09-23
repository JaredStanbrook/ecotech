<?php
// Database configuration for EcoTech Supplies
// Server/config.php

// Database connection parameters
define('DB_HOST', 'localhost');
define('DB_NAME', 'ecotech_supplies');
define('DB_USER', 'root');  // Change this for production
define('DB_PASS', '');      // Change this for production

// Application settings
define('APP_NAME', 'EcoTech Supplies');
define('APP_VERSION', '1.0.0');
define('SESSION_TIMEOUT', 3600); // 1 hour in seconds

// Enable error reporting for development (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Start session if not already started
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

// Set timezone
date_default_timezone_set('Australia/Perth');

// CORS headers for Ajax requests
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

// Database connection function
function getDBConnection() {
    try {
        $conn = new PDO(
            "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
            DB_USER,
            DB_PASS,
            array(PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION)
        );
        return $conn;
    } catch(PDOException $e) {
        die(json_encode(['success' => false, 'message' => 'Connection failed: ' . $e->getMessage()]));
    }
}

// Utility function to check if user is logged in
function isLoggedIn() {
    return isset($_SESSION['user_id']) && isset($_SESSION['username']);
}

// Utility function to check if user is staff
function isStaff() {
    return isset($_SESSION['user_type']) && $_SESSION['user_type'] === 'staff';
}

// Utility function to check if user is customer
function isCustomer() {
    return isset($_SESSION['user_type']) && $_SESSION['user_type'] === 'customer';
}

// Get or create session ID for cart
function getSessionId() {
    if (!isset($_SESSION['session_id'])) {
        $_SESSION['session_id'] = session_id();
    }
    return $_SESSION['session_id'];
}

// Sanitize input
function sanitizeInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

// Validate email
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

// Generate JSON response
function jsonResponse($success, $message = '', $data = null) {
    $response = ['success' => $success];
    if ($message) $response['message'] = $message;
    if ($data !== null) $response['data'] = $data;
    
    header('Content-Type: application/json');
    echo json_encode($response);
    exit();
}
?>
