<?php
/**
 * Returns all users for admin user management panel
 * 
 * Supported HTTP Methods:
 * - GET: Retrieve all users
 *
 * Responses:
 *  GET:
 *  - JSON { 
 *      success: bool, 
 *      message: string, 
 *      data: array<object> [
 *        {
 *          user_id: int,
 *          username: string,
 *          email: string,
 *          user_type: string,
 *          firstName: string,
 *          lastName: string,
 *          phone: string,
 *          address: string,
 *          city: string,
 *          state: string,
 *          postcode: string
 *        },
 *        ...
 *      ]
 *    }
 * 
 *  POST:
 *  - JSON { success: bool, message: string }
 */
require_once 'config.php';

if (!isStaff()) {
    jsonResponse(false, 'Staff access required');
}

$conn = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // List all users for admin panel
    try {
        $stmt = $conn->prepare("SELECT * FROM users ORDER BY user_id ASC");
        $stmt->execute();
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        jsonResponse(true, '', $users);
    } catch (Exception $e) {
        jsonResponse(false, 'Error fetching users');
    }
} else {
    jsonResponse(false, 'Invalid request method');
}
?>
