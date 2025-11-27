<?php

namespace Ramingo\Api\Models;

use Ramingo\Api\Services\FileStorage;

class User
{
    private FileStorage $storage;
    private const USERS_FILE = 'users.json';

    public function __construct()
    {
        $this->storage = new FileStorage();
    }

    /**
     * Find a user by ID
     */
    public function find(string $id): ?array
    {
        $users = $this->all();

        foreach ($users as $user) {
            if ($user['id'] === $id) {
                return $user;
            }
        }

        return null;
    }

    /**
     * Find a user by username
     */
    public function findByUsername(string $username): ?array
    {
        $users = $this->all();

        foreach ($users as $user) {
            if ($user['username'] === $username) {
                return $user;
            }
        }

        return null;
    }

    /**
     * Find a user by email
     */
    public function findByEmail(string $email): ?array
    {
        $users = $this->all();

        foreach ($users as $user) {
            if ($user['email'] === $email) {
                return $user;
            }
        }

        return null;
    }

    /**
     * Get all users
     */
    public function all(): array
    {
        $data = $this->storage->read(self::USERS_FILE);

        if (!$data || !isset($data['users'])) {
            return [];
        }

        return $data['users'];
    }

    /**
     * Create a new user
     */
    public function create(array $data): array
    {
        $users = $this->all();

        // Check if username already exists
        if ($this->findByUsername($data['username'])) {
            throw new \RuntimeException("Username already exists");
        }

        // Check if email already exists
        if (isset($data['email']) && $this->findByEmail($data['email'])) {
            throw new \RuntimeException("Email already exists");
        }

        $user = [
            'id' => $this->generateId(),
            'username' => $data['username'],
            'email' => $data['email'] ?? '',
            'passwordHash' => $this->hashPassword($data['password']),
            'role' => $data['role'] ?? 'editor',
            'sites' => $data['sites'] ?? ['default'],
            'preferences' => $data['preferences'] ?? [
                'theme' => 'light',
                'language' => 'en'
            ],
            'createdAt' => date('c'),
            'lastLogin' => null
        ];

        $users[] = $user;

        $this->saveUsers($users);

        // Remove password hash from returned data
        unset($user['passwordHash']);

        return $user;
    }

    /**
     * Update a user
     */
    public function update(string $id, array $data): ?array
    {
        $users = $this->all();
        $updated = false;

        foreach ($users as $index => $user) {
            if ($user['id'] === $id) {
                // Prevent changing ID and username
                unset($data['id'], $data['username'], $data['createdAt']);

                // Handle password update
                if (isset($data['password'])) {
                    $data['passwordHash'] = $this->hashPassword($data['password']);
                    unset($data['password']);
                }

                $users[$index] = array_merge($user, $data);
                $updated = true;
                break;
            }
        }

        if (!$updated) {
            return null;
        }

        $this->saveUsers($users);

        // Return updated user without password hash
        $updatedUser = $users[$index];
        unset($updatedUser['passwordHash']);

        return $updatedUser;
    }

    /**
     * Delete a user
     */
    public function delete(string $id): bool
    {
        $users = $this->all();
        $newUsers = [];
        $deleted = false;

        foreach ($users as $user) {
            if ($user['id'] === $id) {
                $deleted = true;
                continue;
            }
            $newUsers[] = $user;
        }

        if ($deleted) {
            $this->saveUsers($newUsers);
        }

        return $deleted;
    }

    /**
     * Verify user password
     */
    public function verifyPassword(string $password, string $hash): bool
    {
        return password_verify($password, $hash);
    }

    /**
     * Update last login time
     */
    public function updateLastLogin(string $id): void
    {
        $this->update($id, ['lastLogin' => date('c')]);
    }

    /**
     * Hash a password
     */
    private function hashPassword(string $password): string
    {
        return password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
    }

    /**
     * Save users to file
     */
    private function saveUsers(array $users): void
    {
        $this->storage->write(self::USERS_FILE, ['users' => $users]);
    }

    /**
     * Generate a unique user ID
     */
    private function generateId(): string
    {
        return 'usr-' . bin2hex(random_bytes(8));
    }

    /**
     * Check if users file exists
     */
    public function exists(): bool
    {
        return $this->storage->exists(self::USERS_FILE);
    }
}
