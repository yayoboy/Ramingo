<?php

namespace Ramingo\Api\Services;

use Ramingo\Core\Application;

class FileStorage
{
    private string $dataPath;

    public function __construct()
    {
        $app = Application::getInstance();
        $this->dataPath = $app->dataPath();
    }

    /**
     * Read a JSON file and return its contents as an array
     */
    public function read(string $path): ?array
    {
        $fullPath = $this->dataPath . '/' . ltrim($path, '/');

        if (!file_exists($fullPath)) {
            return null;
        }

        $contents = file_get_contents($fullPath);

        if ($contents === false) {
            return null;
        }

        $data = json_decode($contents, true);

        return is_array($data) ? $data : null;
    }

    /**
     * Write data to a JSON file
     */
    public function write(string $path, array $data): bool
    {
        $fullPath = $this->dataPath . '/' . ltrim($path, '/');
        $dir = dirname($fullPath);

        // Create directory if it doesn't exist
        if (!is_dir($dir)) {
            if (!mkdir($dir, 0755, true)) {
                return false;
            }
        }

        $json = json_encode(
            $data,
            JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
        );

        if ($json === false) {
            return false;
        }

        // Atomic write using temporary file
        $tempFile = $fullPath . '.tmp';
        $result = file_put_contents($tempFile, $json, LOCK_EX);

        if ($result === false) {
            return false;
        }

        return rename($tempFile, $fullPath);
    }

    /**
     * Delete a file
     */
    public function delete(string $path): bool
    {
        $fullPath = $this->dataPath . '/' . ltrim($path, '/');

        if (!file_exists($fullPath)) {
            return false;
        }

        return unlink($fullPath);
    }

    /**
     * Check if a file exists
     */
    public function exists(string $path): bool
    {
        $fullPath = $this->dataPath . '/' . ltrim($path, '/');
        return file_exists($fullPath);
    }

    /**
     * List files in a directory matching a pattern
     */
    public function list(string $directory, string $pattern = '*.json'): array
    {
        $fullPath = $this->dataPath . '/' . ltrim($directory, '/');

        if (!is_dir($fullPath)) {
            return [];
        }

        $files = glob($fullPath . '/' . $pattern);

        if ($files === false) {
            return [];
        }

        // Return just the filenames without extension
        return array_map(
            fn($file) => basename($file, '.json'),
            $files
        );
    }

    /**
     * List directories in a path
     */
    public function listDirectories(string $directory): array
    {
        $fullPath = $this->dataPath . '/' . ltrim($directory, '/');

        if (!is_dir($fullPath)) {
            return [];
        }

        $items = scandir($fullPath);

        if ($items === false) {
            return [];
        }

        $directories = [];
        foreach ($items as $item) {
            if ($item === '.' || $item === '..') {
                continue;
            }

            $itemPath = $fullPath . '/' . $item;
            if (is_dir($itemPath)) {
                $directories[] = $item;
            }
        }

        return $directories;
    }

    /**
     * Get the full path for a relative path
     */
    public function getFullPath(string $path): string
    {
        return $this->dataPath . '/' . ltrim($path, '/');
    }

    /**
     * Create a directory if it doesn't exist
     */
    public function createDirectory(string $path): bool
    {
        $fullPath = $this->dataPath . '/' . ltrim($path, '/');

        if (is_dir($fullPath)) {
            return true;
        }

        return mkdir($fullPath, 0755, true);
    }

    /**
     * Delete a directory and all its contents
     */
    public function deleteDirectory(string $path): bool
    {
        $fullPath = $this->dataPath . '/' . ltrim($path, '/');

        if (!is_dir($fullPath)) {
            return false;
        }

        return $this->recursiveDelete($fullPath);
    }

    /**
     * Recursively delete a directory
     */
    private function recursiveDelete(string $dir): bool
    {
        $files = array_diff(scandir($dir), ['.', '..']);

        foreach ($files as $file) {
            $path = $dir . '/' . $file;

            if (is_dir($path)) {
                $this->recursiveDelete($path);
            } else {
                unlink($path);
            }
        }

        return rmdir($dir);
    }
}
