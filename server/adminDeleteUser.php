<?php
/**
 * Removes a user from the database for an admin level user
 * 
 * Supported HTTP Methods:
 * - POST
 * 
 * Expected POST parameters:
 * - userId (int): ID of the user to remove from the database.
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

$userId = intval($_POST['userId'] ?? 0);
if (!$userId) {
    jsonResponse(false, 'User ID required');
}

try {
    $conn = getDBConnection();
    $stmt = $conn->prepare("DELETE FROM users WHERE user_id = ?");
    $stmt->execute([$userId]);
    if ($stmt->rowCount() > 0) {
        jsonResponse(true, 'User deleted successfully');
    } else {
        jsonResponse(false, 'User not found');
    }
} catch (Exception $e) {
    jsonResponse(false, 'Error deleting user');
}
?>
