<?php

/**
 * Ramingo CMS - API Entry Point
 */

require_once __DIR__ . '/../vendor/autoload.php';

use Ramingo\Core\Application;
use Ramingo\Core\Router;
use Ramingo\Core\Request;
use Ramingo\Core\Response;

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Initialize application
$app = Application::getInstance(__DIR__ . '/..');

// Create router
$router = new Router();

// Health check endpoint
$router->get('/api/health', function(Request $request) use ($app) {
    return Response::json([
        'status' => 'ok',
        'version' => '0.1.0',
        'timestamp' => date('c'),
        'environment' => $app->config('app.env'),
        'debug' => $app->isDebug()
    ]);
});

// API info endpoint
$router->get('/api', function(Request $request) {
    return Response::json([
        'name' => 'Ramingo CMS API',
        'version' => '0.1.0',
        'endpoints' => [
            'GET /api/health' => 'Health check',
            'GET /api' => 'API information',
        ]
    ]);
});

// Test endpoint
$router->get('/api/test', function(Request $request) {
    return Response::json([
        'message' => 'API is working!',
        'path' => $request->getPath(),
        'method' => $request->getMethod(),
        'query' => $request->query('test'),
    ]);
});

// Test POST endpoint
$router->post('/api/test', function(Request $request) {
    return Response::json([
        'message' => 'POST request received',
        'data' => $request->all()
    ]);
});

// Dispatch request
try {
    $request = new Request();
    $response = $router->dispatch($request);
    $response->send();
} catch (\Throwable $e) {
    $response = Response::json([
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ], 500);
    $response->send();
}
