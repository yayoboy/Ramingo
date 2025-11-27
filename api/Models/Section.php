<?php

namespace Ramingo\Api\Models;

use Ramingo\Api\Services\FileStorage;

class Section
{
    private FileStorage $storage;

    public function __construct()
    {
        $this->storage = new FileStorage();
    }

    /**
     * Find a section by ID
     */
    public function find(string $siteId, string $id): ?array
    {
        return $this->storage->read("sites/{$siteId}/sections/{$id}.json");
    }

    /**
     * Get all sections for a site
     */
    public function all(string $siteId): array
    {
        $sectionIds = $this->storage->list("sites/{$siteId}/sections");
        $sections = [];

        foreach ($sectionIds as $id) {
            if ($section = $this->find($siteId, $id)) {
                $sections[] = $section;
            }
        }

        // Sort by order
        usort($sections, fn($a, $b) => ($a['order'] ?? 999) <=> ($b['order'] ?? 999));

        return $sections;
    }

    /**
     * Create a new section
     */
    public function create(string $siteId, array $data): array
    {
        $id = $data['slug'] ?? $this->generateSlug($data['name'] ?? 'section');

        // Ensure unique ID
        $originalId = $id;
        $counter = 1;
        while ($this->exists($siteId, $id)) {
            $id = "{$originalId}-{$counter}";
            $counter++;
        }

        $section = [
            'id' => $id,
            'name' => $data['name'] ?? 'Untitled Section',
            'slug' => $id,
            'type' => $data['type'] ?? 'page',
            'template' => $data['template'] ?? 'default',
            'settings' => $data['settings'] ?? $this->defaultSettings($data['type'] ?? 'page'),
            'seo' => $data['seo'] ?? [
                'title' => $data['name'] ?? 'Untitled Section',
                'description' => ''
            ],
            'order' => $data['order'] ?? $this->getNextOrder($siteId),
            'published' => $data['published'] ?? true,
            'entries' => [],
            'createdAt' => date('c'),
            'updatedAt' => date('c')
        ];

        $this->storage->write("sites/{$siteId}/sections/{$id}.json", $section);

        // Create entries directory for this section
        $this->storage->createDirectory("sites/{$siteId}/entries/{$id}");

        return $section;
    }

    /**
     * Update a section
     */
    public function update(string $siteId, string $id, array $data): ?array
    {
        $section = $this->find($siteId, $id);

        if (!$section) {
            return null;
        }

        // Prevent changing ID
        unset($data['id'], $data['createdAt']);

        $section = array_merge($section, $data);
        $section['updatedAt'] = date('c');

        $this->storage->write("sites/{$siteId}/sections/{$id}.json", $section);

        return $section;
    }

    /**
     * Delete a section
     */
    public function delete(string $siteId, string $id): bool
    {
        if (!$this->exists($siteId, $id)) {
            return false;
        }

        // Delete section file
        $deleted = $this->storage->delete("sites/{$siteId}/sections/{$id}.json");

        // Also delete entries directory (optional - could be preserved)
        $this->storage->deleteDirectory("sites/{$siteId}/entries/{$id}");

        return $deleted;
    }

    /**
     * Reorder sections
     */
    public function reorder(string $siteId, array $order): bool
    {
        foreach ($order as $index => $sectionId) {
            $section = $this->find($siteId, $sectionId);
            if ($section) {
                $section['order'] = $index;
                $section['updatedAt'] = date('c');
                $this->storage->write("sites/{$siteId}/sections/{$sectionId}.json", $section);
            }
        }

        return true;
    }

    /**
     * Check if section exists
     */
    public function exists(string $siteId, string $id): bool
    {
        return $this->storage->exists("sites/{$siteId}/sections/{$id}.json");
    }

    /**
     * Get next order number
     */
    private function getNextOrder(string $siteId): int
    {
        $sections = $this->all($siteId);

        if (empty($sections)) {
            return 0;
        }

        $maxOrder = max(array_map(fn($s) => $s['order'] ?? 0, $sections));
        return $maxOrder + 1;
    }

    /**
     * Generate slug from name
     */
    private function generateSlug(string $name): string
    {
        $slug = strtolower($name);
        $slug = preg_replace('/[^a-z0-9]+/', '-', $slug);
        return trim($slug, '-');
    }

    /**
     * Default settings based on section type
     */
    private function defaultSettings(string $type): array
    {
        $defaults = [
            'gallery' => [
                'layout' => 'grid',
                'columns' => 3,
                'showTitles' => true,
                'enableLightbox' => true
            ],
            'blog' => [
                'postsPerPage' => 10,
                'showExcerpt' => true,
                'showDate' => true,
                'showAuthor' => false
            ],
            'page' => [
                'layout' => 'default'
            ]
        ];

        return $defaults[$type] ?? $defaults['page'];
    }
}
