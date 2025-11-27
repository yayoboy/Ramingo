<?php

namespace Ramingo\Utils;

use Ramingo\Api\Models\Site;
use Ramingo\Api\Models\Section;
use Ramingo\Api\Models\Entry;

class RSSGenerator
{
    private Site $siteModel;
    private Section $sectionModel;
    private Entry $entryModel;
    private string $baseUrl;

    public function __construct(string $baseUrl)
    {
        $this->siteModel = new Site();
        $this->sectionModel = new Section();
        $this->entryModel = new Entry();
        $this->baseUrl = rtrim($baseUrl, '/');
    }

    /**
     * Generate RSS feed for a section
     */
    public function generate(string $siteId, string $sectionId, int $limit = 20): string
    {
        $site = $this->siteModel->find($siteId);
        $section = $this->sectionModel->find($siteId, $sectionId);

        if (!$site || !$section) {
            throw new \Exception("Site or section not found");
        }

        $entries = $this->entryModel->all($siteId, $sectionId);

        // Filter published and limit
        $entries = array_filter($entries, fn($e) => $e['published']);
        $entries = array_slice($entries, 0, $limit);

        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">' . "\n";
        $xml .= '<channel>' . "\n";

        $xml .= '  <title>' . htmlspecialchars($section['name']) . ' - ' . htmlspecialchars($site['settings']['title']) . '</title>' . "\n";
        $xml .= '  <link>' . $this->baseUrl . '/' . $section['slug'] . '</link>' . "\n";
        $xml .= '  <description>' . htmlspecialchars($site['settings']['description']) . '</description>' . "\n";
        $xml .= '  <language>' . ($site['settings']['language'] ?? 'en') . '</language>' . "\n";
        $xml .= '  <lastBuildDate>' . date('r') . '</lastBuildDate>' . "\n";
        $xml .= '  <atom:link href="' . $this->baseUrl . '/' . $section['slug'] . '/feed.xml" rel="self" type="application/rss+xml" />' . "\n";

        foreach ($entries as $entry) {
            $xml .= '  <item>' . "\n";
            $xml .= '    <title>' . htmlspecialchars($entry['title']) . '</title>' . "\n";
            $xml .= '    <link>' . $this->baseUrl . '/' . $section['slug'] . '/' . $entry['slug'] . '</link>' . "\n";
            $xml .= '    <guid>' . $this->baseUrl . '/' . $section['slug'] . '/' . $entry['slug'] . '</guid>' . "\n";
            $xml .= '    <pubDate>' . date('r', strtotime($entry['createdAt'])) . '</pubDate>' . "\n";

            // Description (excerpt from HTML content)
            $description = strip_tags($entry['content']['description']);
            $description = mb_substr($description, 0, 300) . '...';
            $xml .= '    <description>' . htmlspecialchars($description) . '</description>' . "\n";

            // Categories (tags)
            if (!empty($entry['content']['metadata']['tags'])) {
                foreach ($entry['content']['metadata']['tags'] as $tag) {
                    $xml .= '    <category>' . htmlspecialchars($tag) . '</category>' . "\n";
                }
            }

            $xml .= '  </item>' . "\n";
        }

        $xml .= '</channel>' . "\n";
        $xml .= '</rss>';

        return $xml;
    }
}
