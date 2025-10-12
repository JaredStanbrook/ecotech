<?php
/**
 * Returns user account info for a logged-in user.
 * 
 * Supported HTTP Methods:
 * - GET
 *
 * Responses:
 *  - JSON { 
 *  success: bool, 
 *  message: string, 
 *  data: object { 
 *    user: object {
 *      user_id: int,
 *      username: string,
 *      email: string,
 *      user_type: string,
 *      first_name: string,
 *      last_name: string
 *    }, 
 *    orders: object {
 *      order_id: int,
 *      user_id: int,
 *      order_date: string,
 *      total_amount: float,
 *      status: string,
 *      shipping_address: string,
 *      shipping_city: string,
 *      shipping_state: string,
 *      shipping_postcode: string
 *    } 
 *  }
 *}
 */
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(false, 'Invalid request method');
}

if (!isLoggedIn()) {
    jsonResponse(false, 'You must be logged in to view account info');
}

$userId = $_SESSION['user_id'];

try {
    $conn = getDBConnection();
    // Get user info
    $stmt = $conn->prepare("SELECT user_id, username, email, user_type, first_name, last_name FROM users WHERE user_id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    // Get orders
    $ordersStmt = $conn->prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY order_date DESC");
    $ordersStmt->execute([$userId]);
    $orders = $ordersStmt->fetchAll(PDO::FETCH_ASSOC);
    jsonResponse(true, '', ['user' => $user, 'orders' => $orders]);
} catch (Exception $e) {
    jsonResponse(false, 'Error fetching account info');
}
?>