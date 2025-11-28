<?php

namespace Ramingo\Api\Models;

use Ramingo\Api\Services\FileStorage;

class Template
{
    private FileStorage $storage;
    private string $templatesPath;

    public function __construct()
    {
        $this->storage = new FileStorage();
        $this->templatesPath = 'templates';
    }

    /**
     * Get all templates for a site
     */
    public function all(string $siteId): array
    {
        $path = "{$this->templatesPath}/{$siteId}";

        if (!$this->storage->exists($path)) {
            return [];
        }

        $files = $this->storage->list($path);
        $templates = [];

        foreach ($files as $file) {
            if (str_ends_with($file, '.json')) {
                $template = $this->storage->read("{$path}/{$file}");
                if ($template) {
                    $templates[] = $template;
                }
            }
        }

        // Sort by updated date
        usort($templates, fn($a, $b) => strtotime($b['updatedAt']) <=> strtotime($a['updatedAt']));

        return $templates;
    }

    /**
     * Find a template by ID
     */
    public function find(string $siteId, string $id): ?array
    {
        $path = "{$this->templatesPath}/{$siteId}/{$id}.json";

        return $this->storage->read($path);
    }

    /**
     * Create a new template
     */
    public function create(string $siteId, array $data): array
    {
        $id = $data['id'] ?? $this->generateId();

        $template = [
            'id' => $id,
            'siteId' => $siteId,
            'name' => $data['name'],
            'slug' => $data['slug'] ?? $this->generateSlug($data['name']),
            'mode' => $data['mode'] ?? 'block', // block, component, style, hybrid
            'type' => $data['type'] ?? 'page', // page, gallery, blog, entry
            'content' => $data['content'] ?? [],
            'styles' => $data['styles'] ?? [],
            'settings' => $data['settings'] ?? [
                'width' => 'full',
                'spacing' => 'normal',
            ],
            'thumbnail' => $data['thumbnail'] ?? null,
            'isDefault' => $data['isDefault'] ?? false,
            'createdAt' => date('c'),
            'updatedAt' => date('c'),
        ];

        $path = "{$this->templatesPath}/{$siteId}/{$id}.json";
        $this->storage->write($path, $template);

        return $template;
    }

    /**
     * Update a template
     */
    public function update(string $siteId, string $id, array $data): ?array
    {
        $template = $this->find($siteId, $id);

        if (!$template) {
            return null;
        }

        // Update fields
        if (isset($data['name'])) {
            $template['name'] = $data['name'];
        }
        if (isset($data['slug'])) {
            $template['slug'] = $data['slug'];
        }
        if (isset($data['mode'])) {
            $template['mode'] = $data['mode'];
        }
        if (isset($data['type'])) {
            $template['type'] = $data['type'];
        }
        if (isset($data['content'])) {
            $template['content'] = $data['content'];
        }
        if (isset($data['styles'])) {
            $template['styles'] = $data['styles'];
        }
        if (isset($data['settings'])) {
            $template['settings'] = array_merge($template['settings'], $data['settings']);
        }
        if (isset($data['thumbnail'])) {
            $template['thumbnail'] = $data['thumbnail'];
        }
        if (isset($data['isDefault'])) {
            $template['isDefault'] = $data['isDefault'];
        }

        $template['updatedAt'] = date('c');

        $path = "{$this->templatesPath}/{$siteId}/{$id}.json";
        $this->storage->write($path, $template);

        return $template;
    }

    /**
     * Delete a template
     */
    public function delete(string $siteId, string $id): bool
    {
        $path = "{$this->templatesPath}/{$siteId}/{$id}.json";

        return $this->storage->delete($path);
    }

    /**
     * Duplicate a template
     */
    public function duplicate(string $siteId, string $id): ?array
    {
        $template = $this->find($siteId, $id);

        if (!$template) {
            return null;
        }

        unset($template['id']);
        $template['name'] = $template['name'] . ' (Copy)';
        $template['slug'] = $template['slug'] . '-copy';
        $template['isDefault'] = false;

        return $this->create($siteId, $template);
    }

    /**
     * Get default template for a type
     */
    public function getDefault(string $siteId, string $type): ?array
    {
        $templates = $this->all($siteId);

        foreach ($templates as $template) {
            if ($template['type'] === $type && $template['isDefault']) {
                return $template;
            }
        }

        return null;
    }

    /**
     * Generate unique ID
     */
    private function generateId(): string
    {
        return 'tpl_' . bin2hex(random_bytes(8));
    }

    /**
     * Generate slug from name
     */
    private function generateSlug(string $name): string
    {
        $slug = strtolower(trim($name));
        $slug = preg_replace('/[^a-z0-9-]/', '-', $slug);
        $slug = preg_replace('/-+/', '-', $slug);
        return trim($slug, '-');
    }
}
