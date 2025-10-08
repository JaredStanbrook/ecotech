<?php
// adminGetOrderDetails.php - Fetch detailed information for a specific order
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

// Validate order ID parameter
if (!isset($_GET['orderId']) || !is_numeric($_GET['orderId'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid order ID provided.'
    ]);
    exit;
}

$orderId = intval($_GET['orderId']);

require_once 'config.php';

try {
    // Create database connection
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    
    if ($conn->connect_error) {
        throw new Exception('Database connection failed: ' . $conn->connect_error);
    }
    
    // Fetch order details with customer information
    $orderQuery = "
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
            u.phone as customer_phone,
            CONCAT(u.first_name, ' ', u.last_name) as customer_name,
            u.first_name,
            u.last_name
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.user_id
        WHERE o.order_id = ?
    ";
    
    $stmt = $conn->prepare($orderQuery);
    
    if (!$stmt) {
        throw new Exception('Failed to prepare statement: ' . $conn->error);
    }
    
    $stmt->bind_param('i', $orderId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        $stmt->close();
        $conn->close();
        echo json_encode([
            'success' => false,
            'message' => 'Order not found.'
        ]);
        exit;
    }
    
    $order = $result->fetch_assoc();
    $stmt->close();
    
    // Fetch order items with product details
    $itemsQuery = "
        SELECT 
            oi.item_id,
            oi.product_id,
            oi.quantity,
            oi.price,
            p.product_name,
            p.description as product_description,
            p.image_url,
            c.category_name
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.product_id
        LEFT JOIN categories c ON p.category_id = c.category_id
        WHERE oi.order_id = ?
        ORDER BY oi.item_id
    ";
    
    $itemsStmt = $conn->prepare($itemsQuery);
    
    if (!$itemsStmt) {
        throw new Exception('Failed to prepare items statement: ' . $conn->error);
    }
    
    $itemsStmt->bind_param('i', $orderId);
    $itemsStmt->execute();
    $itemsResult = $itemsStmt->get_result();
    
    $items = [];
    $itemsTotal = 0;
    
    while ($item = $itemsResult->fetch_assoc()) {
        $subtotal = floatval($item['price']) * intval($item['quantity']);
        $item['subtotal'] = $subtotal;
        $itemsTotal += $subtotal;
        $items[] = $item;
    }
    
    $itemsStmt->close();
    $conn->close();
    
    // Add items to order array
    $order['items'] = $items;
    $order['items_count'] = count($items);
    $order['items_total'] = $itemsTotal;
    
    echo json_encode([
        'success' => true,
        'data' => $order
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching order details: ' . $e->getMessage()
    ]);
}
?>