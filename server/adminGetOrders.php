<?php
// adminGetOrders.php - Fetch all orders with customer information for admin panel
session_start();
header('Content-Type: application/json');

// Check if user is logged in and is staff
if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'staff') {
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized access. Staff privileges required.'
    ]);
    exit;
}

require_once 'config.php';

try {
    // Create database connection
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    
    if ($conn->connect_error) {
        throw new Exception('Database connection failed: ' . $conn->connect_error);
    }
    
    // Fetch all orders with customer information and item counts
    $query = "
        SELECT 
            o.order_id,
            o.user_id,
            o.order_date,
            o.total_amount,
            o.status,
            o.shipping_address,
            o.shipping_city,
            o.shipping_state,
            o.shipping_postcode,
            u.username as customer_username,
            u.email as customer_email,
            CONCAT(u.first_name, ' ', u.last_name) as customer_name,
            COUNT(oi.item_id) as item_count
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.user_id
        LEFT JOIN order_items oi ON o.order_id = oi.order_id
        GROUP BY o.order_id
        ORDER BY o.order_date DESC
    ";
    
    $result = $conn->query($query);
    
    if (!$result) {
        throw new Exception('Query failed: ' . $conn->error);
    }
    
    $orders = [];
    while ($row = $result->fetch_assoc()) {
        // For each order, also fetch the items
        $itemsQuery = "
            SELECT 
                oi.item_id,
                oi.quantity,
                oi.price,
                p.product_name
            FROM order_items oi
            LEFT JOIN products p ON oi.product_id = p.product_id
            WHERE oi.order_id = ?
        ";
        
        $itemsStmt = $conn->prepare($itemsQuery);
        $itemsStmt->bind_param('i', $row['order_id']);
        $itemsStmt->execute();
        $itemsResult = $itemsStmt->get_result();
        
        $items = [];
        while ($item = $itemsResult->fetch_assoc()) {
            $items[] = $item;
        }
        
        $row['items'] = $items;
        $orders[] = $row;
        
        $itemsStmt->close();
    }
    
    $conn->close();
    
    echo json_encode([
        'success' => true,
        'data' => $orders,
        'count' => count($orders)
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching orders: ' . $e->getMessage()
    ]);
}
?>