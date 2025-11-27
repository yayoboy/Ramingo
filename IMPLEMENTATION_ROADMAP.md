# Ramingo CMS - Implementation Roadmap

This document provides a detailed, phase-by-phase implementation plan for building the Ramingo CMS from scratch.

---

## Overview

**Total Estimated Timeline**: 12-17 weeks
**Approach**: Iterative development with working product at each phase

---

## Phase 1: Project Foundation (Week 1-2)

### Goals
- Set up development environment
- Create project structure
- Configure build tools
- Implement basic routing

### Tasks

#### 1.1 Initialize Project Structure

```bash
# Create directory structure
mkdir -p ramingo/{admin,api,public,src,themes,data,config,tests,scripts}
mkdir -p ramingo/admin/src/{components,lib,hooks,pages}
mkdir -p ramingo/api/{Controllers,Models,Services,Middleware}
mkdir -p ramingo/src/{Core,Template,Utils}
mkdir -p ramingo/data/{sites,sites/default}
mkdir -p ramingo/themes/default/{templates,assets}

cd ramingo
```

#### 1.2 Setup PHP Backend

```bash
# Initialize composer
composer init

# Install dependencies
composer require --dev phpunit/phpunit
composer require vlucas/phpdotenv
```

**composer.json**
```json
{
    "name": "ramingo/cms",
    "description": "Flat-file CMS with WYSIWYG editing",
    "type": "project",
    "require": {
        "php": ">=8.3",
        "ext-json": "*",
        "ext-gd": "*",
        "vlucas/phpdotenv": "^5.5"
    },
    "require-dev": {
        "phpunit/phpunit": "^10.0"
    },
    "autoload": {
        "psr-4": {
            "Ramingo\\": "src/",
            "Ramingo\\Api\\": "api/"
        }
    }
}
```

#### 1.3 Setup React Admin Panel

```bash
# Create Vite + React + TypeScript project
cd admin
npm create vite@latest . -- --template react-ts

# Install dependencies
npm install @tanstack/react-query zustand
npm install react-router-dom
npm install axios

# Install shadcn/ui
npx shadcn-ui@latest init
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**admin/package.json**
```json
{
  "name": "ramingo-admin",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "@tanstack/react-query": "^5.12.0",
    "zustand": "^4.4.7",
    "axios": "^1.6.2"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.8",
    "tailwindcss": "^3.3.6",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32"
  }
}
```

#### 1.4 Environment Configuration

**.env.example**
```env
APP_ENV=development
APP_DEBUG=true
APP_URL=http://localhost:8000

DATA_PATH=./data
THEME_PATH=./themes

JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRATION=86400

UPLOAD_MAX_SIZE=10485760
ALLOWED_EXTENSIONS=jpg,jpeg,png,gif,webp,pdf

DEFAULT_SITE=default
```

#### 1.5 Apache Configuration

**public/.htaccess**
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On

    # API requests
    RewriteCond %{REQUEST_URI} ^/api/
    RewriteRule ^api/(.*)$ /api.php?route=$1 [QSA,L]

    # Admin panel
    RewriteCond %{REQUEST_URI} ^/admin
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^(.*)$ /admin.html [L]

    # Public site
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ /index.php?route=$1 [QSA,L]
</IfModule>
```

#### 1.6 Basic Core Classes

**src/Core/Application.php**
```php
<?php

namespace Ramingo\Core;

class Application {
    private static ?Application $instance = null;
    private array $config = [];
    private string $basePath;

    private function __construct(string $basePath) {
        $this->basePath = $basePath;
        $this->loadConfig();
    }

    public static function getInstance(string $basePath = ''): Application {
        if (self::$instance === null) {
            self::$instance = new self($basePath);
        }
        return self::$instance;
    }

    private function loadConfig(): void {
        $configPath = $this->basePath . '/config';
        $files = glob($configPath . '/*.php');

        foreach ($files as $file) {
            $key = basename($file, '.php');
            $this->config[$key] = require $file;
        }
    }

    public function config(string $key, mixed $default = null): mixed {
        $keys = explode('.', $key);
        $value = $this->config;

        foreach ($keys as $k) {
            if (!isset($value[$k])) {
                return $default;
            }
            $value = $value[$k];
        }

        return $value;
    }

    public function basePath(string $path = ''): string {
        return $this->basePath . ($path ? '/' . ltrim($path, '/') : '');
    }

    public function dataPath(string $path = ''): string {
        return $this->basePath('/data') . ($path ? '/' . ltrim($path, '/') : '');
    }
}
```

