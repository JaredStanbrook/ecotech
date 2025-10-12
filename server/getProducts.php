<?php
/**
 * Retrieves all products
 * 
 * Supported HTTP Methods:
 * - GET
 * 
 * Response:
 * - JSON { 
 *    success: bool,
 *    message: string,
 *    data: object {
 *      product_name: string,
 *      category_id: int,
 *      description: string,
 *      price: float,
 *      stock_quantity: int,
 *      image_url: string,
 *      specifications: string,
 *      eco_rating: int,
 *      created_at: string,
 *      updated_at: string
 *      category_name: string,
 *    } 
 *  }
 */
require_once 'config.php';

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(false, 'Invalid request method');
}

$categoryId = isset($_GET['category_id']) ? intval($_GET['category_id']) : null;
$search = isset($_GET['search']) ? sanitizeInput($_GET['search']) : null;

try {
    $conn = getDBConnection();
    $sql = "SELECT p.*, c.category_name FROM products p LEFT JOIN categories c ON p.category_id = c.category_id WHERE 1";
    $params = [];
    if ($categoryId) {
        $sql .= " AND p.category_id = ?";
        $params[] = $categoryId;
    }
    if ($search) {
        $sql .= " AND (p.product_name LIKE ? OR p.description LIKE ?)";
        $params[] = "%$search%";
        $params[] = "%$search%";
    }
    $sql .= " ORDER BY p.product_name ASC";
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    jsonResponse(true, '', $products);
} catch (Exception $e) {
    jsonResponse(false, 'Failed to load products.');
}
?>