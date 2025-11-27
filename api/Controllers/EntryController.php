<?php

namespace Ramingo\Api\Controllers;

use Ramingo\Core\Request;
use Ramingo\Core\Response;
use Ramingo\Api\Models\Entry;
use Ramingo\Api\Models\Section;
use Ramingo\Api\Models\Site;

class EntryController
{
    private Entry $model;
    private Section $sectionModel;
    private Site $siteModel;

    public function __construct()
    {
        $this->model = new Entry();
        $this->sectionModel = new Section();
        $this->siteModel = new Site();
    }

    /**
     * List all entries for a section
     * GET /api/sites/{siteId}/sections/{sectionId}/entries
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

            // Verify section exists
            if (!$this->sectionModel->exists($params['siteId'], $params['sectionId'])) {
                return Response::json([
                    'error' => 'Section not found'
                ], 404);
            }

            $entries = $this->model->all($params['siteId'], $params['sectionId']);

            return Response::json([
                'data' => $entries,
                'count' => count($entries)
            ]);
        } catch (\Throwable $e) {
            return Response::json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a single entry
     * GET /api/sites/{siteId}/entries/{id}
     */
    public function show(Request $request, array $params): Response
    {
        try {
            $entry = $this->model->find($params['siteId'], $params['id']);

            if (!$entry) {
                return Response::json([
                    'error' => 'Entry not found'
                ], 404);
            }

            return Response::json(['data' => $entry]);
        } catch (\Throwable $e) {
            return Response::json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a new entry
     * POST /api/sites/{siteId}/sections/{sectionId}/entries
     */
    public function store(Request $request, array $params): Response
    {
        try {
            // Verify site and section exist
            if (!$this->siteModel->exists($params['siteId'])) {
                return Response::json([
                    'error' => 'Site not found'
                ], 404);
            }

            if (!$this->sectionModel->exists($params['siteId'], $params['sectionId'])) {
                return Response::json([
                    'error' => 'Section not found'
                ], 404);
            }

            $data = $request->all();

            // Validate required fields
            if (empty($data['title'])) {
                return Response::json([
                    'error' => 'Entry title is required'
                ], 400);
            }

            $entry = $this->model->create($params['siteId'], $params['sectionId'], $data);

            return Response::json([
                'data' => $entry,
                'message' => 'Entry created successfully'
            ], 201);
        } catch (\Throwable $e) {
            return Response::json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update an entry
     * PUT /api/sites/{siteId}/entries/{id}
     */
    public function update(Request $request, array $params): Response
    {
        try {
            $data = $request->all();
            $entry = $this->model->update($params['siteId'], $params['id'], $data);

            if (!$entry) {
                return Response::json([
                    'error' => 'Entry not found'
                ], 404);
            }

            return Response::json([
                'data' => $entry,
                'message' => 'Entry updated successfully'
            ]);
        } catch (\Throwable $e) {
            return Response::json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete an entry
     * DELETE /api/sites/{siteId}/entries/{id}
     */
    public function destroy(Request $request, array $params): Response
    {
        try {
            $deleted = $this->model->delete($params['siteId'], $params['id']);

            if (!$deleted) {
                return Response::json([
                    'error' => 'Entry not found'
                ], 404);
            }

            return Response::json([
                'message' => 'Entry deleted successfully'
            ]);
        } catch (\Throwable $e) {
            return Response::json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reorder entries
     * POST /api/sites/{siteId}/sections/{sectionId}/entries/reorder
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

            $this->model->reorder($params['siteId'], $params['sectionId'], $data['order']);

            return Response::json([
                'message' => 'Entries reordered successfully'
            ]);
        } catch (\Throwable $e) {
            return Response::json([
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
