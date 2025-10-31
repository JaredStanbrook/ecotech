<?php
/**
 * Handles user login authentication.
 *
 * Accept a POST request containing a username and password. Verifies the 
 * credentials against the database, and starts a user session if successful.
 *
 * Request Method:
 * - POST
 *
 * Expected POST Parameters:
 * - username (string)
 * - password (string)
 *
 * Response:
 * - JSON {
 *    success: bool,
 *    message: string,
 *    data: object {
 *      username: string,
 *      email: string,
 *      user_type: string,
 *      first_name: string,
 *      last_name: string
 *    }
 *  }
 *
 * @throws Exception If the database query or login process fails.
 */
require_once 'config.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Invalid request method');
}

$username = sanitizeInput($_POST['username'] ?? '');
$password = $_POST['password'] ?? '';

if (empty($username) || empty($password)) {
    jsonResponse(false, 'Username and password are required');
}

try {
    $conn = getDBConnection();
    
    $stmt = $conn->prepare("
        SELECT user_id, username, email, user_type, first_name, last_name 
        FROM users 
        WHERE username = ? AND password = SHA2(?, 256)
    ");
    
    $stmt->execute([$username, $password]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        $_SESSION['user_id'] = $user['user_id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['email'] = $user['email'];
        $_SESSION['user_type'] = $user['user_type'];
        $_SESSION['first_name'] = $user['first_name'];
        $_SESSION['last_name'] = $user['last_name'];
        
        // Update last login
        $updateStmt = $conn->prepare("UPDATE users SET last_login = NOW() WHERE user_id = ?");
        $updateStmt->execute([$user['user_id']]);
        
        jsonResponse(true, 'Login successful', [
            'userId' => $user['user_id'],
            'username' => $user['username'],
            'firstName' => $user['first_name'],
            'lastName' => $user['last_name'],
            'userType' => $user['user_type']
        ]);
    } else {
        jsonResponse(false, 'Invalid username or password');
    }
} catch (Exception $e) {
    jsonResponse(false, 'An error occurred during login');
}
?>
