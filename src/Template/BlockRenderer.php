<?php

namespace Ramingo\Template;

class BlockRenderer
{
    private array $context;

    public function __construct(array $context = [])
    {
        $this->context = $context;
    }

    /**
     * Render an array of blocks
     */
    public function render(array $blocks): string
    {
        $html = '';

        foreach ($blocks as $block) {
            $html .= $this->renderBlock($block);
        }

        return $html;
    }

    /**
     * Render a single block
     */
    public function renderBlock(array $block): string
    {
        $type = $block['type'] ?? 'text';
        $content = $block['content'] ?? [];
        $styles = $block['styles'] ?? [];
        $settings = $block['settings'] ?? [];

        return match ($type) {
            'heading' => $this->renderHeading($content, $styles, $settings),
            'text' => $this->renderText($content, $styles, $settings),
            'image' => $this->renderImage($content, $styles, $settings),
            'gallery' => $this->renderGallery($content, $styles, $settings),
            'button' => $this->renderButton($content, $styles, $settings),
            'columns' => $this->renderColumns($content, $styles, $settings),
            'spacer' => $this->renderSpacer($content, $styles, $settings),
            'divider' => $this->renderDivider($styles, $settings),
            'video' => $this->renderVideo($content, $styles, $settings),
            'entries' => $this->renderEntries($content, $styles, $settings),
            'navigation' => $this->renderNavigation($styles, $settings),
            default => $this->renderText($content, $styles, $settings),
        };
    }

    /**
     * Render heading block
     */
    private function renderHeading(array $content, array $styles, array $settings): string
    {
        $level = $settings['level'] ?? 2;
        $text = $content['text'] ?? '';
        $align = $settings['align'] ?? 'left';

        $styleAttr = $this->buildStyleAttribute(array_merge($styles, [
            'text-align' => $align
        ]));

        return "<h{$level} {$styleAttr}>" . htmlspecialchars($text) . "</h{$level}>\n";
    }

    /**
     * Render text block
     */
    private function renderText(array $content, array $styles, array $settings): string
    {
        $html = $content['html'] ?? '';
        $align = $settings['align'] ?? 'left';

        $styleAttr = $this->buildStyleAttribute(array_merge($styles, [
            'text-align' => $align
        ]));

        return "<div {$styleAttr}>{$html}</div>\n";
    }

    /**
     * Render image block
     */
    private function renderImage(array $content, array $styles, array $settings): string
    {
        $src = $content['src'] ?? '';
        $alt = $content['alt'] ?? '';
        $caption = $content['caption'] ?? '';
        $align = $settings['align'] ?? 'center';
        $width = $settings['width'] ?? '100%';

        $wrapperStyle = $this->buildStyleAttribute([
            'text-align' => $align
        ]);

        $imgStyle = $this->buildStyleAttribute(array_merge($styles, [
            'max-width' => $width,
            'height' => 'auto'
        ]));

        $html = "<figure {$wrapperStyle}>\n";
        $html .= "  <img src=\"{$src}\" alt=\"" . htmlspecialchars($alt) . "\" {$imgStyle} />\n";

        if ($caption) {
            $html .= "  <figcaption>" . htmlspecialchars($caption) . "</figcaption>\n";
        }

        $html .= "</figure>\n";

        return $html;
    }

    /**
     * Render gallery block
     */
    private function renderGallery(array $content, array $styles, array $settings): string
    {
        $images = $content['images'] ?? [];
        $columns = $settings['columns'] ?? 3;
        $gap = $settings['gap'] ?? '20px';

        $styleAttr = $this->buildStyleAttribute(array_merge($styles, [
            'display' => 'grid',
            'grid-template-columns' => "repeat({$columns}, 1fr)",
            'gap' => $gap
        ]));

        $html = "<div class=\"gallery\" {$styleAttr}>\n";

        foreach ($images as $image) {
            $src = $image['src'] ?? '';
            $alt = $image['alt'] ?? '';
            $html .= "  <img src=\"{$src}\" alt=\"" . htmlspecialchars($alt) . "\" style=\"width: 100%; height: auto;\" />\n";
        }

        $html .= "</div>\n";

        return $html;
    }

    /**
     * Render button block
     */
    private function renderButton(array $content, array $styles, array $settings): string
    {
        $text = $content['text'] ?? 'Button';
        $url = $content['url'] ?? '#';
        $align = $settings['align'] ?? 'left';
        $variant = $settings['variant'] ?? 'primary';

        $wrapperStyle = $this->buildStyleAttribute(['text-align' => $align]);

        $buttonStyles = array_merge([
            'display' => 'inline-block',
            'padding' => '12px 24px',
            'background-color' => $variant === 'primary' ? '#007bff' : '#6c757d',
            'color' => '#ffffff',
            'text-decoration' => 'none',
            'border-radius' => '4px'
        ], $styles);

        $buttonStyle = $this->buildStyleAttribute($buttonStyles);

        return "<div {$wrapperStyle}><a href=\"{$url}\" {$buttonStyle}>" . htmlspecialchars($text) . "</a></div>\n";
    }