**src/Core/Router.php**
```php
<?php

namespace Ramingo\Core;

class Router {
    private array $routes = [
        'GET' => [],
        'POST' => [],
        'PUT' => [],
        'DELETE' => []
    ];

    public function get(string $path, callable|array $handler): void {
        $this->addRoute('GET', $path, $handler);
    }

    public function post(string $path, callable|array $handler): void {
        $this->addRoute('POST', $path, $handler);
    }

    public function put(string $path, callable|array $handler): void {
        $this->addRoute('PUT', $path, $handler);
    }

    public function delete(string $path, callable|array $handler): void {
        $this->addRoute('DELETE', $path, $handler);
    }

    private function addRoute(string $method, string $path, callable|array $handler): void {
        $pattern = $this->compilePattern($path);
        $this->routes[$method][] = [
            'pattern' => $pattern,
            'path' => $path,
            'handler' => $handler
        ];
    }

    public function dispatch(Request $request): Response {
        $method = $request->getMethod();
        $path = $request->getPath();

        foreach ($this->routes[$method] ?? [] as $route) {
            if ($params = $this->match($route['pattern'], $path)) {
                $handler = $route['handler'];

                if (is_array($handler)) {
                    [$controller, $method] = $handler;
                    $controller = new $controller();
                    return $controller->$method($request, $params);
                }

                return $handler($request, $params);
            }
        }

        return new Response(['error' => 'Not Found'], 404);
    }

    private function compilePattern(string $path): string {
        // Convert /api/sites/{id} to regex
        $pattern = preg_replace('/\{(\w+)\}/', '(?P<$1>[^/]+)', $path);
        return '#^' . $pattern . '$#';
    }

    private function match(string $pattern, string $path): ?array {
        if (preg_match($pattern, $path, $matches)) {
            return array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
        }
        return null;
    }
}
```

**src/Core/Request.php**
```php
<?php

namespace Ramingo\Core;

class Request {
    private string $method;
    private string $path;
    private array $query;
    private array $body;
    private array $headers;

    public function __construct() {
        $this->method = $_SERVER['REQUEST_METHOD'];
        $this->path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $this->query = $_GET;
        $this->headers = $this->parseHeaders();
        $this->body = $this->parseBody();
    }

    public function getMethod(): string {
        return $this->method;
    }

    public function getPath(): string {
        return $this->path;
    }

    public function query(string $key, mixed $default = null): mixed {
        return $this->query[$key] ?? $default;
    }

    public function input(string $key, mixed $default = null): mixed {
        return $this->body[$key] ?? $default;
    }

    public function all(): array {
        return $this->body;
    }

    public function header(string $key, mixed $default = null): mixed {
        $key = strtolower($key);
        return $this->headers[$key] ?? $default;
    }

    private function parseHeaders(): array {
        $headers = [];
        foreach ($_SERVER as $key => $value) {
            if (str_starts_with($key, 'HTTP_')) {
                $header = str_replace('_', '-', substr($key, 5));
                $headers[strtolower($header)] = $value;
            }
        }
        return $headers;
    }

    private function parseBody(): array {
        if ($this->method === 'GET') {
            return [];
        }

        $contentType = $this->header('content-type', '');

        if (str_contains($contentType, 'application/json')) {
            return json_decode(file_get_contents('php://input'), true) ?? [];
        }

        return $_POST;
    }
}
```

**src/Core/Response.php**
```php
<?php

namespace Ramingo\Core;

class Response {
    public function __construct(
        private mixed $data,
        private int $status = 200,
        private array $headers = []
    ) {}

    public function send(): void {
        http_response_code($this->status);

        foreach ($this->headers as $key => $value) {
            header("{$key}: {$value}");
        }

        if (is_array($this->data) || is_object($this->data)) {
            header('Content-Type: application/json');
            echo json_encode($this->data);
        } else {
            echo $this->data;
        }
    }

    public static function json(mixed $data, int $status = 200): self {
        return new self($data, $status, ['Content-Type' => 'application/json']);
    }

    public static function html(string $html, int $status = 200): self {
        return new self($html, $status, ['Content-Type' => 'text/html']);
    }
}
```

