<?php

namespace Ramingo\Api\Models;

use Ramingo\Api\Services\FileStorage;

class Site
{
    private FileStorage $storage;

    public function __construct()
    {
        $this->storage = new FileStorage();
    }

    /**
     * Find a site by ID
     */
    public function find(string $id): ?array
    {
        return $this->storage->read("sites/{$id}/config.json");
    }

    /**
     * Get all sites
     */
    public function all(): array
    {
        $siteIds = $this->storage->listDirectories('sites');
        $sites = [];

        foreach ($siteIds as $id) {
            if ($site = $this->find($id)) {
                $sites[] = $site;
            }
        }

        return $sites;
    }

    /**
     * Create a new site
     */
    public function create(array $data): array
    {
        $id = $data['id'] ?? $this->generateId($data['name'] ?? 'site');

        // Check if site already exists
        if ($this->exists($id)) {
            throw new \RuntimeException("Site with ID '{$id}' already exists");
        }

        $site = [
            'id' => $id,
            'name' => $data['name'] ?? 'My Site',
            'domain' => $data['domain'] ?? '',
            'theme' => $data['theme'] ?? 'default',
            'settings' => array_merge($this->defaultSettings(), $data['settings'] ?? []),
            'navigation' => $data['navigation'] ?? [],
            'createdAt' => date('c'),
            'updatedAt' => date('c')
        ];

        // Create site structure
        $this->storage->createDirectory("sites/{$id}");
        $this->storage->createDirectory("sites/{$id}/sections");
        $this->storage->createDirectory("sites/{$id}/entries");
        $this->storage->createDirectory("sites/{$id}/media");
        $this->storage->createDirectory("sites/{$id}/media/images");
        $this->storage->createDirectory("sites/{$id}/media/files");

        // Save config
        $this->storage->write("sites/{$id}/config.json", $site);

        return $site;
    }

    /**
     * Update a site
     */
    public function update(string $id, array $data): ?array
    {
        $site = $this->find($id);

        if (!$site) {
            return null;
        }

        // Merge data, preserving id and created date
        unset($data['id'], $data['createdAt']);

        $site = array_merge($site, $data);
        $site['updatedAt'] = date('c');

        $this->storage->write("sites/{$id}/config.json", $site);

        return $site;
    }

    /**
     * Delete a site
     */
    public function delete(string $id): bool
    {
        if (!$this->exists($id)) {
            return false;
        }

        // Delete the entire site directory
        return $this->storage->deleteDirectory("sites/{$id}");
    }

    /**
     * Check if a site exists
     */
    public function exists(string $id): bool
    {
        return $this->storage->exists("sites/{$id}/config.json");
    }

    /**
     * Generate a site ID from name
     */
    private function generateId(string $name): string
    {
        $slug = $this->slugify($name);

        // Check if slug is unique
        if (!$this->exists($slug)) {
            return $slug;
        }

        // Add number suffix if not unique
        $counter = 1;
        while ($this->exists("{$slug}-{$counter}")) {
            $counter++;
        }

        return "{$slug}-{$counter}";
    }

    /**
     * Create URL-friendly slug
     */
    private function slugify(string $text): string
    {
        $text = strtolower($text);
        $text = preg_replace('/[^a-z0-9]+/', '-', $text);
        return trim($text, '-');
    }

    /**
     * Default site settings
     */
    private function defaultSettings(): array
    {
        return [
            'title' => 'My Site',
            'description' => '',
            'language' => 'en',
            'timezone' => 'UTC',
            'seo' => [
                'enableSitemap' => true,
                'enableRobots' => true,
                'googleAnalytics' => ''
            ],
            'fonts' => [
                'heading' => 'Inter',
                'body' => 'Inter'
            ],
            'colors' => [
                'primary' => '#000000',
                'secondary' => '#ffffff',
                'accent' => '#3b82f6'
            ]
        ];
    }
}
