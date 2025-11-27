# Ramingo CMS - Architecture Document

## Executive Summary

Ramingo is a flat-file CMS inspired by Berta CMS, designed for simplicity, portability, and visual editing. It uses JSON-based storage instead of databases, providing a modern WYSIWYG inline editing experience with React-based admin interface while maintaining PHP backend compatibility.

## Core Philosophy

- **Flat-File First**: No database required - all content in JSON files
- **What You See Is What You Get**: Inline editing on the actual published site
- **Developer-Friendly**: Git-based workflow, simple deployment, easy theming
- **Performance-Oriented**: Fast loading, minimal dependencies, static export capable

---

## Technology Stack

### Backend Core
- **PHP 8.3+**
  - Modern language features (enums, readonly properties, attributes)
  - Built-in web server for development
  - Strong typing and error handling
  - Native JSON processing

### Frontend Admin Panel
- **React 18** with **Vite 5**
  - Fast HMR (Hot Module Replacement)
  - Modern build tooling
  - Component-based architecture

- **shadcn/ui + Tailwind CSS**
  - Utility-first CSS framework
  - Accessible, customizable components
  - Consistent design system
  - Dark mode support

- **WYSIWYG Editor**
  - **Tiptap** (ProseMirror-based)
  - Inline editing capabilities
  - Custom extensions support
  - Collaborative editing ready

### Frontend Public Site
- **PHP Templating Engine**
  - Simple, performant rendering
  - No JavaScript required for content display
  - SEO-friendly HTML output
  - Template inheritance and includes

### Storage & Data
- **JSON Flat Files**
  - Human-readable content format
  - Git-friendly versioning
  - Easy backup and migration
  - No database overhead

### Development Tools
- **Composer** - PHP dependency management
- **Node/npm** - Frontend tooling
- **Git** - Version control for content and code
- **Docker** (optional) - Consistent development environment

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     User Browser                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────┐      ┌─────────────────────┐   │
│  │  Public Site     │      │   Admin Panel       │   │
│  │  (PHP + HTML)    │      │   (React SPA)       │   │
│  └────────┬─────────┘      └──────────┬──────────┘   │
│           │                            │               │
└───────────┼────────────────────────────┼───────────────┘
            │                            │
            ▼                            ▼
┌─────────────────────────────────────────────────────────┐
│                    PHP Backend API                      │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │   Router     │  │    Auth      │  │   Content   │  │
│  │              │  │   Manager    │  │   Manager   │  │
│  └──────────────┘  └──────────────┘  └─────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │    Media     │  │    Theme     │  │   Export    │  │
│  │   Manager    │  │   Manager    │  │   Manager   │  │
│  └──────────────┘  └──────────────┘  └─────────────┘  │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              Flat-File Storage Layer                    │
│                                                         │
│  /data/                                                 │
│    ├── sites/                                          │
│    │   ├── {site-id}/                                  │
│    │   │   ├── config.json                             │
│    │   │   ├── sections/                               │
│    │   │   │   ├── {section-id}.json                   │
│    │   │   └── media/                                  │
│    │   │       ├── images/                             │
│    │   │       └── files/                              │
│    └── users.json                                      │
└─────────────────────────────────────────────────────────┘
```

### Request Flow

#### Public Site Request
1. User requests `https://example.com/portfolio/project-1`
2. Apache mod_rewrite routes to `index.php`
3. Router parses URL and loads site config
4. Content Manager loads section and entry data from JSON
5. Theme Manager selects appropriate template
6. PHP renders HTML with content
7. Response sent to browser

#### Admin Panel Request
1. User accesses `https://example.com/admin`
2. React SPA loads
3. Authentication check via API
4. Admin makes content changes
5. API endpoint receives JSON payload
6. Content Manager validates and writes to JSON files
7. Success response triggers live preview update

---

## Directory Structure