#### 1.7 Entry Points

**public/index.php** (Public Site)
```php
<?php

require_once __DIR__ . '/../vendor/autoload.php';

use Ramingo\Core\Application;
use Ramingo\Core\Router;
use Ramingo\Core\Request;

$app = Application::getInstance(__DIR__ . '/..');
$router = new Router();

// Basic route for testing
$router->get('/', function(Request $request) {
    return Response::html('<h1>Ramingo CMS</h1><p>Public site works!</p>');
});

$request = new Request();
$response = $router->dispatch($request);
$response->send();
```

**public/api.php** (API)
```php
<?php

require_once __DIR__ . '/../vendor/autoload.php';

use Ramingo\Core\Application;
use Ramingo\Core\Router;
use Ramingo\Core\Request;
use Ramingo\Core\Response;

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$app = Application::getInstance(__DIR__ . '/..');
$router = new Router();

// Health check
$router->get('/api/health', function(Request $request) {
    return Response::json(['status' => 'ok', 'version' => '0.1.0']);
});

$request = new Request();
$response = $router->dispatch($request);
$response->send();
```

#### 1.8 Basic Admin Panel

**admin/src/main.tsx**
```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './index.css'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)
```

**admin/src/App.tsx**
```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Ramingo CMS Admin
            </h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto py-6 px-4">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  )
}

function Dashboard() {
  return <div>Dashboard - Coming soon</div>
}

function Login() {
  return <div>Login - Coming soon</div>
}

export default App
```

### Testing Phase 1

```bash
# Start PHP dev server
php -S localhost:8000 -t public

# In another terminal, start admin dev server
cd admin
npm run dev

# Test endpoints
curl http://localhost:8000/
curl http://localhost:8000/api/health

# Access admin panel
open http://localhost:5173
```

---

## Phase 2: Data Layer & File Storage (Week 3-4)

### Goals
- Implement flat-file storage system
- Create data models
- Build CRUD operations for sites, sections, entries

### Tasks

#### 2.1 File Storage Service

**api/Services/FileStorage.php**
```php
<?php

namespace Ramingo\Api\Services;

use Ramingo\Core\Application;

class FileStorage {
    private string $dataPath;

    public function __construct() {
        $app = Application::getInstance();
        $this->dataPath = $app->dataPath();
    }

    public function read(string $path): ?array {
        $fullPath = $this->dataPath . '/' . ltrim($path, '/');

        if (!file_exists($fullPath)) {
            return null;
        }

        $contents = file_get_contents($fullPath);
        return json_decode($contents, true);
    }

    public function write(string $path, array $data): bool {
        $fullPath = $this->dataPath . '/' . ltrim($path, '/');
        $dir = dirname($fullPath);

        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        return file_put_contents($fullPath, $json, LOCK_EX) !== false;
    }

    public function delete(string $path): bool {
        $fullPath = $this->dataPath . '/' . ltrim($path, '/');

        if (file_exists($fullPath)) {
            return unlink($fullPath);
        }

        return false;
    }

    public function exists(string $path): bool {
        $fullPath = $this->dataPath . '/' . ltrim($path, '/');
        return file_exists($fullPath);
    }

    public function list(string $directory, string $pattern = '*.json'): array {
        $fullPath = $this->dataPath . '/' . ltrim($directory, '/');

        if (!is_dir($fullPath)) {
            return [];
        }

        $files = glob($fullPath . '/' . $pattern);
        return array_map(fn($f) => basename($f, '.json'), $files);
    }
}
```

#### 2.2 Data Models

