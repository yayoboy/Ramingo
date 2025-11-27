<?php

namespace Ramingo\Api\Controllers;

use Ramingo\Core\Request;
use Ramingo\Core\Response;
use Ramingo\Core\Application;
use Ramingo\Api\Models\User;
use Ramingo\Utils\JWT;

class AuthController
{
    private User $userModel;
    private JWT $jwt;

    public function __construct()
    {
        $this->userModel = new User();

        $app = Application::getInstance();
        $secret = $app->config('app.env') === 'production'
            ? ($_ENV['JWT_SECRET'] ?? 'change-me-in-production')
            : 'dev-secret-key';

        $expiration = (int) ($_ENV['JWT_EXPIRATION'] ?? 86400); // 24 hours default

        $this->jwt = new JWT($secret, $expiration);
    }

    /**
     * Login user
     * POST /api/auth/login
     */
    public function login(Request $request, array $params): Response
    {
        try {
            $username = $request->input('username');
            $password = $request->input('password');

            // Validate input
            if (empty($username) || empty($password)) {
                return Response::json([
                    'error' => 'Username and password are required'
                ], 400);
            }

            // Find user
            $user = $this->userModel->findByUsername($username);

            if (!$user) {
                return Response::json([
                    'error' => 'Invalid credentials'
                ], 401);
            }

            // Verify password
            if (!$this->userModel->verifyPassword($password, $user['passwordHash'])) {
                return Response::json([
                    'error' => 'Invalid credentials'
                ], 401);
            }

            // Generate token
            $token = $this->jwt->encode([
                'userId' => $user['id'],
                'username' => $user['username'],
                'role' => $user['role']
            ]);

            // Update last login
            $this->userModel->updateLastLogin($user['id']);

            // Remove sensitive data
            unset($user['passwordHash']);

            return Response::json([
                'token' => $token,
                'user' => $user,
                'message' => 'Login successful'
            ]);
        } catch (\Throwable $e) {
            return Response::json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get current user
     * GET /api/auth/me
     */
    public function me(Request $request, array $params): Response
    {
        try {
            if (!isset($request->user) || !$request->user) {
                return Response::json([
                    'error' => 'Unauthorized'
                ], 401);
            }

            $user = $request->user;
            unset($user['passwordHash']);

            return Response::json([
                'data' => $user
            ]);
        } catch (\Throwable $e) {
            return Response::json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Logout user
     * POST /api/auth/logout
     */
    public function logout(Request $request, array $params): Response
    {
        // In a stateless JWT setup, logout is handled client-side
        // by removing the token. This endpoint exists for consistency
        // and could be extended to maintain a token blacklist if needed.

        return Response::json([
            'message' => 'Logout successful'
        ]);
    }

    /**
     * Register a new user (optional - can be disabled in production)
     * POST /api/auth/register
     */
    public function register(Request $request, array $params): Response
    {
        try {
            $app = Application::getInstance();

            // Disable registration in production unless explicitly enabled
            if ($app->config('app.env') === 'production') {
                return Response::json([
                    'error' => 'Registration is disabled'
                ], 403);
            }

            $data = $request->all();

            // Validate required fields
            if (empty($data['username']) || empty($data['password']) || empty($data['email'])) {
                return Response::json([
                    'error' => 'Username, email, and password are required'
                ], 400);
            }

            // Create user
            $user = $this->userModel->create($data);

            // Generate token
            $token = $this->jwt->encode([
                'userId' => $user['id'],
                'username' => $user['username'],
                'role' => $user['role']
            ]);

            return Response::json([
                'token' => $token,
                'user' => $user,
                'message' => 'Registration successful'
            ], 201);
        } catch (\RuntimeException $e) {
            return Response::json([
                'error' => $e->getMessage()
            ], 409);
        } catch (\Throwable $e) {
            return Response::json([
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