    /**
     * Render columns block
     */
    private function renderColumns(array $content, array $styles, array $settings): string
    {
        $columns = $content['columns'] ?? [];
        $gap = $settings['gap'] ?? '20px';

        $styleAttr = $this->buildStyleAttribute(array_merge($styles, [
            'display' => 'grid',
            'grid-template-columns' => 'repeat(' . count($columns) . ', 1fr)',
            'gap' => $gap
        ]));

        $html = "<div class=\"columns\" {$styleAttr}>\n";

        foreach ($columns as $column) {
            $html .= "  <div class=\"column\">\n";
            $html .= $this->render($column);
            $html .= "  </div>\n";
        }

        $html .= "</div>\n";

        return $html;
    }

    /**
     * Render spacer block
     */
    private function renderSpacer(array $content, array $styles, array $settings): string
    {
        $height = $settings['height'] ?? '40px';

        $styleAttr = $this->buildStyleAttribute(array_merge($styles, [
            'height' => $height
        ]));

        return "<div class=\"spacer\" {$styleAttr}></div>\n";
    }

    /**
     * Render divider block
     */
    private function renderDivider(array $styles, array $settings): string
    {
        $styleAttr = $this->buildStyleAttribute(array_merge([
            'border' => 'none',
            'border-top' => '1px solid #ccc',
            'margin' => '20px 0'
        ], $styles));

        return "<hr {$styleAttr} />\n";
    }

    /**
     * Render video block
     */
    private function renderVideo(array $content, array $styles, array $settings): string
    {
        $url = $content['url'] ?? '';
        $provider = $settings['provider'] ?? 'youtube';
        $align = $settings['align'] ?? 'center';

        $wrapperStyle = $this->buildStyleAttribute(['text-align' => $align]);

        $embedUrl = $this->getEmbedUrl($url, $provider);

        $html = "<div {$wrapperStyle}>\n";
        $html .= "  <iframe src=\"{$embedUrl}\" width=\"560\" height=\"315\" frameborder=\"0\" allowfullscreen></iframe>\n";
        $html .= "</div>\n";

        return $html;
    }

    /**
     * Render entries block (dynamic content)
     */
    private function renderEntries(array $content, array $styles, array $settings): string
    {
        $sectionId = $content['sectionId'] ?? null;
        $limit = $settings['limit'] ?? 10;
        $layout = $settings['layout'] ?? 'grid';

        if (!$sectionId || !isset($this->context['entries'])) {
            return '';
        }

        $entries = $this->context['entries'];

        // Filter by section if specified
        if ($sectionId !== 'all') {
            $entries = array_filter($entries, fn($e) => $e['sectionId'] === $sectionId);
        }

        $entries = array_slice($entries, 0, $limit);

        $styleAttr = $this->buildStyleAttribute(array_merge($styles, [
            'display' => $layout === 'grid' ? 'grid' : 'block',
            'grid-template-columns' => $layout === 'grid' ? 'repeat(auto-fill, minmax(300px, 1fr))' : '1fr',
            'gap' => '20px'
        ]));

        $html = "<div class=\"entries\" {$styleAttr}>\n";

        foreach ($entries as $entry) {
            $html .= "  <article>\n";
            $html .= "    <h3><a href=\"/{$entry['slug']}\">" . htmlspecialchars($entry['title']) . "</a></h3>\n";
            $html .= "  </article>\n";
        }

        $html .= "</div>\n";

        return $html;
    }

    /**
     * Render navigation block
     */
    private function renderNavigation(array $styles, array $settings): string
    {
        $sections = $this->context['sections'] ?? [];
        $currentSection = $this->context['currentSection'] ?? null;

        $styleAttr = $this->buildStyleAttribute(array_merge([
            'display' => 'flex',
            'gap' => '20px',
            'list-style' => 'none',
            'padding' => '0'
        ], $styles));

        $html = "<nav>\n";
        $html .= "  <ul {$styleAttr}>\n";

        foreach ($sections as $section) {
            if (!$section['published']) {
                continue;
            }

            $active = $currentSection && $currentSection['id'] === $section['id'];
            $class = $active ? ' class="active"' : '';

            $html .= "    <li{$class}><a href=\"/{$section['slug']}\">" . htmlspecialchars($section['name']) . "</a></li>\n";
        }

        $html .= "  </ul>\n";
        $html .= "</nav>\n";

        return $html;
    }

    /**
     * Build style attribute from array
     */
    private function buildStyleAttribute(array $styles): string
    {
        if (empty($styles)) {
            return '';
        }

        $styleString = '';

        foreach ($styles as $property => $value) {
            if ($value !== null && $value !== '') {
                $styleString .= "{$property}: {$value}; ";
            }
        }

        return 'style="' . trim($styleString) . '"';
    }

    /**
     * Get embed URL for video providers
     */
    private function getEmbedUrl(string $url, string $provider): string
    {
        if ($provider === 'youtube') {
            // Extract video ID from various YouTube URL formats
            preg_match('/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/', $url, $matches);
            $videoId = $matches[1] ?? '';
            return "https://www.youtube.com/embed/{$videoId}";
        }

        if ($provider === 'vimeo') {
            preg_match('/vimeo\.com\/(\d+)/', $url, $matches);
            $videoId = $matches[1] ?? '';
            return "https://player.vimeo.com/video/{$videoId}";
        }

        return $url;
    }
}
