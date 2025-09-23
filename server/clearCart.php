<?php
// server/clearCart.php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Invalid request method');
}

$conn = getDBConnection();
$userId = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;
$sessionId = getSessionId();

try {
    $sql = "DELETE FROM cart_items WHERE " . ($userId ? "user_id = ?" : "session_id = ?");
    $params = [$userId ?: $sessionId];
    $conn->prepare($sql)->execute($params);
    jsonResponse(true, 'Cart cleared');
} catch (Exception $e) {
    jsonResponse(false, 'Error clearing cart');
}
?>