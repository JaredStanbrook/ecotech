<?php
/**
 * Registers a new customer account.
 *
 * Accept a POST request containing a username and password. Verifies the 
 * credentials against the database, and starts a user session if successful.
 *
 * Request Method:
 * - POST
 *
 * Expected POST Parameters:
 * - username (string)
 * - email (string)
 * - password (string)
 * 
 * Optional POST Parameters:
 * - first_name (string)
 * - last_name (string)
 * - phone (string)
 * - address (string)
 * - city (string)
 * - state (string)
 * - postcode (string)
 *
 * Response:
 * - JSON { success: bool, message: string }
 *
 * @throws Exception If the database query fails.
 */
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Invalid request method');
}

$username = sanitizeInput($_POST['username'] ?? '');
$email = sanitizeInput($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';
// Additional fields
$firstName = sanitizeInput($_POST['first_name'] ?? '');
$lastName = sanitizeInput($_POST['last_name'] ?? '');
$userType = 'customer'; // Only allow customer registration
$phone = sanitizeInput($_POST['phone'] ?? '');
$address = sanitizeInput($_POST['address'] ?? '');
$city = sanitizeInput($_POST['city'] ?? '');
$state = sanitizeInput($_POST['state'] ?? '');
$postcode = sanitizeInput($_POST['postcode'] ?? '');

// Validate required fields
if (!$username || !$email || !$password) {
    jsonResponse(false, 'Username, email, and password are required');
}
if (!validateEmail($email)) {
    jsonResponse(false, 'Invalid email address');
}

try {
    $conn = getDBConnection();
    // Check if username or email exists
    $stmt = $conn->prepare("SELECT user_id FROM users WHERE username = ? OR email = ?");
    $stmt->execute([$username, $email]);
    if ($stmt->fetch()) {
        jsonResponse(false, 'Username or email already exists');
    }
    // Insert new user
    $insert = $conn->prepare("INSERT INTO users (username, password, email, user_type, first_name, last_name, phone, address, city, state, postcode) VALUES (?, SHA2(?, 256), ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $insert->execute([
        $username,
        $password,
        $email,
        $userType,
        $firstName,
        $lastName,
        $phone,
        $address,
        $city,
        $state,
        $postcode
    ]);
    jsonResponse(true, 'Registration successful! Please login.');
} catch (Exception $e) {
    jsonResponse(false, 'An error occurred. Please try again.');
}
