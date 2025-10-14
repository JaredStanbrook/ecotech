<?php
/**
 * Removes an item from the current user's cart if logged in, or from the current
 * session's cart.
 *
 * Request Method:
 * - POST
 *
 * Expected POST Parameters:
 * - productId (int)
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

$productId = intval($_POST['productId'] ?? 0);
if (!$productId) jsonResponse(false, 'Product ID required');

$conn = getDBConnection();
$userId = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;
$sessionId = getSessionId();

try {
    $sql = "DELETE FROM cart_items WHERE product_id = ? AND " . ($userId ? "user_id = ?" : "session_id = ?");
    $params = [$productId, $userId ?: $sessionId];
    $conn->prepare($sql)->execute($params);
    jsonResponse(true, 'Product removed from cart');
} catch (Exception $e) {
    jsonResponse(false, 'Error removing from cart');
}
?>