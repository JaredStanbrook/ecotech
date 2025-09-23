<?php
// server/categories.php
require_once 'config.php';

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(false, 'Invalid request method');
}

try {
    $conn = getDBConnection();
    $stmt = $conn->prepare("SELECT * FROM categories ORDER BY category_name ASC");
    $stmt->execute();
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
    jsonResponse(true, '', $categories);
} catch (Exception $e) {
    jsonResponse(false, 'Error fetching categories');
}
?>