```
ramingo/
├── admin/                          # React Admin Panel
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                # shadcn/ui components
│   │   │   ├── Editor/            # WYSIWYG editor components
│   │   │   ├── MediaManager/      # Media upload/management
│   │   │   ├── SectionManager/    # Section/entry management
│   │   │   └── ThemeCustomizer/   # Theme settings
│   │   ├── lib/
│   │   │   ├── api.ts             # API client
│   │   │   └── utils.ts           # Utilities
│   │   ├── hooks/                 # React hooks
│   │   ├── pages/                 # Admin pages
│   │   ├── App.tsx                # Main app component
│   │   └── main.tsx               # Entry point
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── api/                           # PHP Backend API
│   ├── bootstrap.php              # Application initialization
│   ├── routes.php                 # API route definitions
│   ├── Controllers/
│   │   ├── AuthController.php
│   │   ├── ContentController.php
│   │   ├── MediaController.php
│   │   ├── SiteController.php
│   │   └── ThemeController.php
│   ├── Models/
│   │   ├── Site.php
│   │   ├── Section.php
│   │   ├── Entry.php
│   │   └── User.php
│   ├── Services/
│   │   ├── FileStorage.php        # JSON file operations
│   │   ├── MediaService.php       # Image processing
│   │   ├── ThemeService.php       # Theme management
│   │   └── ExportService.php      # Static export
│   └── Middleware/
│       ├── AuthMiddleware.php
│       └── CorsMiddleware.php
│
├── public/                        # Web root
│   ├── index.php                  # Public site entry
│   ├── .htaccess                  # Apache rewrite rules
│   ├── assets/                    # Compiled admin assets
│   └── media/                     # Symlink to data/sites/*/media
│
├── themes/                        # Site themes
│   ├── default/
│   │   ├── theme.json             # Theme metadata
│   │   ├── templates/
│   │   │   ├── layout.php         # Base layout
│   │   │   ├── section.php        # Section template
│   │   │   └── entry.php          # Entry template
│   │   ├── assets/
│   │   │   ├── css/
│   │   │   └── js/
│   │   └── screenshot.png
│   └── minimal/
│       └── ...
│
├── data/                          # Flat-file storage
│   ├── sites/
│   │   └── default/
│   │       ├── config.json        # Site configuration
│   │       ├── sections/          # Section definitions
│   │       │   ├── home.json
│   │       │   └── portfolio.json
│   │       ├── entries/           # Content entries
│   │       │   └── portfolio/
│   │       │       ├── project-1.json
│   │       │       └── project-2.json
│   │       └── media/             # Uploaded media
│   │           ├── images/
│   │           └── files/
│   ├── users.json                 # User accounts
│   └── .gitignore
│
├── src/                           # PHP Core Classes
│   ├── Core/
│   │   ├── Application.php        # Main application
│   │   ├── Router.php             # URL routing
│   │   ├── Request.php            # HTTP request
│   │   └── Response.php           # HTTP response
│   ├── Template/
│   │   ├── Engine.php             # Template rendering
│   │   └── Helpers.php            # Template helpers
│   └── Utils/
│       ├── Config.php             # Configuration loader
│       └── Security.php           # Security utilities
│
├── config/                        # Configuration files
│   ├── app.php                    # Application config
│   ├── sites.php                  # Multisite config
│   └── storage.php                # Storage paths
│
├── tests/                         # Test suite
│   ├── Unit/
│   ├── Integration/
│   └── E2E/
│
├── docker/                        # Docker setup (optional)
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── nginx.conf
│
├── scripts/                       # Utility scripts
│   ├── create-site.php
│   ├── export-static.php
│   └── backup.php
│
├── composer.json                  # PHP dependencies
├── composer.lock
├── .env.example                   # Environment template
├── .gitignore
├── README.md
└── ARCHITECTURE.md               # This file
```

---

## Data Storage Format

### Site Configuration (`data/sites/{site-id}/config.json`)

```json
{
  "id": "default",
  "name": "My Portfolio",
  "domain": "example.com",
  "theme": "default",
  "settings": {
    "title": "John Doe - Portfolio",
    "description": "Creative portfolio",
    "language": "en",
    "timezone": "Europe/Rome",
    "seo": {
      "enableSitemap": true,
      "enableRobots": true,
      "googleAnalytics": ""
    },
    "fonts": {
      "heading": "Playfair Display",
      "body": "Inter"
    },
    "colors": {
      "primary": "#000000",
      "secondary": "#ffffff",
      "accent": "#ff6b6b"
    }
  },
  "navigation": [
    { "label": "Home", "section": "home" },
    { "label": "Portfolio", "section": "portfolio" },
    { "label": "About", "section": "about" }
  ],
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-01-20T14:30:00Z"
}
```

