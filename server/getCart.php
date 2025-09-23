<?php
// server/cart.php
require_once 'config.php';

// Only allow GET or POST requests
if (!in_array($_SERVER['REQUEST_METHOD'], ['GET', 'POST'])) {
    jsonResponse(false, 'Invalid request method');
}

$conn = getDBConnection();
$sessionId = getSessionId();
$userId = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // List cart items for current user/session
    try {
        $sql = "SELECT ci.cart_id, ci.product_id, ci.quantity, p.product_name, p.price, p.image_url FROM cart_items ci JOIN products p ON ci.product_id = p.product_id WHERE ";
        if ($userId) {
            $sql .= "ci.user_id = ?";
            $params = [$userId];
        } else {
            $sql .= "ci.session_id = ?";
            $params = [$sessionId];
        }
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
        jsonResponse(true, '', $items);
    } catch (Exception $e) {
        jsonResponse(false, 'Error fetching cart items');
    }
} else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Add, update, or remove cart item
    $action = sanitizeInput($_POST['action'] ?? '');
    $productId = intval($_POST['product_id'] ?? 0);
    $quantity = intval($_POST['quantity'] ?? 1);
    if (!$productId) jsonResponse(false, 'Product ID required');
    try {
        if ($action === 'add') {
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
            jsonResponse(true, 'Item added to cart');
        } elseif ($action === 'remove') {
            $sql = "DELETE FROM cart_items WHERE product_id = ? AND " . ($userId ? "user_id = ?" : "session_id = ?");
            $params = [$productId, $userId ?: $sessionId];
            $conn->prepare($sql)->execute($params);
            jsonResponse(true, 'Item removed from cart');
        } elseif ($action === 'update') {
            $sql = "UPDATE cart_items SET quantity = ? WHERE product_id = ? AND " . ($userId ? "user_id = ?" : "session_id = ?");
            $params = [$quantity, $productId, $userId ?: $sessionId];
            $conn->prepare($sql)->execute($params);
            jsonResponse(true, 'Cart item updated');
        } else {
            jsonResponse(false, 'Invalid cart action');
        }
    } catch (Exception $e) {
        jsonResponse(false, 'Error updating cart');
    }
}
?>