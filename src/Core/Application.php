<?php

namespace Ramingo\Core;

use Dotenv\Dotenv;

class Application
{
    private static ?Application $instance = null;
    private array $config = [];
    private string $basePath;

    private function __construct(string $basePath)
    {
        $this->basePath = rtrim($basePath, '/');
        $this->loadEnvironment();
        $this->loadConfig();
    }

    public static function getInstance(string $basePath = ''): Application
    {
        if (self::$instance === null) {
            if (empty($basePath)) {
                throw new \RuntimeException('Base path must be provided on first instantiation');
            }
            self::$instance = new self($basePath);
        }
        return self::$instance;
    }

    private function loadEnvironment(): void
    {
        $dotenv = Dotenv::createImmutable($this->basePath);
        $dotenv->safeLoad();
    }

    private function loadConfig(): void
    {
        $configPath = $this->basePath . '/config';

        if (!is_dir($configPath)) {
            return;
        }

        $files = glob($configPath . '/*.php');

        foreach ($files as $file) {
            $key = basename($file, '.php');
            $this->config[$key] = require $file;
        }
    }

    public function config(string $key, mixed $default = null): mixed
    {
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

    public function basePath(string $path = ''): string
    {
        return $this->basePath . ($path ? '/' . ltrim($path, '/') : '');
    }

    public function dataPath(string $path = ''): string
    {
        $dataPath = $this->config('storage.data_path', './data');
        $fullPath = $this->basePath($dataPath);
        return $fullPath . ($path ? '/' . ltrim($path, '/') : '');
    }

    public function themePath(string $path = ''): string
    {
        $themePath = $this->config('storage.theme_path', './themes');
        $fullPath = $this->basePath($themePath);
        return $fullPath . ($path ? '/' . ltrim($path, '/') : '');
    }

    public function isDebug(): bool
    {
        return $this->config('app.debug', false);
    }
}