### Section Definition (`data/sites/{site-id}/sections/portfolio.json`)

```json
{
  "id": "portfolio",
  "name": "Portfolio",
  "slug": "portfolio",
  "type": "gallery",
  "template": "gallery",
  "settings": {
    "layout": "grid",
    "columns": 3,
    "showTitles": true,
    "enableLightbox": true
  },
  "seo": {
    "title": "Portfolio",
    "description": "My creative work"
  },
  "order": 2,
  "published": true,
  "entries": [
    "project-1",
    "project-2",
    "project-3"
  ],
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-01-20T14:30:00Z"
}
```

### Entry Content (`data/sites/{site-id}/entries/portfolio/project-1.json`)

```json
{
  "id": "project-1",
  "section": "portfolio",
  "slug": "amazing-website-project",
  "title": "Amazing Website Project",
  "content": {
    "description": "<p>This is an <strong>amazing</strong> project...</p>",
    "images": [
      {
        "id": "img-001",
        "filename": "project-hero.jpg",
        "path": "media/images/2025/01/project-hero.jpg",
        "alt": "Project hero image",
        "caption": "Main project view",
        "width": 1920,
        "height": 1080
      }
    ],
    "gallery": [
      "media/images/2025/01/detail-1.jpg",
      "media/images/2025/01/detail-2.jpg"
    ],
    "metadata": {
      "client": "Acme Corp",
      "year": "2025",
      "tags": ["web", "design", "react"]
    }
  },
  "seo": {
    "title": "Amazing Website Project - Portfolio",
    "description": "Custom description for this project",
    "ogImage": "media/images/2025/01/project-hero.jpg"
  },
  "published": true,
  "featured": true,
  "order": 1,
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-01-20T14:30:00Z"
}
```

### User Data (`data/users.json`)

```json
{
  "users": [
    {
      "id": "usr-001",
      "username": "admin",
      "email": "admin@example.com",
      "passwordHash": "$2y$10$...",
      "role": "admin",
      "sites": ["default", "site-2"],
      "preferences": {
        "theme": "dark",
        "language": "en"
      },
      "createdAt": "2025-01-15T10:00:00Z",
      "lastLogin": "2025-01-20T14:30:00Z"
    }
  ]
}
```

---

## Core Components

### 1. Router System

**Purpose**: Handle URL routing for both public site and API

**Implementation**: `src/Core/Router.php`

```php
<?php

namespace Ramingo\Core;

class Router {
    private array $routes = [];
    private string $basePath = '';

    public function get(string $path, callable $handler): void {
        $this->addRoute('GET', $path, $handler);
    }

    public function post(string $path, callable $handler): void {
        $this->addRoute('POST', $path, $handler);
    }

    public function dispatch(Request $request): Response {
        $method = $request->getMethod();
        $path = $this->normalizePath($request->getPath());

        foreach ($this->routes[$method] ?? [] as $route) {
            if ($params = $this->match($route['pattern'], $path)) {
                return call_user_func($route['handler'], $request, $params);
            }
        }

        return new Response('Not Found', 404);
    }

    private function match(string $pattern, string $path): ?array {
        // Pattern matching with named parameters
        // /portfolio/{slug} => ['slug' => 'project-1']
    }
}
```

### 2. Content Manager

**Purpose**: Read/write content from JSON files

**Implementation**: `api/Services/FileStorage.php`

