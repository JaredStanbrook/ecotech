<?php
// Server/checkSession.php
require_once 'config.php';

if (isLoggedIn()) {
    jsonResponse(true, '', [
        'userId' => $_SESSION['user_id'],
        'username' => $_SESSION['username'],
        'firstName' => $_SESSION['first_name'],
        'lastName' => $_SESSION['last_name'],
        'userType' => $_SESSION['user_type']
    ]);
} else {
    jsonResponse(false, 'Not logged in');
}
?>
