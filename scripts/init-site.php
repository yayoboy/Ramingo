<?php

/**
 * Initialize Default Site
 *
 * This script creates a default site with sample sections and entries
 *
 * Usage: php scripts/init-site.php
 */

require_once __DIR__ . '/../vendor/autoload.php';

use Ramingo\Core\Application;
use Ramingo\Api\Models\Site;
use Ramingo\Api\Models\Section;
use Ramingo\Api\Models\Entry;

// Initialize application
$app = Application::getInstance(__DIR__ . '/..');

echo "🚀 Ramingo CMS - Site Initialization\n";
echo str_repeat("=", 50) . "\n\n";

try {
    $siteModel = new Site();
    $sectionModel = new Section();
    $entryModel = new Entry();

    // Check if default site already exists
    if ($siteModel->exists('default')) {
        echo "⚠️  Default site already exists.\n";
        echo "   Delete data/sites/default/ to reinitialize.\n";
        exit(0);
    }

    // Create default site
    echo "Creating default site...\n";
    $site = $siteModel->create([
        'id' => 'default',
        'name' => 'My Portfolio',
        'domain' => 'localhost',
        'theme' => 'default',
        'settings' => [
            'title' => 'My Creative Portfolio',
            'description' => 'Welcome to my portfolio website',
            'language' => 'en',
            'timezone' => 'UTC',
            'seo' => [
                'enableSitemap' => true,
                'enableRobots' => true
            ],
            'fonts' => [
                'heading' => 'Playfair Display',
                'body' => 'Inter'
            ],
            'colors' => [
                'primary' => '#1a1a1a',
                'secondary' => '#ffffff',
                'accent' => '#3b82f6'
            ]
        ],
        'navigation' => []
    ]);

    echo "✅ Site created: {$site['id']}\n\n";

    // Create Home section
    echo "Creating Home section...\n";
    $homeSection = $sectionModel->create('default', [
        'name' => 'Home',
        'type' => 'page',
        'template' => 'default',
        'order' => 0,
        'published' => true
    ]);
    echo "✅ Section created: {$homeSection['id']}\n";

    // Create home entry
    $homeEntry = $entryModel->create('default', $homeSection['id'], [
        'title' => 'Welcome',
        'content' => [
            'description' => '<h1>Welcome to My Portfolio</h1><p>I\'m a creative professional showcasing my work.</p>',
            'images' => [],
            'metadata' => []
        ],
        'published' => true,
        'order' => 0
    ]);
    echo "  ✅ Entry created: {$homeEntry['title']}\n\n";

    // Create Portfolio section
    echo "Creating Portfolio section...\n";
    $portfolioSection = $sectionModel->create('default', [
        'name' => 'Portfolio',
        'type' => 'gallery',
        'template' => 'gallery',
        'settings' => [
            'layout' => 'grid',
            'columns' => 3,
            'showTitles' => true,
            'enableLightbox' => true
        ],
        'order' => 1,
        'published' => true
    ]);
    echo "✅ Section created: {$portfolioSection['id']}\n";

    // Create portfolio entries
    $projects = [
        [
            'title' => 'Website Redesign',
            'description' => '<p>Complete redesign of a corporate website with modern aesthetics.</p>',
            'tags' => ['web design', 'ui/ux']
        ],
        [
            'title' => 'Mobile App Design',
            'description' => '<p>User interface design for a productivity mobile application.</p>',
            'tags' => ['mobile', 'ui/ux']
        ],
        [
            'title' => 'Brand Identity',
            'description' => '<p>Full brand identity package including logo and visual guidelines.</p>',
            'tags' => ['branding', 'graphic design']
        ]
    ];

    foreach ($projects as $index => $project) {
        $entry = $entryModel->create('default', $portfolioSection['id'], [
            'title' => $project['title'],
            'content' => [
                'description' => $project['description'],
                'images' => [],
                'metadata' => [
                    'tags' => $project['tags'],
                    'year' => '2025'
                ]
            ],
            'published' => true,
            'featured' => $index === 0,
            'order' => $index
        ]);
        echo "  ✅ Entry created: {$entry['title']}\n";
    }
    echo "\n";

    // Create About section
    echo "Creating About section...\n";
    $aboutSection = $sectionModel->create('default', [
        'name' => 'About',
        'type' => 'page',
        'template' => 'default',
        'order' => 2,
        'published' => true
    ]);
    echo "✅ Section created: {$aboutSection['id']}\n";

    // Create about entry
    $aboutEntry = $entryModel->create('default', $aboutSection['id'], [
        'title' => 'About Me',
        'content' => [
            'description' => '<h2>About Me</h2><p>I\'m a passionate designer and developer with years of experience creating beautiful digital experiences.</p>',
            'images' => [],
            'metadata' => [
                'skills' => ['Design', 'Development', 'Photography']
            ]
        ],
        'published' => true,
        'order' => 0
    ]);
    echo "  ✅ Entry created: {$aboutEntry['title']}\n\n";

    // Create Contact section
    echo "Creating Contact section...\n";
    $contactSection = $sectionModel->create('default', [
        'name' => 'Contact',
        'type' => 'page',
        'template' => 'default',
        'order' => 3,
        'published' => true
    ]);
    echo "✅ Section created: {$contactSection['id']}\n";

    // Create contact entry
    $contactEntry = $entryModel->create('default', $contactSection['id'], [
        'title' => 'Get In Touch',
        'content' => [
            'description' => '<h2>Contact Me</h2><p>Let\'s work together on your next project.</p>',
            'metadata' => [
                'email' => 'hello@example.com'
            ]
        ],
        'published' => true,
        'order' => 0
    ]);
    echo "  ✅ Entry created: {$contactEntry['title']}\n\n";

    // Summary
    echo str_repeat("=", 50) . "\n";
    echo "✨ Initialization Complete!\n\n";
    echo "Site Details:\n";
    echo "  ID: {$site['id']}\n";
    echo "  Name: {$site['name']}\n";
    echo "  Sections: 4 (Home, Portfolio, About, Contact)\n";
    echo "  Entries: 6 total\n\n";

    echo "Next Steps:\n";
    echo "  1. Start the server: php -S localhost:8000 -t public router.php\n";
    echo "  2. Test API: curl http://localhost:8000/api/sites/default\n";
    echo "  3. View sections: curl http://localhost:8000/api/sites/default/sections\n\n";

    echo "Data Location: " . $app->dataPath('sites/default') . "\n\n";

} catch (\Exception $e) {
    echo "\n❌ Error: {$e->getMessage()}\n";
    echo "   File: {$e->getFile()}:{$e->getLine()}\n\n";
    exit(1);
}
