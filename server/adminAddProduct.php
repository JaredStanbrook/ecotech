<?php
/**
 * Adds a product to the database for an admin level user
 * 
 * Supported HTTP Methods:
 * - POST
 * 
 * Expected POST parameters:
 * - name (string)
 * - category (string)
 * - description (string)
 * - price (float)
 * - stock (int)
 * - rating (int)
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

$name = sanitizeInput($_POST['name'] ?? '');
$category = intval($_POST['category'] ?? 0);
$description = sanitizeInput($_POST['description'] ?? '');
$price = floatval($_POST['price'] ?? 0);
$stock = intval($_POST['stock'] ?? 0);
$rating = intval($_POST['rating'] ?? 5);

if (!$name || !$category || $price <= 0) {
    jsonResponse(false, 'Product name, category, and valid price are required');
}

try {
    $conn = getDBConnection();
    $stmt = $conn->prepare("INSERT INTO products (product_name, category_id, description, price, stock_quantity, eco_rating) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$name, $category, $description, $price, $stock, $rating]);
    jsonResponse(true, 'Product added successfully');
} catch (Exception $e) {
    jsonResponse(false, 'Error adding product');
}
?>