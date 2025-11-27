<?php

namespace Ramingo\Api\Models;

use Ramingo\Api\Services\FileStorage;

class Entry
{
    private FileStorage $storage;

    public function __construct()
    {
        $this->storage = new FileStorage();
    }

    /**
     * Find an entry by ID
     */
    public function find(string $siteId, string $entryId): ?array
    {
        // Search in all sections to find the entry
        $sections = $this->storage->listDirectories("sites/{$siteId}/entries");

        foreach ($sections as $sectionId) {
            $entry = $this->storage->read("sites/{$siteId}/entries/{$sectionId}/{$entryId}.json");
            if ($entry) {
                return $entry;
            }
        }

        return null;
    }

    /**
     * Find an entry in a specific section
     */
    public function findInSection(string $siteId, string $sectionId, string $entryId): ?array
    {
        return $this->storage->read("sites/{$siteId}/entries/{$sectionId}/{$entryId}.json");
    }

    /**
     * Get all entries for a section
     */
    public function all(string $siteId, string $sectionId): array
    {
        $entryIds = $this->storage->list("sites/{$siteId}/entries/{$sectionId}");
        $entries = [];

        foreach ($entryIds as $id) {
            if ($entry = $this->findInSection($siteId, $sectionId, $id)) {
                $entries[] = $entry;
            }
        }

        // Sort by order, then by date
        usort($entries, function($a, $b) {
            $orderA = $a['order'] ?? 999;
            $orderB = $b['order'] ?? 999;

            if ($orderA === $orderB) {
                return strcmp($b['createdAt'] ?? '', $a['createdAt'] ?? '');
            }

            return $orderA <=> $orderB;
        });

        return $entries;
    }

    /**
     * Create a new entry
     */
    public function create(string $siteId, string $sectionId, array $data): array
    {
        $id = $this->generateId();
        $slug = $data['slug'] ?? $this->generateSlug($data['title'] ?? 'untitled');

        // Ensure unique slug
        $originalSlug = $slug;
        $counter = 1;
        while ($this->slugExists($siteId, $sectionId, $slug)) {
            $slug = "{$originalSlug}-{$counter}";
            $counter++;
        }

        $entry = [
            'id' => $id,
            'section' => $sectionId,
            'slug' => $slug,
            'title' => $data['title'] ?? 'Untitled',
            'content' => $data['content'] ?? [
                'description' => '',
                'images' => [],
                'gallery' => [],
                'metadata' => []
            ],
            'seo' => $data['seo'] ?? [
                'title' => $data['title'] ?? 'Untitled',
                'description' => '',
                'ogImage' => ''
            ],
            'published' => $data['published'] ?? false,
            'featured' => $data['featured'] ?? false,
            'order' => $data['order'] ?? $this->getNextOrder($siteId, $sectionId),
            'createdAt' => date('c'),
            'updatedAt' => date('c')
        ];

        $this->storage->write("sites/{$siteId}/entries/{$sectionId}/{$id}.json", $entry);

        // Update section's entries list
        $this->updateSectionEntries($siteId, $sectionId);

        return $entry;
    }

    /**
     * Update an entry
     */
    public function update(string $siteId, string $entryId, array $data): ?array
    {
        $entry = $this->find($siteId, $entryId);

        if (!$entry) {
            return null;
        }

        $sectionId = $entry['section'];

        // Prevent changing ID and section
        unset($data['id'], $data['section'], $data['createdAt']);

        $entry = array_merge($entry, $data);
        $entry['updatedAt'] = date('c');

        $this->storage->write("sites/{$siteId}/entries/{$sectionId}/{$entryId}.json", $entry);

        return $entry;
    }

    /**
     * Delete an entry
     */
    public function delete(string $siteId, string $entryId): bool
    {
        $entry = $this->find($siteId, $entryId);

        if (!$entry) {
            return false;
        }

        $sectionId = $entry['section'];

        $deleted = $this->storage->delete("sites/{$siteId}/entries/{$sectionId}/{$entryId}.json");

        if ($deleted) {
            // Update section's entries list
            $this->updateSectionEntries($siteId, $sectionId);
        }

        return $deleted;
    }

    /**
     * Reorder entries in a section
     */
    public function reorder(string $siteId, string $sectionId, array $order): bool
    {
        foreach ($order as $index => $entryId) {
            $entry = $this->findInSection($siteId, $sectionId, $entryId);
            if ($entry) {
                $entry['order'] = $index;
                $entry['updatedAt'] = date('c');
                $this->storage->write("sites/{$siteId}/entries/{$sectionId}/{$entryId}.json", $entry);
            }
        }

        return true;
    }

    /**
     * Check if an entry exists
     */
    public function exists(string $siteId, string $entryId): bool
    {
        return $this->find($siteId, $entryId) !== null;
    }

    /**
     * Check if a slug exists in a section
     */
    private function slugExists(string $siteId, string $sectionId, string $slug): bool
    {
        $entries = $this->all($siteId, $sectionId);

        foreach ($entries as $entry) {
            if ($entry['slug'] === $slug) {
                return true;
            }
        }

        return false;
    }

    /**
     * Update section's entries list
     */
    private function updateSectionEntries(string $siteId, string $sectionId): void
    {
        $section = $this->storage->read("sites/{$siteId}/sections/{$sectionId}.json");

        if ($section) {
            $entryIds = $this->storage->list("sites/{$siteId}/entries/{$sectionId}");
            $section['entries'] = $entryIds;
            $section['updatedAt'] = date('c');
            $this->storage->write("sites/{$siteId}/sections/{$sectionId}.json", $section);
        }
    }

    /**
     * Get next order number for a section
     */
    private function getNextOrder(string $siteId, string $sectionId): int
    {
        $entries = $this->all($siteId, $sectionId);

        if (empty($entries)) {
            return 0;
        }

        $maxOrder = max(array_map(fn($e) => $e['order'] ?? 0, $entries));
        return $maxOrder + 1;
    }

    /**
     * Generate a unique entry ID
     */
    private function generateId(): string
    {
        return 'entry-' . bin2hex(random_bytes(8));
    }

    /**
     * Generate slug from title
     */
    private function generateSlug(string $title): string
    {
        $slug = strtolower($title);
        $slug = preg_replace('/[^a-z0-9]+/', '-', $slug);
        return trim($slug, '-') ?: 'untitled';
    }
}