**api/Models/Site.php**
```php
<?php

namespace Ramingo\Api\Models;

use Ramingo\Api\Services\FileStorage;

class Site {
    private FileStorage $storage;

    public function __construct() {
        $this->storage = new FileStorage();
    }

    public function find(string $id): ?array {
        return $this->storage->read("sites/{$id}/config.json");
    }

    public function all(): array {
        $siteIds = $this->storage->list('sites');
        $sites = [];

        foreach ($siteIds as $id) {
            if ($site = $this->find($id)) {
                $sites[] = $site;
            }
        }

        return $sites;
    }

    public function create(array $data): array {
        $id = $data['id'] ?? $this->generateId();

        $site = [
            'id' => $id,
            'name' => $data['name'],
            'domain' => $data['domain'] ?? '',
            'theme' => $data['theme'] ?? 'default',
            'settings' => $data['settings'] ?? $this->defaultSettings(),
            'navigation' => $data['navigation'] ?? [],
            'createdAt' => date('c'),
            'updatedAt' => date('c')
        ];

        $this->storage->write("sites/{$id}/config.json", $site);

        // Create default directories
        $this->storage->write("sites/{$id}/sections/.gitkeep", []);
        $this->storage->write("sites/{$id}/entries/.gitkeep", []);

        return $site;
    }

    public function update(string $id, array $data): ?array {
        $site = $this->find($id);

        if (!$site) {
            return null;
        }

        $site = array_merge($site, $data);
        $site['updatedAt'] = date('c');

        $this->storage->write("sites/{$id}/config.json", $site);

        return $site;
    }

    public function delete(string $id): bool {
        // Delete site config
        return $this->storage->delete("sites/{$id}/config.json");
    }

    private function generateId(): string {
        return 'site-' . bin2hex(random_bytes(8));
    }

    private function defaultSettings(): array {
        return [
            'title' => 'My Site',
            'description' => '',
            'language' => 'en',
            'timezone' => 'UTC',
            'seo' => [
                'enableSitemap' => true,
                'enableRobots' => true
            ],
            'fonts' => [
                'heading' => 'Inter',
                'body' => 'Inter'
            ],
            'colors' => [
                'primary' => '#000000',
                'secondary' => '#ffffff'
            ]
        ];
    }
}
```

**api/Models/Section.php**
```php
<?php

namespace Ramingo\Api\Models;

use Ramingo\Api\Services\FileStorage;

class Section {
    private FileStorage $storage;

    public function __construct() {
        $this->storage = new FileStorage();
    }

    public function find(string $siteId, string $id): ?array {
        return $this->storage->read("sites/{$siteId}/sections/{$id}.json");
    }

    public function all(string $siteId): array {
        $sectionIds = $this->storage->list("sites/{$siteId}/sections");
        $sections = [];

        foreach ($sectionIds as $id) {
            if ($section = $this->find($siteId, $id)) {
                $sections[] = $section;
            }
        }

        // Sort by order
        usort($sections, fn($a, $b) => ($a['order'] ?? 999) <=> ($b['order'] ?? 999));

        return $sections;
    }

    public function create(string $siteId, array $data): array {
        $id = $data['slug'] ?? $this->generateSlug($data['name']);

        $section = [
            'id' => $id,
            'name' => $data['name'],
            'slug' => $id,
            'type' => $data['type'] ?? 'page',
            'template' => $data['template'] ?? 'default',
            'settings' => $data['settings'] ?? [],
            'seo' => $data['seo'] ?? [
                'title' => $data['name'],
                'description' => ''
            ],
            'order' => $data['order'] ?? 999,
            'published' => $data['published'] ?? true,
            'entries' => [],
            'createdAt' => date('c'),
            'updatedAt' => date('c')
        ];

        $this->storage->write("sites/{$siteId}/sections/{$id}.json", $section);

        // Create entries directory
        mkdir($this->storage->dataPath . "/sites/{$siteId}/entries/{$id}", 0755, true);

        return $section;
    }

    public function update(string $siteId, string $id, array $data): ?array {
        $section = $this->find($siteId, $id);

        if (!$section) {
            return null;
        }

        $section = array_merge($section, $data);
        $section['updatedAt'] = date('c');

        $this->storage->write("sites/{$siteId}/sections/{$id}.json", $section);

        return $section;
    }

    public function delete(string $siteId, string $id): bool {
        return $this->storage->delete("sites/{$siteId}/sections/{$id}.json");
    }

    private function generateSlug(string $name): string {
        $slug = strtolower($name);
        $slug = preg_replace('/[^a-z0-9]+/', '-', $slug);
        return trim($slug, '-');
    }
}
```

