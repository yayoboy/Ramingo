<?php

/**
 * Initialize Default Admin User
 *
 * This script creates a default admin user for the CMS
 *
 * Usage: php scripts/init-user.php
 */

require_once __DIR__ . '/../vendor/autoload.php';

use Ramingo\Core\Application;
use Ramingo\Api\Models\User;

// Initialize application
$app = Application::getInstance(__DIR__ . '/..');

echo "🔐 Ramingo CMS - User Initialization\n";
echo str_repeat("=", 50) . "\n\n";

try {
    $userModel = new User();

    // Check if users already exist
    if ($userModel->exists() && count($userModel->all()) > 0) {
        echo "⚠️  Users already exist.\n\n";

        $users = $userModel->all();
        echo "Current users:\n";
        foreach ($users as $user) {
            echo "  - {$user['username']} ({$user['role']}) - {$user['email']}\n";
        }

        echo "\nTo reset users, delete: " . $app->dataPath('users.json') . "\n\n";
        exit(0);
    }

    // Create default admin user
    echo "Creating default admin user...\n";

    $adminUser = $userModel->create([
        'username' => 'admin',
        'email' => 'admin@ramingo.local',
        'password' => 'admin123',
        'role' => 'admin',
        'sites' => ['default'],
        'preferences' => [
            'theme' => 'light',
            'language' => 'en'
        ]
    ]);

    echo "✅ Admin user created successfully!\n\n";

    echo str_repeat("=", 50) . "\n";
    echo "✨ Initialization Complete!\n\n";

    echo "Admin Credentials:\n";
    echo "  Username: admin\n";
    echo "  Password: admin123\n";
    echo "  Role: admin\n";
    echo "  Email: admin@ramingo.local\n\n";

    echo "⚠️  IMPORTANT: Change the default password immediately!\n\n";

    echo "Login Test:\n";
    echo "  curl -X POST http://localhost:8000/api/auth/login \\\n";
    echo "    -H 'Content-Type: application/json' \\\n";
    echo "    -d '{\"username\":\"admin\",\"password\":\"admin123\"}'\n\n";

    echo "Data Location: " . $app->dataPath('users.json') . "\n\n";

} catch (\Exception $e) {
    echo "\n❌ Error: {$e->getMessage()}\n";
    echo "   File: {$e->getFile()}:{$e->getLine()}\n\n";
    exit(1);
}
