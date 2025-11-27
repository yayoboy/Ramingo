<?php

/**
 * Ramingo CMS - Public Site Entry Point
 */

require_once __DIR__ . '/../vendor/autoload.php';

use Ramingo\Core\Application;
use Ramingo\Core\Router;
use Ramingo\Core\Request;
use Ramingo\Core\Response;

// Initialize application
$app = Application::getInstance(__DIR__ . '/..');

// Create router
$router = new Router();

// Basic routes for testing
$router->get('/', function(Request $request) {
    return Response::html('
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ramingo CMS</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            line-height: 1.6;
        }
        h1 { color: #333; }
        .card {
            background: #f5f5f5;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        a {
            color: #0066cc;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        code {
            background: #e0e0e0;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <h1>🎉 Ramingo CMS</h1>
    <p>Welcome to Ramingo CMS - A modern flat-file content management system.</p>

    <div class="card">
        <h2>✅ Phase 1 Complete</h2>
        <p><strong>Backend is running!</strong></p>
        <ul>
            <li>✅ PHP 8.2+ backend</li>
            <li>✅ Router system</li>
            <li>✅ Configuration loaded</li>
            <li>✅ Composer dependencies installed</li>
        </ul>
    </div>

    <div class="card">
        <h2>🔗 Quick Links</h2>
        <ul>
            <li><a href="/api/health">API Health Check</a> - Test API endpoint</li>
            <li><a href="/admin">Admin Panel</a> - React admin interface</li>
        </ul>
    </div>

    <div class="card">
        <h2>📚 Next Steps</h2>
        <ol>
            <li>Start React dev server: <code>cd admin && npm run dev</code></li>
            <li>Initialize default site: <code>php scripts/init-site.php</code></li>
            <li>Continue with Phase 2 implementation</li>
        </ol>
    </div>

    <p style="text-align: center; color: #666; margin-top: 40px;">
        Ramingo CMS v0.1.0 - Built with ❤️
    </p>
</body>
</html>
    ');
});

$router->get('/test', function(Request $request) {
    return Response::json([
        'message' => 'Public site working',
        'path' => $request->getPath(),
        'method' => $request->getMethod()
    ]);
});

// Dispatch request
$request = new Request();
$response = $router->dispatch($request);
$response->send();
