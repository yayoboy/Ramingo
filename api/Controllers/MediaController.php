<?php

namespace Ramingo\Api\Controllers;

use Ramingo\Core\Request;
use Ramingo\Core\Response;
use Ramingo\Api\Services\FileStorage;

class MediaController
{
    private FileStorage $storage;
    private string $uploadDir;

    public function __construct()
    {
        $this->storage = new FileStorage();
        $this->uploadDir = __DIR__ . '/../../storage/media';

        // Create media directory if it doesn't exist
        if (!is_dir($this->uploadDir)) {
            mkdir($this->uploadDir, 0755, true);
        }
    }

    /**
     * Get all media files for a site
     */
    public function index(Request $request, array $params): Response
    {
        $siteId = $params['siteId'];
        $mediaPath = "{$this->uploadDir}/{$siteId}";

        if (!is_dir($mediaPath)) {
            return Response::json(['data' => [], 'count' => 0]);
        }

        $files = [];
        $items = scandir($mediaPath);

        foreach ($items as $item) {
            if ($item === '.' || $item === '..') continue;

            $filePath = "{$mediaPath}/{$item}";
            if (is_file($filePath)) {
                $files[] = [
                    'id' => pathinfo($item, PATHINFO_FILENAME),
                    'filename' => $item,
                    'url' => "/storage/media/{$siteId}/{$item}",
                    'size' => filesize($filePath),
                    'mimeType' => mime_content_type($filePath),
                    'uploadedAt' => date('c', filemtime($filePath)),
                ];
            }
        }

        // Sort by upload date (newest first)
        usort($files, fn($a, $b) => strtotime($b['uploadedAt']) <=> strtotime($a['uploadedAt']));

        return Response::json([
            'data' => $files,
            'count' => count($files),
        ]);
    }

    /**
     * Upload media files
     */
    public function upload(Request $request, array $params): Response
    {
        $siteId = $params['siteId'];

        if (empty($_FILES['files'])) {
            return Response::json(['error' => 'No files uploaded'], 400);
        }

        $mediaPath = "{$this->uploadDir}/{$siteId}";
        if (!is_dir($mediaPath)) {
            mkdir($mediaPath, 0755, true);
        }

        $uploaded = [];
        $errors = [];

        // Handle multiple files
        $files = $_FILES['files'];
        $fileCount = is_array($files['name']) ? count($files['name']) : 1;

        for ($i = 0; $i < $fileCount; $i++) {
            $fileName = is_array($files['name']) ? $files['name'][$i] : $files['name'];
            $fileTmp = is_array($files['tmp_name']) ? $files['tmp_name'][$i] : $files['tmp_name'];
            $fileSize = is_array($files['size']) ? $files['size'][$i] : $files['size'];
            $fileError = is_array($files['error']) ? $files['error'][$i] : $files['error'];

            // Check for upload errors
            if ($fileError !== UPLOAD_ERR_OK) {
                $errors[] = "Error uploading {$fileName}";
                continue;
            }

            // Validate file size (max 10MB)
            if ($fileSize > 10 * 1024 * 1024) {
                $errors[] = "{$fileName} is too large (max 10MB)";
                continue;
            }

            // Validate file type (images only for now)
            $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mimeType = finfo_file($finfo, $fileTmp);
            finfo_close($finfo);

            if (!in_array($mimeType, $allowedTypes)) {
                $errors[] = "{$fileName} is not a valid image file";
                continue;
            }

            // Generate unique filename
            $extension = pathinfo($fileName, PATHINFO_EXTENSION);
            $baseName = pathinfo($fileName, PATHINFO_FILENAME);
            $safeName = preg_replace('/[^a-zA-Z0-9-_]/', '-', $baseName);
            $uniqueId = substr(md5(uniqid()), 0, 8);
            $newFileName = "{$safeName}-{$uniqueId}.{$extension}";
            $destination = "{$mediaPath}/{$newFileName}";

            // Move uploaded file
            if (move_uploaded_file($fileTmp, $destination)) {
                $uploaded[] = [
                    'id' => $uniqueId,
                    'filename' => $newFileName,
                    'url' => "/storage/media/{$siteId}/{$newFileName}",
                    'size' => filesize($destination),
                    'mimeType' => $mimeType,
                    'uploadedAt' => date('c'),
                ];
            } else {
                $errors[] = "Failed to save {$fileName}";
            }
        }

        $response = ['data' => $uploaded, 'count' => count($uploaded)];
        if (!empty($errors)) {
            $response['errors'] = $errors;
        }

        return Response::json($response, empty($uploaded) ? 400 : 200);
    }

    /**
     * Delete a media file
     */
    public function delete(Request $request, array $params): Response
    {
        $siteId = $params['siteId'];
        $fileId = $params['fileId'];
        $mediaPath = "{$this->uploadDir}/{$siteId}";

        // Find file with matching ID
        $files = glob("{$mediaPath}/*{$fileId}*");

        if (empty($files)) {
            return Response::json(['error' => 'File not found'], 404);
        }

        $filePath = $files[0];

        if (unlink($filePath)) {
            return Response::json([
                'message' => 'File deleted successfully',
                'deleted' => true,
            ]);
        }

        return Response::json(['error' => 'Failed to delete file'], 500);
    }
}
