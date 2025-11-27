<?php

return [
    'data_path' => $_ENV['DATA_PATH'] ?? './data',
    'theme_path' => $_ENV['THEME_PATH'] ?? './themes',
    'upload_max_size' => (int) ($_ENV['UPLOAD_MAX_SIZE'] ?? 10485760), // 10MB default
    'allowed_extensions' => explode(',', $_ENV['ALLOWED_EXTENSIONS'] ?? 'jpg,jpeg,png,gif,webp,pdf'),
];
