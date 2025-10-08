<?php
// server/checkout.php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Invalid request method');
}

if (!isLoggedIn()) {
    jsonResponse(false, 'You must be logged in to checkout');
}

$userId = $_SESSION['user_id'];
$conn = getDBConnection();

try {
    // Get cart items
    $stmt = $conn->prepare("SELECT product_id, quantity FROM cart_items WHERE user_id = ?");
    $stmt->execute([$userId]);
    $cartItems = $stmt->fetchAll(PDO::FETCH_ASSOC);
    if (!$cartItems) jsonResponse(false, 'Cart is empty');

    // Calculate total and check stock
    $total = 0;
    foreach ($cartItems as $item) {
        $prodStmt = $conn->prepare("SELECT price, stock_quantity FROM products WHERE product_id = ?");
        $prodStmt->execute([$item['product_id']]);
        $prod = $prodStmt->fetch(PDO::FETCH_ASSOC);
        if (!$prod || $prod['stock_quantity'] < $item['quantity']) {
            jsonResponse(false, 'Insufficient stock for product ID ' . $item['product_id']);
        }
        $total += $prod['price'] * $item['quantity'];
    }

    // Create order
    $orderStmt = $conn->prepare("INSERT INTO orders (user_id, total_amount) VALUES (?, ?)");
    $orderStmt->execute([$userId, $total]);
    $orderId = $conn->lastInsertId();

    // Add order items and update stock
    foreach ($cartItems as $item) {
        $prodStmt = $conn->prepare("SELECT price FROM products WHERE product_id = ?");
        $prodStmt->execute([$item['product_id']]);
        $prod = $prodStmt->fetch(PDO::FETCH_ASSOC);
        $conn->prepare("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)")
            ->execute([$orderId, $item['product_id'], $item['quantity'], $prod['price']]);
        $conn->prepare("UPDATE products SET stock_quantity = stock_quantity - ? WHERE product_id = ?")
            ->execute([$item['quantity'], $item['product_id']]);
    }

    // Clear cart
    $conn->prepare("DELETE FROM cart_items WHERE user_id = ?")->execute([$userId]);

    jsonResponse(true, 'Order placed successfully!', ['orderId' => $orderId]);
} catch (Exception $e) {
    jsonResponse(false, 'Error during checkout');
}
?>