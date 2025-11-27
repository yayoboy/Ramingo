<?php

namespace Ramingo\Core;

class Router
{
    private array $routes = [
        'GET' => [],
        'POST' => [],
        'PUT' => [],
        'DELETE' => [],
        'PATCH' => []
    ];

    private array $middleware = [];

    public function get(string $path, callable|array $handler): void
    {
        $this->addRoute('GET', $path, $handler);
    }

    public function post(string $path, callable|array $handler): void
    {
        $this->addRoute('POST', $path, $handler);
    }

    public function put(string $path, callable|array $handler): void
    {
        $this->addRoute('PUT', $path, $handler);
    }

    public function delete(string $path, callable|array $handler): void
    {
        $this->addRoute('DELETE', $path, $handler);
    }

    public function patch(string $path, callable|array $handler): void
    {
        $this->addRoute('PATCH', $path, $handler);
    }

    public function addMiddleware(callable $middleware): void
    {
        $this->middleware[] = $middleware;
    }

    private function addRoute(string $method, string $path, callable|array $handler): void
    {
        $pattern = $this->compilePattern($path);
        $this->routes[$method][] = [
            'pattern' => $pattern,
            'path' => $path,
            'handler' => $handler
        ];
    }

    public function dispatch(Request $request): Response
    {
        // Run middleware
        foreach ($this->middleware as $middleware) {
            $response = $middleware($request);
            if ($response instanceof Response) {
                return $response;
            }
        }

        $method = $request->getMethod();
        $path = $request->getPath();

        foreach ($this->routes[$method] ?? [] as $route) {
            $params = $this->match($route['pattern'], $path);
            if ($params !== null) {
                try {
                    $handler = $route['handler'];

                    if (is_array($handler)) {
                        [$controllerClass, $method] = $handler;
                        $controller = new $controllerClass();
                        return $controller->$method($request, $params);
                    }

                    return $handler($request, $params);
                } catch (\Throwable $e) {
                    return $this->handleError($e);
                }
            }
        }

        return Response::json(['error' => 'Not Found'], 404);
    }

    private function compilePattern(string $path): string
    {
        // Convert /api/sites/{id} to regex pattern
        $pattern = preg_replace('/\{(\w+)\}/', '(?P<$1>[^/]+)', $path);
        return '#^' . $pattern . '$#';
    }

    private function match(string $pattern, string $path): ?array
    {
        if (preg_match($pattern, $path, $matches)) {
            // Return only named parameters
            return array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
        }
        return null;
    }

    private function handleError(\Throwable $e): Response
    {
        $app = Application::getInstance();

        if ($app->isDebug()) {
            return Response::json([
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }

        return Response::json(['error' => 'Internal Server Error'], 500);
    }
}
