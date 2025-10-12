<?php
/**
 * Handles user logout and starts a new session.
 *
 * Request Method:
 * - POST
 *
 * Response:
 * - JSON { success: bool, message: string }
 */
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Invalid request method');
}

// Clear all session data
session_unset();
session_destroy();

// Start a new session for cart functionality
session_start();

jsonResponse(true, 'Logged out successfully');
?>