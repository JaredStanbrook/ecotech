<?php
/**
 * Check User Session EndpointVerifies whether a user is currently logged in and
 * returns their session details. Expects an HTTP GET request.
 * 
 * Supported HTTP Methods:
 * - GET
 * 
 * Response:
 * - JSON { success: bool, 
 *          message: string,
 *          data: object {
 *            userId: int,
 *            username: string,
 *            firstName: string,
 *            lastName: string,
 *            userType: string
 *          }
 *        }
 */ 
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(false, 'Invalid request method');
}

if (isLoggedIn()) {
    jsonResponse(true, '', [
        'userId' => $_SESSION['user_id'],
        'username' => $_SESSION['username'],
        'firstName' => $_SESSION['first_name'],
        'lastName' => $_SESSION['last_name'],
        'userType' => $_SESSION['user_type']
    ]);
} else {
    jsonResponse(false, 'Not logged in');
}
?>
