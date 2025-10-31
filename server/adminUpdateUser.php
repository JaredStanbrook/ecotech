<?php
/**
 * Updates a user's details for an admin level user.
 * 
 * Supported HTTP Methods:
 * - POST
 * 
 * Expected POST parameters:
 * - user_id (int) – ID of the user to update
 * - username, first_name, last_name, user_type (required)
 * - password (optional)
 * - email, phone, address, city, state, postcode (optional)
 * 
 * Response:
 * - JSON { success: bool, message: string }
 */
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Invalid request method');
}

if (!isStaff()) {
    jsonResponse(false, 'Staff access required');
}

$userId = intval($_POST['user_id'] ?? 0);
$username = sanitizeInput($_POST['username'] ?? '');
$email = sanitizeInput($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';
$firstName = sanitizeInput($_POST['first_name'] ?? '');
$lastName = sanitizeInput($_POST['last_name'] ?? '');
$userType = sanitizeInput($_POST['user_type'] ?? 'customer');
$phone = sanitizeInput($_POST['phone'] ?? '');
$address = sanitizeInput($_POST['address'] ?? '');
$city = sanitizeInput($_POST['city'] ?? '');
$state = sanitizeInput($_POST['state'] ?? '');
$postcode = sanitizeInput($_POST['postcode'] ?? '');

if (!$userId) {
    jsonResponse(false, 'User ID required');
}

// Required fields
if (!$username || !$firstName || !$lastName) {
    jsonResponse(false, 'Required fields cannot be empty');
}

try {
    $conn = getDBConnection();

    if ($password) {
        // update everything, including password
        $stmt = $conn->prepare("UPDATE users 
                                SET username = ?, password = SHA2(?, 256), email = ?, user_type = ?, 
                                    first_name = ?, last_name = ?, phone = ?, address = ?, city = ?, 
                                    state = ?, postcode = ? 
                                WHERE user_id = ?");
        $stmt->execute([$username, $password, $email, $userType, $firstName, $lastName, $phone, $address, $city, $state, $postcode, $userId]);
    } else {
        // update everything except password
        $stmt = $conn->prepare("UPDATE users 
                                SET username = ?, email = ?, user_type = ?, 
                                    first_name = ?, last_name = ?, phone = ?, address = ?, city = ?, 
                                    state = ?, postcode = ? 
                                WHERE user_id = ?");
        $stmt->execute([$username, $email, $userType, $firstName, $lastName, $phone, $address, $city, $state, $postcode, $userId]);
    }

    jsonResponse(true, 'User updated successfully');

} catch (Exception $e) {
    jsonResponse(false, 'Error updating user');
}
?>
