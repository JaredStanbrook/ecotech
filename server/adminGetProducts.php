<?php
/**
 * Product Management Endpoint
 * 
 * Supported HTTP Methods:
 * - GET: Retrieve all products
 * - POST: add, update, or delete actions on products
 *
 * Expected POST Parameters:
 * - action (string): 'add', 'update', or 'delete'
 * - product_id (int)
 * - product_name (string)
 * - category_id (int)
 * - description (string)
 * - price (float)
 * - stock_quantity (int)
 * - image_url (string)
 * - specifications (string)
 * - eco_rating (int)
 *
 * Responses:
 *  GET:
 *  - JSON { success: bool, 
 *           message: string, 
 *           data: array<object> [
 *            {
 *              product_id: int,
 *              product_name: string,
 *              category_id: int,
 *              description: string,
 *              price: float,
 *              stock_quantity: int,
 *              image_url: string,
 *              specifications: string,
 *              eco_rating: int
 *            },
 *              ...
 *           ]
 *         }
 *  POST:
 *  - JSON { success: bool, message: string }
 */
require_once 'config.php';

if (!isStaff()) {
    jsonResponse(false, 'Staff access required');
}

$conn = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // List all products (for admin panel)
    try {
        $stmt = $conn->prepare("SELECT * FROM products ORDER BY product_name ASC");
        $stmt->execute();
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        jsonResponse(true, '', $products);
    } catch (Exception $e) {
        jsonResponse(false, 'Error fetching products');
    }
} elseif ($method === 'POST') {
    $action = sanitizeInput($_POST['action'] ?? '');
    $productId = intval($_POST['product_id'] ?? 0);
    $productName = sanitizeInput($_POST['product_name'] ?? '');
    $categoryId = intval($_POST['category_id'] ?? 0);
    $description = sanitizeInput($_POST['description'] ?? '');
    $price = floatval($_POST['price'] ?? 0);
    $stock = intval($_POST['stock_quantity'] ?? 0);
    $imageUrl = sanitizeInput($_POST['image_url'] ?? '');
    $specs = sanitizeInput($_POST['specifications'] ?? '');
    $ecoRating = intval($_POST['eco_rating'] ?? 0);
    try {
        if ($action === 'add') {
            $stmt = $conn->prepare("INSERT INTO products (product_name, category_id, description, price, stock_quantity, image_url, specifications, eco_rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$productName, $categoryId, $description, $price, $stock, $imageUrl, $specs, $ecoRating]);
            jsonResponse(true, 'Product added');
        } elseif ($action === 'update' && $productId) {
            $stmt = $conn->prepare("UPDATE products SET product_name = ?, category_id = ?, description = ?, price = ?, stock_quantity = ?, image_url = ?, specifications = ?, eco_rating = ? WHERE product_id = ?");
            $stmt->execute([$productName, $categoryId, $description, $price, $stock, $imageUrl, $specs, $ecoRating, $productId]);
            jsonResponse(true, 'Product updated');
        } elseif ($action === 'delete' && $productId) {
            $stmt = $conn->prepare("DELETE FROM products WHERE product_id = ?");
            $stmt->execute([$productId]);
            jsonResponse(true, 'Product deleted');
        } else {
            jsonResponse(false, 'Invalid action or missing product ID');
        }
    } catch (Exception $e) {
        jsonResponse(false, 'Error managing product');
    }
} else {
    jsonResponse(false, 'Invalid request method');
}
?>