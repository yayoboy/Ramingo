<?php

/**
 * Router script for PHP built-in development server
 * Use: php -S localhost:8000 -t public router.php
 */

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

// Serve static files directly
if ($uri !== '/' && file_exists(__DIR__ . '/public' . $uri)) {
    return false;
}

// API requests
if (str_starts_with($uri, '/api')) {
    require __DIR__ . '/public/api.php';
    return true;
}

// Admin panel
if (str_starts_with($uri, '/admin')) {
    require __DIR__ . '/public/admin.html';
    return true;
}

// Public site
require __DIR__ . '/public/index.php';
return true;
