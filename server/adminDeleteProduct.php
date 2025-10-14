<?php
/**
 * Removes a product from the database for an admin level user
 * 
 * Supported HTTP Methods:
 * - POST
 * 
 * Expected POST parameters:
 * - productId (int): ID of the product to remove from the database.
 * 
 * Response:
 * - JSON { success: bool, message: string }
 */
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