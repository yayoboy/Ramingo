<?php

namespace Ramingo\Api\Controllers;

use Ramingo\Core\Request;
use Ramingo\Core\Response;
use Ramingo\Api\Models\Site;

class SettingsController
{
    private Site $siteModel;

    public function __construct()
    {
        $this->siteModel = new Site();
    }

    /**
     * Get site settings
     */
    public function show(Request $request, array $params): Response
    {
        $siteId = $params['siteId'];
        $site = $this->siteModel->find($siteId);

        if (!$site) {
            return Response::json(['error' => 'Site not found'], 404);
        }

        return Response::json([
            'data' => $site['settings']
        ]);
    }

    /**
     * Update site settings
     */
    public function update(Request $request, array $params): Response
    {
        $siteId = $params['siteId'];
        $site = $this->siteModel->find($siteId);

        if (!$site) {
            return Response::json(['error' => 'Site not found'], 404);
        }

        $data = $request->all();

        // Update settings
        $site['settings'] = array_merge($site['settings'], $data['settings'] ?? []);
        $site['updatedAt'] = date('c');

        $updated = $this->siteModel->update($siteId, $site);

        return Response::json([
            'data' => $updated['settings'],
            'message' => 'Settings updated successfully'
        ]);
    }

    /**
     * Get theme settings
     */
    public function getTheme(Request $request, array $params): Response
    {
        $siteId = $params['siteId'];
        $site = $this->siteModel->find($siteId);

        if (!$site) {
            return Response::json(['error' => 'Site not found'], 404);
        }

        return Response::json([
            'data' => [
                'theme' => $site['theme'] ?? 'default',
                'fonts' => $site['settings']['fonts'] ?? [],
                'colors' => $site['settings']['colors'] ?? [],
            ]
        ]);
    }

    /**
     * Update theme settings
     */
    public function updateTheme(Request $request, array $params): Response
    {
        $siteId = $params['siteId'];
        $site = $this->siteModel->find($siteId);

        if (!$site) {
            return Response::json(['error' => 'Site not found'], 404);
        }

        $data = $request->all();

        // Update theme settings
        if (isset($data['theme'])) {
            $site['theme'] = $data['theme'];
        }

        if (isset($data['fonts'])) {
            $site['settings']['fonts'] = $data['fonts'];
        }

        if (isset($data['colors'])) {
            $site['settings']['colors'] = $data['colors'];
        }

        $site['updatedAt'] = date('c');
        $updated = $this->siteModel->update($siteId, $site);

        return Response::json([
            'data' => [
                'theme' => $updated['theme'],
                'fonts' => $updated['settings']['fonts'],
                'colors' => $updated['settings']['colors'],
            ],
            'message' => 'Theme settings updated successfully'
        ]);
    }
}