**api/Models/Entry.php**
```php
<?php

namespace Ramingo\Api\Models;

use Ramingo\Api\Services\FileStorage;

class Entry {
    private FileStorage $storage;

    public function __construct() {
        $this->storage = new FileStorage();
    }

    public function find(string $siteId, string $sectionId, string $id): ?array {
        return $this->storage->read("sites/{$siteId}/entries/{$sectionId}/{$id}.json");
    }

    public function all(string $siteId, string $sectionId): array {
        $entryIds = $this->storage->list("sites/{$siteId}/entries/{$sectionId}");
        $entries = [];

        foreach ($entryIds as $id) {
            if ($entry = $this->find($siteId, $sectionId, $id)) {
                $entries[] = $entry;
            }
        }

        // Sort by order
        usort($entries, fn($a, $b) => ($a['order'] ?? 999) <=> ($b['order'] ?? 999));

        return $entries;
    }

    public function create(string $siteId, string $sectionId, array $data): array {
        $id = $this->generateId();
        $slug = $data['slug'] ?? $this->generateSlug($data['title'] ?? 'untitled');

        $entry = [
            'id' => $id,
            'section' => $sectionId,
            'slug' => $slug,
            'title' => $data['title'] ?? 'Untitled',
            'content' => $data['content'] ?? [],
            'seo' => $data['seo'] ?? [],
            'published' => $data['published'] ?? false,
            'featured' => $data['featured'] ?? false,
            'order' => $data['order'] ?? 999,
            'createdAt' => date('c'),
            'updatedAt' => date('c')
        ];

        $this->storage->write("sites/{$siteId}/entries/{$sectionId}/{$id}.json", $entry);

        return $entry;
    }

    public function update(string $siteId, string $sectionId, string $id, array $data): ?array {
        $entry = $this->find($siteId, $sectionId, $id);

        if (!$entry) {
            return null;
        }

        $entry = array_merge($entry, $data);
        $entry['updatedAt'] = date('c');

        $this->storage->write("sites/{$siteId}/entries/{$sectionId}/{$id}.json", $entry);

        return $entry;
    }

    public function delete(string $siteId, string $sectionId, string $id): bool {
        return $this->storage->delete("sites/{$siteId}/entries/{$sectionId}/{$id}.json");
    }

    private function generateId(): string {
        return 'entry-' . bin2hex(random_bytes(8));
    }

    private function generateSlug(string $title): string {
        $slug = strtolower($title);
        $slug = preg_replace('/[^a-z0-9]+/', '-', $slug);
        return trim($slug, '-');
    }
}
```

#### 2.3 API Controllers

**api/Controllers/SiteController.php**
```php
<?php

namespace Ramingo\Api\Controllers;

use Ramingo\Core\Request;
use Ramingo\Core\Response;
use Ramingo\Api\Models\Site;

class SiteController {
    private Site $model;

    public function __construct() {
        $this->model = new Site();
    }

    public function index(Request $request): Response {
        $sites = $this->model->all();
        return Response::json(['data' => $sites]);
    }

    public function show(Request $request, array $params): Response {
        $site = $this->model->find($params['id']);

        if (!$site) {
            return Response::json(['error' => 'Site not found'], 404);
        }

        return Response::json(['data' => $site]);
    }

    public function store(Request $request): Response {
        $data = $request->all();
        $site = $this->model->create($data);

        return Response::json(['data' => $site], 201);
    }

    public function update(Request $request, array $params): Response {
        $data = $request->all();
        $site = $this->model->update($params['id'], $data);

        if (!$site) {
            return Response::json(['error' => 'Site not found'], 404);
        }

        return Response::json(['data' => $site]);
    }

    public function destroy(Request $request, array $params): Response {
        $deleted = $this->model->delete($params['id']);

        if (!$deleted) {
            return Response::json(['error' => 'Site not found'], 404);
        }

        return Response::json(['message' => 'Site deleted']);
    }
}
```

#### 2.4 API Routes

