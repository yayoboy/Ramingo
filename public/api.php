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
            'POST /api/auth/login' => 'Login',
            'POST /api/auth/logout' => 'Logout',
            'GET /api/auth/me' => 'Get current user (protected)',
            'GET /api/sites' => 'List sites (protected)',
            'POST /api/sites' => 'Create site (protected)',
        ]
    ]);
});

// Auth routes (public)
$router->post('/api/auth/login', [\Ramingo\Api\Controllers\AuthController::class, 'login']);
$router->post('/api/auth/logout', [\Ramingo\Api\Controllers\AuthController::class, 'logout']);
$router->post('/api/auth/register', [\Ramingo\Api\Controllers\AuthController::class, 'register']);

// Protected routes - require authentication
$authMiddleware = new \Ramingo\Api\Middleware\AuthMiddleware();
$router->addMiddleware(function($request) use ($authMiddleware) {
    $path = $request->getPath();

    // Public routes that don't require authentication
    $publicPaths = [
        '/api',
        '/api/health',
        '/api/test',
        '/api/auth/login',
        '/api/auth/logout',
        '/api/auth/register'
    ];

    // Check for exact match
    if (in_array($path, $publicPaths, true)) {
        return null; // Continue without auth
    }

    // Require authentication for all other routes
    return $authMiddleware->handle($request);
});

// Protected: Current user
$router->get('/api/auth/me', [\Ramingo\Api\Controllers\AuthController::class, 'me']);

// Sites
$router->get('/api/sites', [\Ramingo\Api\Controllers\SiteController::class, 'index']);
$router->get('/api/sites/{id}', [\Ramingo\Api\Controllers\SiteController::class, 'show']);
$router->post('/api/sites', [\Ramingo\Api\Controllers\SiteController::class, 'store']);
$router->put('/api/sites/{id}', [\Ramingo\Api\Controllers\SiteController::class, 'update']);
$router->delete('/api/sites/{id}', [\Ramingo\Api\Controllers\SiteController::class, 'destroy']);

// Sections
$router->get('/api/sites/{siteId}/sections', [\Ramingo\Api\Controllers\SectionController::class, 'index']);
$router->get('/api/sites/{siteId}/sections/{id}', [\Ramingo\Api\Controllers\SectionController::class, 'show']);
$router->post('/api/sites/{siteId}/sections', [\Ramingo\Api\Controllers\SectionController::class, 'store']);
$router->put('/api/sites/{siteId}/sections/{id}', [\Ramingo\Api\Controllers\SectionController::class, 'update']);
$router->delete('/api/sites/{siteId}/sections/{id}', [\Ramingo\Api\Controllers\SectionController::class, 'destroy']);
$router->post('/api/sites/{siteId}/sections/reorder', [\Ramingo\Api\Controllers\SectionController::class, 'reorder']);

// Entries
$router->get('/api/sites/{siteId}/sections/{sectionId}/entries', [\Ramingo\Api\Controllers\EntryController::class, 'index']);
$router->get('/api/sites/{siteId}/entries/{id}', [\Ramingo\Api\Controllers\EntryController::class, 'show']);
$router->post('/api/sites/{siteId}/sections/{sectionId}/entries', [\Ramingo\Api\Controllers\EntryController::class, 'store']);
$router->put('/api/sites/{siteId}/entries/{id}', [\Ramingo\Api\Controllers\EntryController::class, 'update']);
$router->delete('/api/sites/{siteId}/entries/{id}', [\Ramingo\Api\Controllers\EntryController::class, 'destroy']);
$router->post('/api/sites/{siteId}/sections/{sectionId}/entries/reorder', [\Ramingo\Api\Controllers\EntryController::class, 'reorder']);

// Media
$router->get('/api/sites/{siteId}/media', [\Ramingo\Api\Controllers\MediaController::class, 'index']);
$router->post('/api/sites/{siteId}/media', [\Ramingo\Api\Controllers\MediaController::class, 'upload']);
$router->delete('/api/sites/{siteId}/media/{fileId}', [\Ramingo\Api\Controllers\MediaController::class, 'delete']);

// Test endpoints
$router->get('/api/test', function(Request $request) {
    return Response::json([
        'message' => 'API is working!',
        'path' => $request->getPath(),
        'method' => $request->getMethod(),
        'query' => $request->query('test'),
    ]);
});

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
