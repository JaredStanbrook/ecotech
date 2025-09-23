<?php
// server/addToCart.php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Invalid request method');
}

$productId = intval($_POST['productId'] ?? 0);
$quantity = intval($_POST['quantity'] ?? 1);
if (!$productId) jsonResponse(false, 'Product ID required');

$conn = getDBConnection();
$userId = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;
$sessionId = getSessionId();

try {
    // Check if item exists
    $sql = "SELECT cart_id, quantity FROM cart_items WHERE product_id = ? AND " . ($userId ? "user_id = ?" : "session_id = ?");
    $params = [$productId, $userId ?: $sessionId];
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    $item = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($item) {
        // Update quantity
        $newQty = $item['quantity'] + $quantity;
        $updateSql = "UPDATE cart_items SET quantity = ? WHERE cart_id = ?";
        $conn->prepare($updateSql)->execute([$newQty, $item['cart_id']]);
    } else {
        // Insert new item
        $insertSql = "INSERT INTO cart_items (product_id, quantity, " . ($userId ? "user_id" : "session_id") . ") VALUES (?, ?, ?)";
        $conn->prepare($insertSql)->execute([$productId, $quantity, $userId ?: $sessionId]);
    }
    jsonResponse(true, 'Product added to cart');
} catch (Exception $e) {
    jsonResponse(false, 'Error adding to cart');
}
?>