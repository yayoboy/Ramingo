<?php

namespace Ramingo\Template;

/**
 * Template Engine
 * Simple PHP-based template engine with layout support
 */
class Engine
{
    private string $themePath;
    private array $data = [];
    private ?string $layout = null;
    private string $content = '';

    public function __construct(string $themePath)
    {
        $this->themePath = rtrim($themePath, '/');
    }

    /**
     * Set layout file
     */
    public function layout(string $layout): self
    {
        $this->layout = $layout;
        return $this;
    }

    /**
     * Set template data
     */
    public function with(array $data): self
    {
        $this->data = array_merge($this->data, $data);
        return $this;
    }

    /**
     * Render a template (supports both PHP and JSON templates)
     */
    public function render(string $template, array $data = []): string
    {
        // Merge data
        $this->data = array_merge($this->data, $data);

        // Check if template is a JSON template (array format)
        if (is_array($template)) {
            return $this->renderJsonTemplate($template, $this->data);
        }

        // Render PHP template
        $templatePath = "{$this->themePath}/{$template}.php";

        if (!file_exists($templatePath)) {
            throw new \Exception("Template not found: {$template}");
        }

        $this->content = $this->renderFile($templatePath, $this->data);

        // Render with layout if specified
        if ($this->layout) {
            $layoutPath = "{$this->themePath}/layouts/{$this->layout}.php";

            if (!file_exists($layoutPath)) {
                throw new \Exception("Layout not found: {$this->layout}");
            }

            return $this->renderFile($layoutPath, array_merge($this->data, [
                'content' => $this->content
            ]));
        }

        return $this->content;
    }

    /**
     * Render JSON template (visual template builder)
     */
    public function renderJsonTemplate(array $template, array $data = []): string
    {
        $blocks = $template['content'] ?? [];
        $renderer = new BlockRenderer(array_merge($this->data, $data));

        $this->content = $renderer->render($blocks);

        // Render with layout if specified
        if ($this->layout) {
            $layoutPath = "{$this->themePath}/layouts/{$this->layout}.php";

            if (!file_exists($layoutPath)) {
                throw new \Exception("Layout not found: {$this->layout}");
            }

            return $this->renderFile($layoutPath, array_merge($this->data, [
                'content' => $this->content
            ]));
        }

        return $this->content;
    }

    /**
     * Render a file with data
     */
    private function renderFile(string $file, array $data): string
    {
        extract($data);
        ob_start();
        include $file;
        return ob_get_clean();
    }

    /**
     * Escape HTML
     */
    public static function e(?string $value): string
    {
        return htmlspecialchars($value ?? '', ENT_QUOTES, 'UTF-8');
    }

    /**
     * Include partial template
     */
    public function partial(string $name, array $data = []): void
    {
        $partialPath = "{$this->themePath}/partials/{$name}.php";

        if (!file_exists($partialPath)) {
            throw new \Exception("Partial not found: {$name}");
        }

        extract(array_merge($this->data, $data));
        include $partialPath;
    }

    /**
     * Get asset URL
     */
    public function asset(string $path): string
    {
        return '/themes/default/assets/' . ltrim($path, '/');
    }

    /**
     * Get URL for a page
     */
    public function url(string $path = ''): string
    {
        return '/' . ltrim($path, '/');
    }
}
