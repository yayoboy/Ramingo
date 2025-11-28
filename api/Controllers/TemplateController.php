<?php

namespace Ramingo\Api\Controllers;

use Ramingo\Core\Request;
use Ramingo\Core\Response;
use Ramingo\Api\Models\Template;

class TemplateController
{
    private Template $templateModel;

    public function __construct()
    {
        $this->templateModel = new Template();
    }

    /**
     * GET /api/sites/{siteId}/templates
     * List all templates
     */
    public function index(Request $request, array $params): Response
    {
        $siteId = $params['siteId'];
        $templates = $this->templateModel->all($siteId);

        return Response::json([
            'data' => $templates,
            'meta' => [
                'count' => count($templates)
            ]
        ]);
    }

    /**
     * GET /api/sites/{siteId}/templates/{id}
     * Get a single template
     */
    public function show(Request $request, array $params): Response
    {
        $siteId = $params['siteId'];
        $id = $params['id'];

        $template = $this->templateModel->find($siteId, $id);

        if (!$template) {
            return Response::json(['error' => 'Template not found'], 404);
        }

        return Response::json(['data' => $template]);
    }

    /**
     * POST /api/sites/{siteId}/templates
     * Create a new template
     */
    public function store(Request $request, array $params): Response
    {
        $siteId = $params['siteId'];
        $data = $request->all();

        // Validate required fields
        if (empty($data['name'])) {
            return Response::json(['error' => 'Name is required'], 400);
        }

        $template = $this->templateModel->create($siteId, $data);

        return Response::json([
            'data' => $template,
            'message' => 'Template created successfully'
        ], 201);
    }

    /**
     * PUT /api/sites/{siteId}/templates/{id}
     * Update a template
     */
    public function update(Request $request, array $params): Response
    {
        $siteId = $params['siteId'];
        $id = $params['id'];
        $data = $request->all();

        $template = $this->templateModel->update($siteId, $id, $data);

        if (!$template) {
            return Response::json(['error' => 'Template not found'], 404);
        }

        return Response::json([
            'data' => $template,
            'message' => 'Template updated successfully'
        ]);
    }

    /**
     * DELETE /api/sites/{siteId}/templates/{id}
     * Delete a template
     */
    public function destroy(Request $request, array $params): Response
    {
        $siteId = $params['siteId'];
        $id = $params['id'];

        $success = $this->templateModel->delete($siteId, $id);

        if (!$success) {
            return Response::json(['error' => 'Template not found'], 404);
        }

        return Response::json([
            'message' => 'Template deleted successfully'
        ]);
    }

    /**
     * POST /api/sites/{siteId}/templates/{id}/duplicate
     * Duplicate a template
     */
    public function duplicate(Request $request, array $params): Response
    {
        $siteId = $params['siteId'];
        $id = $params['id'];

        $template = $this->templateModel->duplicate($siteId, $id);

        if (!$template) {
            return Response::json(['error' => 'Template not found'], 404);
        }

        return Response::json([
            'data' => $template,
            'message' => 'Template duplicated successfully'
        ], 201);
    }

    /**
     * GET /api/sites/{siteId}/templates/default/{type}
     * Get default template for a type
     */
    public function getDefault(Request $request, array $params): Response
    {
        $siteId = $params['siteId'];
        $type = $params['type'];

        $template = $this->templateModel->getDefault($siteId, $type);

        if (!$template) {
            return Response::json(['error' => 'No default template found'], 404);
        }

        return Response::json(['data' => $template]);
    }
}
