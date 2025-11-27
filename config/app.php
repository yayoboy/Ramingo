<?php

return [
    'name' => 'Ramingo CMS',
    'version' => '0.1.0',
    'env' => $_ENV['APP_ENV'] ?? 'production',
    'debug' => filter_var($_ENV['APP_DEBUG'] ?? false, FILTER_VALIDATE_BOOLEAN),
    'url' => $_ENV['APP_URL'] ?? 'http://localhost:8000',
    'timezone' => 'UTC',
];