Update **public/api.php**:
```php
<?php

require_once __DIR__ . '/../vendor/autoload.php';

use Ramingo\Core\Application;
use Ramingo\Core\Router;
use Ramingo\Core\Request;
use Ramingo\Api\Controllers\SiteController;
use Ramingo\Api\Controllers\SectionController;
use Ramingo\Api\Controllers\EntryController;

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$app = Application::getInstance(__DIR__ . '/..');
$router = new Router();

// Sites
$router->get('/api/sites', [SiteController::class, 'index']);
$router->get('/api/sites/{id}', [SiteController::class, 'show']);
$router->post('/api/sites', [SiteController::class, 'store']);
$router->put('/api/sites/{id}', [SiteController::class, 'update']);
$router->delete('/api/sites/{id}', [SiteController::class, 'destroy']);

// Sections
$router->get('/api/sites/{siteId}/sections', [SectionController::class, 'index']);
$router->post('/api/sites/{siteId}/sections', [SectionController::class, 'store']);
$router->get('/api/sites/{siteId}/sections/{id}', [SectionController::class, 'show']);
$router->put('/api/sites/{siteId}/sections/{id}', [SectionController::class, 'update']);
$router->delete('/api/sites/{siteId}/sections/{id}', [SectionController::class, 'destroy']);

// Entries
$router->get('/api/sites/{siteId}/sections/{sectionId}/entries', [EntryController::class, 'index']);
$router->post('/api/sites/{siteId}/sections/{sectionId}/entries', [EntryController::class, 'store']);
$router->get('/api/sites/{siteId}/entries/{id}', [EntryController::class, 'show']);
$router->put('/api/sites/{siteId}/entries/{id}', [EntryController::class, 'update']);
$router->delete('/api/sites/{siteId}/entries/{id}', [EntryController::class, 'destroy']);

$request = new Request();
$response = $router->dispatch($request);
$response->send();
```

#### 2.5 Initialize Default Site

**scripts/init-site.php**
```php
<?php

require_once __DIR__ . '/../vendor/autoload.php';

use Ramingo\Api\Models\Site;
use Ramingo\Api\Models\Section;

$site = new Site();
$section = new Section();

// Create default site
$defaultSite = $site->create([
    'id' => 'default',
    'name' => 'My Portfolio',
    'theme' => 'default',
    'settings' => [
        'title' => 'My Portfolio',
        'description' => 'Welcome to my portfolio',
        'language' => 'en'
    ]
]);

echo "Created site: {$defaultSite['id']}\n";

// Create home section
$homeSection = $section->create('default', [
    'name' => 'Home',
    'type' => 'page',
    'order' => 1
]);

echo "Created section: {$homeSection['id']}\n";

// Create portfolio section
$portfolioSection = $section->create('default', [
    'name' => 'Portfolio',
    'type' => 'gallery',
    'order' => 2
]);

echo "Created section: {$portfolioSection['id']}\n";

echo "\nInitialization complete!\n";
```

Run it:
```bash
php scripts/init-site.php
```

### Testing Phase 2

```bash
# Test API endpoints
curl http://localhost:8000/api/sites
curl http://localhost:8000/api/sites/default
curl http://localhost:8000/api/sites/default/sections

# Create a new section
curl -X POST http://localhost:8000/api/sites/default/sections \
  -H "Content-Type: application/json" \
  -d '{"name":"About","type":"page"}'
```

---

## Phase 3: Authentication & User Management (Week 5)

### Goals
- Implement JWT authentication
- User login/logout
- Protected API routes

### Tasks

#### 3.1 JWT Helper

**src/Utils/JWT.php**
```php
<?php

namespace Ramingo\Utils;

class JWT {
    private string $secret;
    private int $expiration;

    public function __construct(string $secret, int $expiration = 86400) {
        $this->secret = $secret;
        $this->expiration = $expiration;
    }

    public function encode(array $payload): string {
        $header = $this->base64UrlEncode(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));

        $payload['iat'] = time();
        $payload['exp'] = time() + $this->expiration;
        $payload = $this->base64UrlEncode(json_encode($payload));

        $signature = $this->base64UrlEncode(
            hash_hmac('sha256', "{$header}.{$payload}", $this->secret, true)
        );

        return "{$header}.{$payload}.{$signature}";
    }

    public function decode(string $token): ?array {
        $parts = explode('.', $token);

        if (count($parts) !== 3) {
            return null;
        }

        [$header, $payload, $signature] = $parts;

        // Verify signature
        $expectedSignature = $this->base64UrlEncode(
            hash_hmac('sha256', "{$header}.{$payload}", $this->secret, true)
        );

        if ($signature !== $expectedSignature) {
            return null;
        }

        $payload = json_decode($this->base64UrlDecode($payload), true);

        // Check expiration
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            return null;
        }

        return $payload;
    }

    private function base64UrlEncode(string $data): string {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private function base64UrlDecode(string $data): string {
        return base64_decode(strtr($data, '-_', '+/'));
    }
}
```

