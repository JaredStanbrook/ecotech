<?php
/**
 * Returns all ecotech orders for admin view orders panel
 * 
 * Supported HTTP Methods:
 * - GET: Retrieve all orders
 *
 * Responses:
 *  GET:
 *  - JSON { 
 *      success: bool, 
 *      message: string, 
 *      data: array<object> [
 * order_id INT AUTO_INCREMENT PRIMARY KEY,
 *        {
 *          user_id: number,
 *          order_date: string,
 *          total_amount: number,
 *          status: string          
 *        },
 *        ...
 *      ]
 *    }
 * 
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
    // List all orders for admin panel
    try {
        $stmt = $conn->prepare("SELECT order_id, order_date, user_id, total_amount, status FROM orders ORDER BY order_id ASC");
        $stmt->execute();
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
        jsonResponse(true, '', $orders);
    } catch (Exception $e) {
        jsonResponse(false, 'Error fetching orders');
    }
} else {
    jsonResponse(false, 'Invalid request method');
}
?>
