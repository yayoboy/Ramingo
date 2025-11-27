# Ramingo CMS

A modern, flat-file CMS inspired by Berta CMS, built with PHP 8.3+ and React.

## Overview

Ramingo CMS is a database-free content management system that stores all content in JSON files. It features a modern React-based admin panel with inline WYSIWYG editing, drag-and-drop media management, and a powerful theming system.

### Key Features

- **Flat-File Storage**: No database required - all content stored in JSON files
- **WYSIWYG Inline Editing**: Edit content directly on the published site
- **Modern Admin Panel**: React + shadcn/ui + Tailwind CSS
- **Responsive Themes**: Mobile-first, customizable templates
- **Media Management**: Drag-and-drop image uploads with automatic processing
- **Multisite Support**: Manage multiple sites from one installation
- **SEO Optimized**: Built-in SEO tools and sitemap generation
- **Git-Friendly**: Version control your content alongside your code
- **Static Export**: Generate static HTML for deployment anywhere
- **Google Fonts Integration**: 500+ fonts available
- **Shop Integration**: PayPal and e-commerce support (planned)

## Technology Stack

### Backend
- PHP 8.3+
- JSON flat-file storage
- Composer for dependency management
- Apache with mod_rewrite

### Frontend Admin
- React 18 with TypeScript
- Vite for build tooling
- shadcn/ui component library
- Tailwind CSS for styling
- Tiptap for WYSIWYG editing
- TanStack Query for data fetching
- Zustand for state management

### Frontend Public Site
- PHP templating engine
- Responsive HTML/CSS
- Minimal JavaScript
- SEO-friendly output

## Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Complete system architecture, tech stack decisions, data structures, and API design
- **[IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md)** - Detailed phase-by-phase implementation guide with code examples

## Project Status

🚧 **Status**: Research & Planning Phase

This repository currently contains comprehensive research documentation and architectural planning for the Ramingo CMS project. Implementation is ready to begin based on the detailed roadmap provided.

### Completed
- ✅ Requirements analysis
- ✅ Technology stack selection
- ✅ System architecture design
- ✅ Data structure definitions
- ✅ API endpoint design
- ✅ Implementation roadmap with code examples

### Next Steps
1. Initialize project structure (Phase 1: Week 1-2)
2. Implement data layer and file storage (Phase 2: Week 3-4)
3. Build authentication system (Phase 3: Week 5)
4. Develop admin panel UI (Phase 4: Week 6-8)
5. Create template engine and themes (Phase 5: Week 9-10)
6. Add advanced features (Phase 6: Week 11-13)
7. Testing, documentation, and deployment (Phase 7: Week 14-17)

## Quick Start (After Implementation)

### Requirements
- PHP 8.3 or higher
- Apache with mod_rewrite enabled
- GD library for image processing
- Composer
- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ramingo.git
cd ramingo

# Install PHP dependencies
composer install

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Initialize default site
php scripts/init-site.php

# Install and build admin panel
cd admin
npm install
npm run build

# Start development server
cd ..
php -S localhost:8000 -t public
```

Access the admin panel at `http://localhost:8000/admin`

### Development Mode

```bash
# Terminal 1: PHP backend
php -S localhost:8000 -t public

# Terminal 2: React admin dev server
cd admin
npm run dev
```

Admin panel: `http://localhost:5173`
Public site: `http://localhost:8000`
API: `http://localhost:8000/api`

## Project Structure

```
ramingo/
├── admin/              # React admin panel
├── api/                # PHP API controllers and services
├── config/             # Configuration files
├── data/               # Flat-file storage (git-tracked)
├── public/             # Web root
├── scripts/            # Utility scripts
├── src/                # Core PHP classes
├── tests/              # Test suite
└── themes/             # Site themes
```

## Architecture Highlights

### Flat-File Storage
All content is stored in JSON files under the `data/` directory:
- `data/sites/{site-id}/config.json` - Site configuration
- `data/sites/{site-id}/sections/*.json` - Section definitions
- `data/sites/{site-id}/entries/{section}/*.json` - Content entries
- `data/sites/{site-id}/media/` - Uploaded media files
- `data/users.json` - User accounts

