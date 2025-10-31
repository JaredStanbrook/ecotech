<?php
/**
 * Retrieves a single user's details by user ID for an admin level user
 * 
 * Supported HTTP Methods:
 * - GET
 * 
 * Expected GET Parameters:
 * - userId (int): ID of the user to retrieve.
 * 
 * Response:
 * - JSON { 
 *     success: bool, 
 *     message: string, 
 *     data?: object {
 *        user_id: int,
 *        username: string,
 *        email: string,
 *        user_type: string,
 *        first_name: string,
 *        last_name: string,
 *        phone: string,
 *        address: string,
 *        city: string,
 *        state: string,
 *        postcode: string
 *     }
 *   }
 */

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(false, 'Invalid request method');
}

if (!isStaff()) {
    jsonResponse(false, 'Staff access required');
}

$userId = intval($_GET['userId']);
if (!$userId) {
    jsonResponse(false, 'User ID required');
}

try {
    $conn = getDBConnection();
    $stmt = $conn->prepare("SELECT * FROM users WHERE user_id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        jsonResponse(true, '', $user);
    } else {
        jsonResponse(false, 'User not found');
    }
} catch (Exception $e) {
    jsonResponse(false, 'Error fetching user data');
}
?>
