<?php
// Database configuration for EcoTech Supplies
// Server/config.php

// Database connection parameters
define('DB_HOST', 'localhost');
define('DB_NAME', 'ecotech_supplies');
define('DB_USER', 'ecotech');  // Change this for production
define('DB_PASS', 'password');      // Change this for production

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

/**
 * Establishes and returns a PDO database connection.
 *
 * @return PDO The PDO database connection object
 * @throws PDOException If the database connection fails
 */
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

/**
 * Checks if the current user is logged in.
 *
 * @return bool True if the user is logged in, false otherwise
 */
function isLoggedIn() {
    return isset($_SESSION['user_id']) && isset($_SESSION['username']);
}

/**
 * Checks if the current user has a staff account type.
 *
 * @return bool True if the user is staff, false otherwise
 */
function isStaff() {
    return isset($_SESSION['user_type']) && $_SESSION['user_type'] === 'staff';
}

/**
 * Checks if the current user has a customer account type.
 *
 * @return bool True if the user is a customer, false otherwise
 */
function isCustomer() {
    return isset($_SESSION['user_type']) && $_SESSION['user_type'] === 'customer';
}

/**
 * Retrieves the current session ID, creating one if it does not exist.
 *
 * @return string The current session ID.
 */
function getSessionId() {
    if (!isset($_SESSION['session_id'])) {
        $_SESSION['session_id'] = session_id();
    }
    return $_SESSION['session_id'];
}

/**
 * Sanitizes user input by trimming, stripping slashes, and escaping HTML characters.
 *
 * @param string $data The input data to sanitize.
 * @return string The sanitized input.
 */
function sanitizeInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

/**
 * Validates whether the an email address is in a valid format.
 *
 * @param string $email The email address to validate.
 * @return bool|string Returns the filtered email address if valid, false if invalid.
 */
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

/**
 * Sends a standardised JSON response and exits script execution.
 *
 * @param bool $success Indicates the success status of the response.
 * @param string $message Optional message to include in the response.
 * @param mixed $data Optional additional data to include in the response.
 */
function jsonResponse($success, $message = '', $data = null) {
    $response = ['success' => $success];
    if ($message) $response['message'] = $message;
    if ($data !== null) $response['data'] = $data;
    
    header('Content-Type: application/json');
    echo json_encode($response);
    exit();
}
?>