### API-First Design
RESTful API endpoints for all operations:
- `/api/sites` - Site management
- `/api/sites/{id}/sections` - Section management
- `/api/sites/{id}/entries` - Entry/content management
- `/api/media/upload` - Media handling
- `/api/auth/*` - Authentication

### Component Architecture
- **Router**: URL routing for public site and API
- **FileStorage**: JSON file read/write operations
- **Template Engine**: PHP template rendering
- **Media Service**: Image processing and optimization
- **Auth System**: JWT-based authentication

## Features in Detail

### WYSIWYG Editing
Inline content editing using Tiptap (ProseMirror):
- Rich text formatting
- Image embedding
- Link management
- Custom blocks
- Live preview

### Media Management
Drag-and-drop media handling:
- Multi-file uploads
- Automatic thumbnail generation
- Image optimization
- WebP conversion
- Gallery organization

### Theme System
Customizable, swappable themes:
- PHP template files
- JSON theme configuration
- Google Fonts integration
- Custom color schemes
- Responsive layouts

### Multisite Management
Run multiple sites from one installation:
- Separate content directories
- Domain-based routing
- Shared admin panel
- Per-site themes and settings

### SEO Tools
Built-in search engine optimization:
- Meta tags management
- Sitemap generation
- Robots.txt configuration
- Social media cards
- Structured data

### Static Export
Generate static HTML:
```bash
php scripts/export-static.php --site=default --output=./dist
```
Deploy to Netlify, Vercel, or any static host.

## Development Principles

### Simplicity First
- Minimal dependencies
- Straightforward code structure
- No over-engineering
- Easy to understand and modify

### Performance Oriented
- Flat-file performance advantages
- Caching strategies
- Optimized images
- Minimal JavaScript

### Developer Experience
- Git-friendly content versioning
- Docker support
- Clear documentation
- Type-safe TypeScript
- Modern tooling

## Deployment

### Traditional Hosting
1. Upload files via FTP/SFTP
2. Configure Apache (`.htaccess` included)
3. Set file permissions (755 for dirs, 644 for files)
4. Copy and configure `.env`
5. Run `composer install --no-dev`
6. Build admin: `cd admin && npm run build`

### Docker
```bash
docker-compose up -d
```

### Static Export
```bash
php scripts/export-static.php --site=default --output=./dist
# Deploy dist/ to any static host
```

## Security

- JWT authentication for API
- Password hashing with bcrypt
- CSRF protection
- Input sanitization
- File upload validation
- Restricted file permissions
- `.gitignore` for sensitive data

## Testing

```bash
# Run PHP tests
./vendor/bin/phpunit

# Run admin panel tests
cd admin
npm test
```

## Contributing

Contributions are welcome! Please read the architecture and implementation roadmap documents before contributing.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

[MIT License](LICENSE)

## Credits

Inspired by [Berta CMS](https://www.berta.me/) - A simple, elegant CMS for creatives.

## Support

- Documentation: See `ARCHITECTURE.md` and `IMPLEMENTATION_ROADMAP.md`
- Issues: [GitHub Issues](https://github.com/yourusername/ramingo/issues)
- Discussions: [GitHub Discussions](https://github.com/yourusername/ramingo/discussions)

## Roadmap

### Phase 1-3 (Weeks 1-5)
- ✅ Planning and architecture
- 🔄 Core backend implementation
- 🔄 Data layer and file storage
- 🔄 Authentication system

### Phase 4-5 (Weeks 6-10)
- ⏳ Admin panel UI
- ⏳ WYSIWYG editor integration
- ⏳ Media management
- ⏳ Template engine and themes

### Phase 6-7 (Weeks 11-17)
- ⏳ Multisite support
- ⏳ SEO tools
- ⏳ Static export
- ⏳ Shop integration
- ⏳ Testing and documentation

### Future
- Plugin system
- Advanced caching
- Collaborative editing
- Version history
- Content scheduling
- Advanced analytics

---

Built with ❤️ for creators, designers, and developers who value simplicity.
