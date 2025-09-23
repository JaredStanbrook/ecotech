<?php
// server/adminDeleteProduct.php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Invalid request method');
}

if (!isStaff()) {
    jsonResponse(false, 'Staff access required');
}

$productId = intval($_POST['productId'] ?? 0);
if (!$productId) {
    jsonResponse(false, 'Product ID required');
}

try {
    $conn = getDBConnection();
    $stmt = $conn->prepare("DELETE FROM products WHERE product_id = ?");
    $stmt->execute([$productId]);
    if ($stmt->rowCount() > 0) {
        jsonResponse(true, 'Product deleted successfully');
    } else {
        jsonResponse(false, 'Product not found');
    }
} catch (Exception $e) {
    jsonResponse(false, 'Error deleting product');
}
?>