<?php

namespace Ramingo\Api\Controllers;

use Ramingo\Core\Request;
use Ramingo\Core\Response;
use Ramingo\Api\Models\Section;
use Ramingo\Api\Models\Site;

class SectionController
{
    private Section $model;
    private Site $siteModel;

    public function __construct()
    {
        $this->model = new Section();
        $this->siteModel = new Site();
    }

    /**
     * List all sections for a site
     * GET /api/sites/{siteId}/sections
     */
    public function index(Request $request, array $params): Response
    {
        try {
            // Verify site exists
            if (!$this->siteModel->exists($params['siteId'])) {
                return Response::json([
                    'error' => 'Site not found'
                ], 404);
            }

            $sections = $this->model->all($params['siteId']);

            return Response::json([
                'data' => $sections,
                'count' => count($sections)
            ]);
        } catch (\Throwable $e) {
            return Response::json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a single section
     * GET /api/sites/{siteId}/sections/{id}
     */
    public function show(Request $request, array $params): Response
    {
        try {
            $section = $this->model->find($params['siteId'], $params['id']);

            if (!$section) {
                return Response::json([
                    'error' => 'Section not found'
                ], 404);
            }

            return Response::json(['data' => $section]);
        } catch (\Throwable $e) {
            return Response::json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a new section
     * POST /api/sites/{siteId}/sections
     */
    public function store(Request $request, array $params): Response
    {
        try {
            // Verify site exists
            if (!$this->siteModel->exists($params['siteId'])) {
                return Response::json([
                    'error' => 'Site not found'
                ], 404);
            }

            $data = $request->all();

            // Validate required fields
            if (empty($data['name'])) {
                return Response::json([
                    'error' => 'Section name is required'
                ], 400);
            }

            $section = $this->model->create($params['siteId'], $data);

            return Response::json([
                'data' => $section,
                'message' => 'Section created successfully'
            ], 201);
        } catch (\Throwable $e) {
            return Response::json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a section
     * PUT /api/sites/{siteId}/sections/{id}
     */
    public function update(Request $request, array $params): Response
    {
        try {
            $data = $request->all();
            $section = $this->model->update($params['siteId'], $params['id'], $data);

            if (!$section) {
                return Response::json([
                    'error' => 'Section not found'
                ], 404);
            }

            return Response::json([
                'data' => $section,
                'message' => 'Section updated successfully'
            ]);
        } catch (\Throwable $e) {
            return Response::json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a section
     * DELETE /api/sites/{siteId}/sections/{id}
     */
    public function destroy(Request $request, array $params): Response
    {
        try {
            $deleted = $this->model->delete($params['siteId'], $params['id']);

            if (!$deleted) {
                return Response::json([
                    'error' => 'Section not found'
                ], 404);
            }

            return Response::json([
                'message' => 'Section deleted successfully'
            ]);
        } catch (\Throwable $e) {
            return Response::json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reorder sections
     * POST /api/sites/{siteId}/sections/reorder
     */
    public function reorder(Request $request, array $params): Response
    {
        try {
            $data = $request->all();

            if (empty($data['order']) || !is_array($data['order'])) {
                return Response::json([
                    'error' => 'Order array is required'
                ], 400);
            }

            $this->model->reorder($params['siteId'], $data['order']);

            return Response::json([
                'message' => 'Sections reordered successfully'
            ]);
        } catch (\Throwable $e) {
            return Response::json([
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
