<?php

/**
 * Ramingo CMS - Public Site Entry Point
 */

require_once __DIR__ . '/../vendor/autoload.php';

use Ramingo\Core\Application;
use Ramingo\Core\Request;
use Ramingo\Template\Engine;
use Ramingo\Api\Models\Site;
use Ramingo\Api\Models\Section;
use Ramingo\Api\Models\Entry;

// Initialize application
$app = Application::getInstance(__DIR__ . '/..');

// Get current request path
$request = new Request();
$path = trim($request->getPath(), '/');
$segments = array_filter(explode('/', $path));

// Load site (default for now, multi-site support later)
$siteModel = new Site();
$site = $siteModel->find('default');

if (!$site) {
    http_response_code(404);
    echo '<!DOCTYPE html><html><head><title>Site Not Found</title></head><body><h1>Site Not Found</h1><p>The site has not been configured yet.</p><p><a href="/admin">Go to Admin Panel</a></p></body></html>';
    exit;
}

// Load all sections for navigation
$sectionModel = new Section();
$sections = $sectionModel->all($site['id']);

// Initialize template engine
$templateEngine = new Engine(__DIR__ . '/themes/default');
$templateEngine->layout('main');

try {
    // Homepage
    if (empty($path) || $path === '') {
        // Find home section
        $homeSection = null;
        foreach ($sections as $section) {
            if ($section['slug'] === 'home' || $section['id'] === 'home') {
                $homeSection = $section;
                break;
            }
        }

        if ($homeSection) {
            $entryModel = new Entry();
            $entries = $entryModel->all($site['id'], $homeSection['id']);

            // Filter published entries
            $entries = array_filter($entries, fn($e) => $e['published']);

            $html = $templateEngine->render("templates/{$homeSection['type']}", [
                'site' => $site,
                'sections' => $sections,
                'section' => $homeSection,
                'entries' => $entries,
                'currentSection' => $homeSection,
            ]);

            echo $html;
        } else {
            // Default homepage with section links
            echo $templateEngine->render('templates/page', [
                'site' => $site,
                'sections' => $sections,
                'entries' => [[
                    'title' => $site['settings']['title'],
                    'content' => [
                        'description' => '<p>' . ($site['settings']['description'] ?? 'Welcome') . '</p>',
                        'images' => [],
                        'metadata' => ['tags' => []]
                    ],
                    'published' => true
                ]],
            ]);
        }
        exit;
    }

    // Section or Entry
    $sectionSlug = $segments[0] ?? '';
    $entrySlug = $segments[1] ?? '';

    // Find section by slug
    $currentSection = null;
    foreach ($sections as $section) {
        if ($section['slug'] === $sectionSlug) {
            $currentSection = $section;
            break;
        }
    }

    if (!$currentSection) {
        http_response_code(404);
        echo $templateEngine->render('templates/page', [
            'site' => $site,
            'sections' => $sections,
            'pageTitle' => '404 - Page Not Found',
            'entries' => [[
                'title' => '404 - Page Not Found',
                'content' => [
                    'description' => '<p>The page you are looking for does not exist.</p><p><a href="/">Go to Homepage</a></p>',
                    'images' => [],
                    'metadata' => ['tags' => []]
                ],
                'published' => true
            ]],
        ]);
        exit;
    }

    // Load entries for section
    $entryModel = new Entry();

    // Single entry view
    if ($entrySlug) {
        $entry = $entryModel->findBySlug($site['id'], $currentSection['id'], $entrySlug);

        if (!$entry || !$entry['published']) {
            http_response_code(404);
            echo $templateEngine->render('templates/page', [
                'site' => $site,
                'sections' => $sections,
                'pageTitle' => '404 - Entry Not Found',
                'entries' => [[
                    'title' => '404 - Entry Not Found',
                    'content' => [
                        'description' => '<p>The entry you are looking for does not exist.</p>',
                        'images' => [],
                        'metadata' => ['tags' => []]
                    ],
                    'published' => true
                ]],
            ]);
            exit;
        }

        // Render entry detail
        $html = $templateEngine->render('templates/entry', [
            'site' => $site,
            'sections' => $sections,
            'section' => $currentSection,
            'entry' => $entry,
            'currentSection' => $currentSection,
            'pageTitle' => $entry['seo']['title'] ?: $entry['title'],
            'seo' => $entry['seo'],
        ]);

        echo $html;
        exit;
    }

    // Section listing view
    $entries = $entryModel->all($site['id'], $currentSection['id']);

    // Filter published
    $entries = array_filter($entries, fn($e) => $e['published']);

    $html = $templateEngine->render("templates/{$currentSection['type']}", [
        'site' => $site,
        'sections' => $sections,
        'section' => $currentSection,
        'entries' => $entries,
        'currentSection' => $currentSection,
        'pageTitle' => $currentSection['seo']['title'] ?: $currentSection['name'],
        'seo' => $currentSection['seo'],
    ]);

    echo $html;

} catch (\Exception $e) {
    // Error page
    if ($app->isDebug()) {
        http_response_code(500);
        echo '<pre>Error: ' . htmlspecialchars($e->getMessage()) . "\n\n";
        echo 'File: ' . $e->getFile() . ':' . $e->getLine() . "\n\n";
        echo 'Trace: ' . $e->getTraceAsString() . '</pre>';
    } else {
        http_response_code(500);
        echo '<!DOCTYPE html><html><head><title>Error</title></head><body><h1>An error occurred</h1><p>Please try again later.</p></body></html>';
    }
}