```php
<?php

namespace Ramingo\Services;

class FileStorage {
    private string $dataPath;

    public function __construct(string $dataPath) {
        $this->dataPath = rtrim($dataPath, '/');
    }

    public function readSection(string $siteId, string $sectionId): ?array {
        $path = "{$this->dataPath}/sites/{$siteId}/sections/{$sectionId}.json";

        if (!file_exists($path)) {
            return null;
        }

        $data = file_get_contents($path);
        return json_decode($data, true);
    }

    public function writeSection(string $siteId, string $sectionId, array $data): bool {
        $path = "{$this->dataPath}/sites/{$siteId}/sections/{$sectionId}.json";
        $dir = dirname($path);

        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $data['updatedAt'] = date('c');
        $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

        return file_put_contents($path, $json) !== false;
    }

    public function readEntry(string $siteId, string $section, string $entryId): ?array {
        $path = "{$this->dataPath}/sites/{$siteId}/entries/{$section}/{$entryId}.json";

        if (!file_exists($path)) {
            return null;
        }

        $data = file_get_contents($path);
        return json_decode($data, true);
    }

    public function listEntries(string $siteId, string $section): array {
        $dir = "{$this->dataPath}/sites/{$siteId}/entries/{$section}";

        if (!is_dir($dir)) {
            return [];
        }

        $files = glob("{$dir}/*.json");
        $entries = [];

        foreach ($files as $file) {
            $data = json_decode(file_get_contents($file), true);
            $entries[] = $data;
        }

        // Sort by order
        usort($entries, fn($a, $b) => ($a['order'] ?? 999) <=> ($b['order'] ?? 999));

        return $entries;
    }
}
```

### 3. Template Engine

**Purpose**: Render PHP templates with data

**Implementation**: `src/Template/Engine.php`

```php
<?php

namespace Ramingo\Template;

class Engine {
    private string $themePath;
    private array $data = [];

    public function __construct(string $themePath) {
        $this->themePath = rtrim($themePath, '/');
    }

    public function render(string $template, array $data = []): string {
        $this->data = array_merge($this->data, $data);

        $templatePath = "{$this->themePath}/templates/{$template}.php";

        if (!file_exists($templatePath)) {
            throw new \RuntimeException("Template not found: {$template}");
        }

        ob_start();
        extract($this->data);
        require $templatePath;
        return ob_get_clean();
    }

    public function partial(string $name, array $data = []): string {
        return $this->render("partials/{$name}", $data);
    }
}
```

### 4. Media Manager

**Purpose**: Handle file uploads and image processing

**Implementation**: `api/Services/MediaService.php`

```php
<?php

namespace Ramingo\Services;

class MediaService {
    private string $mediaPath;
    private array $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    public function upload(array $file, string $siteId): array {
        // Validate file
        if (!in_array($file['type'], $this->allowedTypes)) {
            throw new \InvalidArgumentException('Invalid file type');
        }

        // Generate unique filename
        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = uniqid() . '.' . $ext;
        $date = date('Y/m');
        $relativePath = "media/images/{$date}/{$filename}";
        $fullPath = "{$this->mediaPath}/sites/{$siteId}/{$relativePath}";

        // Create directory
        $dir = dirname($fullPath);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        // Move file
        move_uploaded_file($file['tmp_name'], $fullPath);

        // Get image dimensions
        list($width, $height) = getimagesize($fullPath);

        // Create thumbnails
        $this->createThumbnail($fullPath, 800, 800);

        return [
            'filename' => $filename,
            'path' => $relativePath,
            'width' => $width,
            'height' => $height,
            'size' => filesize($fullPath),
            'type' => $file['type']
        ];
    }

    private function createThumbnail(string $source, int $maxWidth, int $maxHeight): void {
        // Use GD library to create thumbnail
        // Save as {filename}_thumb.jpg
    }
}
```

---

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Sites
- `GET /api/sites` - List all sites (multisite)
- `GET /api/sites/{id}` - Get site configuration
- `PUT /api/sites/{id}` - Update site settings

### Sections
- `GET /api/sites/{siteId}/sections` - List sections
- `POST /api/sites/{siteId}/sections` - Create section
- `GET /api/sites/{siteId}/sections/{id}` - Get section
- `PUT /api/sites/{siteId}/sections/{id}` - Update section
- `DELETE /api/sites/{siteId}/sections/{id}` - Delete section
- `POST /api/sites/{siteId}/sections/reorder` - Reorder sections

