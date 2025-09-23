<?php
// server/getAccountInfo.php
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