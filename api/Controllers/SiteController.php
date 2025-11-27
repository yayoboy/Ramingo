<?php

namespace Ramingo\Api\Controllers;

use Ramingo\Core\Request;
use Ramingo\Core\Response;
use Ramingo\Api\Models\Site;

class SiteController
{
    private Site $model;

    public function __construct()
    {
        $this->model = new Site();
    }

    /**
     * List all sites
     * GET /api/sites
     */
    public function index(Request $request, array $params): Response
    {
        try {
            $sites = $this->model->all();

            return Response::json([
                'data' => $sites,
                'count' => count($sites)
            ]);
        } catch (\Throwable $e) {
            return Response::json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a single site
     * GET /api/sites/{id}
     */
    public function show(Request $request, array $params): Response
    {
        try {
            $site = $this->model->find($params['id']);

            if (!$site) {
                return Response::json([
                    'error' => 'Site not found'
                ], 404);
            }

            return Response::json(['data' => $site]);
        } catch (\Throwable $e) {
            return Response::json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a new site
     * POST /api/sites
     */
    public function store(Request $request, array $params): Response
    {
        try {
            $data = $request->all();

            // Validate required fields
            if (empty($data['name'])) {
                return Response::json([
                    'error' => 'Site name is required'
                ], 400);
            }

            $site = $this->model->create($data);

            return Response::json([
                'data' => $site,
                'message' => 'Site created successfully'
            ], 201);
        } catch (\RuntimeException $e) {
            return Response::json([
                'error' => $e->getMessage()
            ], 409);
        } catch (\Throwable $e) {
            return Response::json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a site
     * PUT /api/sites/{id}
     */
    public function update(Request $request, array $params): Response
    {
        try {
            $data = $request->all();
            $site = $this->model->update($params['id'], $data);

            if (!$site) {
                return Response::json([
                    'error' => 'Site not found'
                ], 404);
            }

            return Response::json([
                'data' => $site,
                'message' => 'Site updated successfully'
            ]);
        } catch (\Throwable $e) {
            return Response::json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a site
     * DELETE /api/sites/{id}
     */
    public function destroy(Request $request, array $params): Response
    {
        try {
            $deleted = $this->model->delete($params['id']);

            if (!$deleted) {
                return Response::json([
                    'error' => 'Site not found'
                ], 404);
            }

            return Response::json([
                'message' => 'Site deleted successfully'
            ]);
        } catch (\Throwable $e) {
            return Response::json([
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