### Entries
- `GET /api/sites/{siteId}/sections/{section}/entries` - List entries
- `POST /api/sites/{siteId}/sections/{section}/entries` - Create entry
- `GET /api/sites/{siteId}/entries/{id}` - Get entry
- `PUT /api/sites/{siteId}/entries/{id}` - Update entry
- `DELETE /api/sites/{siteId}/entries/{id}` - Delete entry
- `POST /api/sites/{siteId}/entries/reorder` - Reorder entries

### Media
- `POST /api/sites/{siteId}/media/upload` - Upload file
- `GET /api/sites/{siteId}/media` - List media files
- `DELETE /api/sites/{siteId}/media/{id}` - Delete file

### Themes
- `GET /api/themes` - List available themes
- `GET /api/themes/{id}` - Get theme metadata
- `POST /api/sites/{siteId}/theme/customize` - Update theme settings

### Export
- `POST /api/sites/{siteId}/export` - Generate static export

---

## Frontend Admin Architecture

### Tech Stack
- React 18 + TypeScript
- Vite for build tooling
- TanStack Query for data fetching
- Zustand for state management
- shadcn/ui + Tailwind for UI
- Tiptap for WYSIWYG editing
- React DnD for drag-and-drop

### Key Features

#### 1. Inline WYSIWYG Editor

```tsx
// admin/src/components/Editor/InlineEditor.tsx
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'

export function InlineEditor({ content, onChange }) {
  const editor = useEditor({
    extensions: [StarterKit, Image, Link],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    }
  })

  return (
    <div className="prose max-w-none">
      <EditorContent editor={editor} />
    </div>
  )
}
```

#### 2. Media Manager with Drag & Drop

```tsx
// admin/src/components/MediaManager/MediaManager.tsx
import { useDropzone } from 'react-dropzone'
import { useMutation, useQuery } from '@tanstack/react-query'

export function MediaManager({ siteId }) {
  const { data: media } = useQuery({
    queryKey: ['media', siteId],
    queryFn: () => api.getMedia(siteId)
  })

  const uploadMutation = useMutation({
    mutationFn: (files) => api.uploadMedia(siteId, files),
    onSuccess: () => queryClient.invalidateQueries(['media', siteId])
  })

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': [] },
    onDrop: (files) => uploadMutation.mutate(files)
  })

  return (
    <div className="space-y-4">
      <div {...getRootProps()} className="border-2 border-dashed p-8">
        <input {...getInputProps()} />
        <p>Drag & drop images here</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {media?.map(item => (
          <MediaItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}
```

#### 3. Section/Entry Manager

```tsx
// admin/src/components/SectionManager/SectionList.tsx
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

export function SectionList({ siteId }) {
  const { data: sections } = useQuery({
    queryKey: ['sections', siteId],
    queryFn: () => api.getSections(siteId)
  })

  const reorderMutation = useMutation({
    mutationFn: (order) => api.reorderSections(siteId, order)
  })

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (active.id !== over.id) {
      const newOrder = arrayMove(sections, active, over)
      reorderMutation.mutate(newOrder)
    }
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={sections} strategy={verticalListSortingStrategy}>
        {sections?.map(section => (
          <SectionItem key={section.id} section={section} />
        ))}
      </SortableContext>
    </DndContext>
  )
}
```

---

## Security Considerations

### Authentication
- JWT tokens for API authentication
- HttpOnly cookies for session management
- Password hashing with bcrypt (cost factor 10+)
- CSRF protection on state-changing operations

### File Upload Security
- Whitelist allowed MIME types
- Validate file extensions
- Store uploads outside web root
- Generate unique filenames
- Maximum file size limits

### Data Validation
- Input sanitization on all user data
- HTML purification for rich text content
- Path traversal prevention
- JSON schema validation

### File System Security
- Restricted permissions (755 for dirs, 644 for files)
- `.gitignore` for sensitive data
- Separate data directory from public web root
- Atomic file writes to prevent corruption

---

## Performance Optimization

