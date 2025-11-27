<?php

return [
    'default_site' => $_ENV['DEFAULT_SITE'] ?? 'default',

    'sites' => [
        'default' => [
            'domain' => 'localhost',
            'data_path' => 'data/sites/default'
        ],
    ],
];
