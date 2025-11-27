<?php

namespace Ramingo\Utils;

use Ramingo\Api\Models\Site;
use Ramingo\Api\Models\Section;
use Ramingo\Api\Models\Entry;

class SitemapGenerator
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
     * Generate XML sitemap for a site
     */
    public function generate(string $siteId): string
    {
        $site = $this->siteModel->find($siteId);

        if (!$site) {
            throw new \Exception("Site not found: {$siteId}");
        }

        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

        // Add homepage
        $xml .= $this->addUrl('/', '1.0', 'daily', date('c'));

        // Add sections
        $sections = $this->sectionModel->all($siteId);

        foreach ($sections as $section) {
            if (!$section['published']) {
                continue;
            }

            // Section page
            $xml .= $this->addUrl(
                '/' . $section['slug'],
                '0.8',
                'weekly',
                $section['updatedAt']
            );

            // Section entries
            $entries = $this->entryModel->all($siteId, $section['id']);

            foreach ($entries as $entry) {
                if (!$entry['published']) {
                    continue;
                }

                $xml .= $this->addUrl(
                    '/' . $section['slug'] . '/' . $entry['slug'],
                    '0.6',
                    'monthly',
                    $entry['updatedAt']
                );
            }
        }

        $xml .= '</urlset>';

        return $xml;
    }

    /**
     * Add URL to sitemap
     */
    private function addUrl(string $path, string $priority, string $changefreq, string $lastmod): string
    {
        $url = $this->baseUrl . $path;
        $lastmod = date('Y-m-d', strtotime($lastmod));

        return <<<XML
  <url>
    <loc>{$url}</loc>
    <lastmod>{$lastmod}</lastmod>
    <changefreq>{$changefreq}</changefreq>
    <priority>{$priority}</priority>
  </url>

XML;
    }

    /**
     * Generate robots.txt content
     */
    public function generateRobotsTxt(string $siteId): string
    {
        $site = $this->siteModel->find($siteId);

        if (!$site || !($site['settings']['seo']['enableRobots'] ?? true)) {
            return "User-agent: *\nDisallow: /\n";
        }

        $content = "User-agent: *\n";
        $content .= "Allow: /\n";
        $content .= "Disallow: /admin\n";
        $content .= "Disallow: /api\n";
        $content .= "Disallow: /storage\n\n";
        $content .= "Sitemap: {$this->baseUrl}/sitemap.xml\n";

        return $content;
    }
}
