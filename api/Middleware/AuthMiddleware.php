<?php

namespace Ramingo\Api\Middleware;

use Ramingo\Core\Request;
use Ramingo\Core\Response;
use Ramingo\Core\Application;
use Ramingo\Utils\JWT;
use Ramingo\Api\Models\User;

class AuthMiddleware
{
    private JWT $jwt;
    private User $userModel;

    public function __construct()
    {
        $app = Application::getInstance();
        $secret = $app->config('app.env') === 'production'
            ? ($_ENV['JWT_SECRET'] ?? 'change-me-in-production')
            : 'dev-secret-key';

        $expiration = (int) ($_ENV['JWT_EXPIRATION'] ?? 86400);

        $this->jwt = new JWT($secret, $expiration);
        $this->userModel = new User();
    }

    /**
     * Handle authentication
     * Returns null to continue, or Response to stop
     */
    public function handle(Request $request): ?Response
    {
        $authHeader = $request->header('authorization');

        if (!$authHeader) {
            return Response::json([
                'error' => 'Authorization header missing'
            ], 401);
        }

        if (!str_starts_with($authHeader, 'Bearer ')) {
            return Response::json([
                'error' => 'Invalid authorization header format'
            ], 401);
        }

        $token = substr($authHeader, 7);

        // Decode and verify token
        $payload = $this->jwt->decode($token);

        if (!$payload) {
            return Response::json([
                'error' => 'Invalid or expired token'
            ], 401);
        }

        // Load user from database
        $user = $this->userModel->find($payload['userId']);

        if (!$user) {
            return Response::json([
                'error' => 'User not found'
            ], 401);
        }

        // Attach user to request
        $request->user = $user;

        // Continue to next handler
        return null;
    }
}