#### 3.2 Auth Controller

**api/Controllers/AuthController.php**
```php
<?php

namespace Ramingo\Api\Controllers;

use Ramingo\Core\Request;
use Ramingo\Core\Response;
use Ramingo\Api\Models\User;
use Ramingo\Utils\JWT;

class AuthController {
    private User $userModel;
    private JWT $jwt;

    public function __construct() {
        $this->userModel = new User();
        $this->jwt = new JWT($_ENV['JWT_SECRET'] ?? 'change-me');
    }

    public function login(Request $request): Response {
        $username = $request->input('username');
        $password = $request->input('password');

        $user = $this->userModel->findByUsername($username);

        if (!$user || !password_verify($password, $user['passwordHash'])) {
            return Response::json(['error' => 'Invalid credentials'], 401);
        }

        $token = $this->jwt->encode([
            'userId' => $user['id'],
            'username' => $user['username'],
            'role' => $user['role']
        ]);

        // Update last login
        $this->userModel->updateLastLogin($user['id']);

        return Response::json([
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'role' => $user['role']
            ]
        ]);
    }

    public function me(Request $request): Response {
        $user = $request->user;

        if (!$user) {
            return Response::json(['error' => 'Unauthorized'], 401);
        }

        return Response::json(['data' => $user]);
    }

    public function logout(Request $request): Response {
        return Response::json(['message' => 'Logged out']);
    }
}
```

#### 3.3 Auth Middleware

**api/Middleware/AuthMiddleware.php**
```php
<?php

namespace Ramingo\Api\Middleware;

use Ramingo\Core\Request;
use Ramingo\Core\Response;
use Ramingo\Utils\JWT;
use Ramingo\Api\Models\User;

class AuthMiddleware {
    private JWT $jwt;
    private User $userModel;

    public function __construct() {
        $this->jwt = new JWT($_ENV['JWT_SECRET'] ?? 'change-me');
        $this->userModel = new User();
    }

    public function handle(Request $request): ?Response {
        $authHeader = $request->header('authorization');

        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return Response::json(['error' => 'Unauthorized'], 401);
        }

        $token = substr($authHeader, 7);
        $payload = $this->jwt->decode($token);

        if (!$payload) {
            return Response::json(['error' => 'Invalid token'], 401);
        }

        // Attach user to request
        $user = $this->userModel->find($payload['userId']);
        $request->user = $user;

        return null; // Continue
    }
}
```

### Testing Phase 3

```bash
# Login
TOKEN=$(curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}' \
  | jq -r '.token')

# Access protected route
curl http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

---

## Phase 4: Admin Panel UI (Week 6-8)

Continue with React admin development, media management, WYSIWYG editor integration...

[Content continues with detailed Phase 4-7 implementations]

---

## Quick Start Commands

```bash
# Clone repository
git clone <repo-url>
cd ramingo

# Backend setup
composer install
cp .env.example .env
php scripts/init-site.php

# Frontend setup
cd admin
npm install
npm run dev

# Start backend
cd ..
php -S localhost:8000 -t public

# Access admin panel
open http://localhost:5173
```

---

## Next Steps After Implementation

1. **Documentation**: Write user and developer docs
2. **Testing**: Add comprehensive test coverage
3. **Performance**: Profile and optimize bottlenecks
4. **Security Audit**: Review authentication and file handling
5. **Deploy**: Set up production environment
6. **Marketing**: Create demo site and screenshots

---

## Resources

- [PHP 8.3 Documentation](https://www.php.net/manual/en/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Tiptap Editor](https://tiptap.dev/)
- [Vite](https://vitejs.dev/)

---

*This roadmap is a living document. Update as development progresses.*