### Caching Strategy
1. **File-level caching**: Cache parsed JSON in memory (APCu/Redis)
2. **Template caching**: Compile templates to PHP (optional)
3. **HTTP caching**: ETags and Last-Modified headers
4. **Static export**: Pre-generate HTML for production

### Image Optimization
- Automatic thumbnail generation
- WebP conversion for modern browsers
- Lazy loading for galleries
- Responsive image sizes

### Code Optimization
- Composer autoloader optimization
- Vite code splitting
- Tree shaking for unused code
- Minification for production

---

## Deployment Strategies

### Traditional Hosting (Shared/VPS)
1. Upload files via FTP/SFTP
2. Configure Apache with `.htaccess`
3. Set file permissions
4. Copy `.env.example` to `.env` and configure
5. Run `composer install --no-dev`
6. Build admin panel: `cd admin && npm run build`

### Docker Deployment
```yaml
# docker-compose.yml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "80:80"
    volumes:
      - ./data:/var/www/html/data
      - ./themes:/var/www/html/themes
    environment:
      - APP_ENV=production
```

### Static Export
For ultimate performance, export to static HTML:
```bash
php scripts/export-static.php --site=default --output=./dist
```

Then deploy to:
- Netlify
- Vercel
- GitHub Pages
- Any static host

---

## Multisite Implementation

### Configuration
```php
// config/sites.php
return [
    'default' => [
        'domain' => 'example.com',
        'dataPath' => 'data/sites/default'
    ],
    'blog' => [
        'domain' => 'blog.example.com',
        'dataPath' => 'data/sites/blog'
    ]
];
```

### Site Detection
```php
// Detect site by domain
$host = $_SERVER['HTTP_HOST'];
$siteConfig = Config::get("sites.{$host}") ?? Config::get('sites.default');
```

---

## Testing Strategy

### Unit Tests (PHPUnit)
- FileStorage operations
- Template rendering
- URL routing
- Data validation

### Integration Tests
- API endpoint responses
- File upload workflows
- Authentication flows

### E2E Tests (Playwright/Cypress)
- Admin panel interactions
- Content creation workflow
- Media upload
- Theme switching

---

## Git Workflow

### Content Versioning
All content in `/data` directory is git-tracked:
```bash
git add data/sites/default/entries/portfolio/new-project.json
git commit -m "Add new portfolio project"
git push
```

### Theme Development
```bash
git checkout -b feature/new-theme
# Develop theme in themes/new-theme/
git add themes/new-theme
git commit -m "Add new minimalist theme"
```

### Deployment
```bash
# Production deployment
git pull origin main
composer install --no-dev
cd admin && npm run build
```

---

## Extensibility

### Plugin System (Future)
Allow third-party extensions:
```php
// plugins/contact-form/ContactFormPlugin.php
class ContactFormPlugin implements PluginInterface {
    public function register(): void {
        Router::post('/contact', [$this, 'handleSubmit']);
    }
}
```

### Custom Field Types
Define custom content fields:
```json
{
  "fieldTypes": {
    "price": {
      "type": "number",
      "format": "currency",
      "currency": "EUR"
    }
  }
}
```

### Webhooks
Trigger external services on content changes:
```json
{
  "webhooks": [
    {
      "event": "entry.published",
      "url": "https://api.example.com/webhook",
      "method": "POST"
    }
  ]
}
```

---

## Comparison with Berta CMS

| Feature | Berta CMS | Ramingo CMS |
|---------|-----------|-------------|
| Storage | XML flat-files | JSON flat-files |
| Backend | PHP (older version) | PHP 8.3+ |
| Admin UI | Legacy JavaScript | React + shadcn/ui |
| Editor | In-house WYSIWYG | Tiptap (ProseMirror) |
| Styling | Custom CSS | Tailwind CSS |
| Build Tool | None | Vite |
| API | Coupled with frontend | REST API (decoupled) |
| Modern Features | Limited | TypeScript, React 18, Modern tooling |
| Developer Experience | Basic | Git-workflow, Docker, Static export |

---

## Next Steps

See `IMPLEMENTATION_ROADMAP.md` for detailed implementation phases and code examples.
