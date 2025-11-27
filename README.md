# Ramingo CMS

> A modern, flat-file content management system inspired by Berta CMS, built with PHP 8.2+ and React 18.

[![PHP Version](https://img.shields.io/badge/php-%3E%3D8.2-blue)](https://www.php.net/)
[![React Version](https://img.shields.io/badge/react-18-blue)](https://react.dev/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## 🚀 Features

### Content Management
- **Flat-file storage** - No database required, all data stored in JSON files
- **Multi-section support** - Organize content into pages, galleries, blogs
- **Rich text editor** - Tiptap WYSIWYG editor with full formatting support
- **Media management** - Upload and organize images with built-in library
- **Google Fonts integration** - Choose from 15 popular fonts with live preview
- **Custom typography** - Apply different fonts per entry
- **Tag system** - Categorize and organize content
- **SEO optimization** - Meta tags, OG images, sitemaps, RSS feeds

### Admin Panel
- **React 18** - Modern, responsive admin interface
- **Real-time preview** - See changes before publishing
- **Drag & drop** - Reorder sections and entries
- **Image galleries** - Multiple images per entry
- **Published/Featured** - Control content visibility
- **User authentication** - JWT-based secure login

### Frontend
- **Template system** - PHP-based template engine
- **Responsive themes** - Mobile-first design
- **Multiple layouts** - Page, gallery, blog templates
- **Dynamic navigation** - Auto-generated from sections
- **SEO-friendly URLs** - Clean, readable paths
- **RSS feeds** - Per-section RSS support
- **Sitemap generation** - Automatic XML sitemap

### Technical Features
- **PHP 8.2+** - Modern PHP with type safety
- **PSR-4 autoloading** - Organized, namespaced code
- **RESTful API** - JSON API for all operations
- **JWT authentication** - Secure, stateless auth
- **Middleware system** - Flexible request processing
- **No database** - Simple file-based storage

## 📋 Requirements

- PHP 8.2 or higher
- Node.js 18+ and npm
- Composer
- Web server (Apache/Nginx) or PHP built-in server

## 🔧 Installation

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/ramingo.git
cd ramingo
```

### 2. Install PHP dependencies
```bash
composer install
```

### 3. Install and build admin panel
```bash
cd admin
npm install
npm run build
cd ..
```

### 4. Initialize site and user
```bash
php scripts/init-site.php
php scripts/init-user.php
```

This creates:
- Default site with sample sections and entries
- Admin user (username: `admin`, password: `admin123`)

### 5. Start the development server
```bash
php -S localhost:8000 -t public router.php
```

## 🎯 Quick Start

### Access the site
- **Public site**: http://localhost:8000
- **Admin panel**: http://localhost:8000/admin
- **API**: http://localhost:8000/api

### Default credentials
- Username: `admin`
- Password: `admin123`

**⚠️ Change these credentials immediately in production!**

## 📁 Project Structure

```
ramingo/
├── admin/                 # React admin panel
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── contexts/     # React contexts
│   │   ├── lib/          # API client
│   │   └── pages/        # Admin pages
│   └── dist/             # Built admin assets
├── api/                  # API controllers and models
│   ├── Controllers/      # API endpoints
│   ├── Models/           # Data models
│   ├── Middleware/       # Auth middleware
│   └── Services/         # FileStorage service
├── public/               # Public web root
│   ├── themes/          # Frontend themes
│   │   └── default/     # Default theme
│   ├── index.php        # Frontend router
│   └── api.php          # API router
├── src/                  # Core framework
│   ├── Core/            # Application core
│   ├── Template/        # Template engine
│   └── Utils/           # Utilities
├── storage/             # Data storage
│   ├── sites/           # Site data
│   └── users/           # User data
└── scripts/             # Utility scripts
```

## 🎨 Creating Content

### 1. Log in to the admin panel
Navigate to `/admin` and log in with your credentials.

### 2. Create a new section
1. Go to "Sites" → Select your site
2. Click "Sections"
3. Choose section type (Page, Gallery, or Blog)
4. Configure settings

### 3. Add entries
1. Navigate to the section
2. Click "Create Entry"
3. Add title, content, images
4. Choose custom font (optional)
5. Add tags and SEO metadata
6. Publish when ready

### 4. Customize appearance
1. Go to "Settings" → "Theme"
2. Choose Google Fonts for headings and body
3. Set color scheme
4. Save changes

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/login      # Login
POST   /api/auth/logout     # Logout
POST   /api/auth/register   # Register (if enabled)
GET    /api/auth/me         # Get current user
```

### Sites
```
GET    /api/sites           # List all sites
GET    /api/sites/{id}      # Get site
PUT    /api/sites/{id}      # Update site
```

### Sections
```
GET    /api/sites/{siteId}/sections                # List sections
GET    /api/sites/{siteId}/sections/{id}           # Get section
POST   /api/sites/{siteId}/sections                # Create section
PUT    /api/sites/{siteId}/sections/{id}           # Update section
DELETE /api/sites/{siteId}/sections/{id}           # Delete section
```

### Entries
```
GET    /api/sites/{siteId}/sections/{sectionId}/entries     # List entries
POST   /api/sites/{siteId}/sections/{sectionId}/entries     # Create entry
PUT    /api/sites/{siteId}/entries/{id}                     # Update entry
DELETE /api/sites/{siteId}/entries/{id}                     # Delete entry
```

### Media
```
GET    /api/sites/{siteId}/media           # List media
POST   /api/sites/{siteId}/media           # Upload files
DELETE /api/sites/{siteId}/media/{fileId}  # Delete file
```

### Settings
```
GET    /api/sites/{siteId}/settings              # Get settings
PUT    /api/sites/{siteId}/settings              # Update settings
GET    /api/sites/{siteId}/settings/theme        # Get theme
PUT    /api/sites/{siteId}/settings/theme        # Update theme
```

## 🌐 Frontend Routes

```
/                           # Homepage
/{section}                  # Section listing
/{section}/{entry}          # Entry detail
/sitemap.xml                # XML sitemap
/robots.txt                 # Robots.txt
/{section}/feed.xml         # RSS feed for section
```

## 🎨 Theming

### Creating a custom theme

1. Copy the default theme:
```bash
cp -r public/themes/default public/themes/mytheme
```

2. Customize templates:
```
themes/mytheme/
├── layouts/
│   └── main.php          # Main HTML wrapper
├── templates/
│   ├── page.php          # Page template
│   ├── gallery.php       # Gallery template
│   ├── blog.php          # Blog template
│   └── entry.php         # Entry detail
├── partials/
│   ├── header.php        # Site header
│   └── footer.php        # Site footer
└── assets/
    ├── css/style.css     # Theme styles
    └── js/main.js        # Theme scripts
```

3. Update site theme in database:
```json
{
  "theme": "mytheme"
}
```

## 🔒 Security

### Production Checklist

- [ ] Change default admin password
- [ ] Set `DEBUG` to `false` in config
- [ ] Configure proper file permissions
- [ ] Use HTTPS
- [ ] Configure CORS properly
- [ ] Review JWT secret key
- [ ] Enable PHP opcache
- [ ] Disable directory listing
- [ ] Keep dependencies updated

### File Permissions

```bash
chmod 755 public
chmod 755 storage
chmod 644 storage/**/*.json
```

## 🚀 Deployment

### Production Environment

1. **Build admin panel for production**
```bash
cd admin && npm run build
```

2. **Configure web server**

**Apache (.htaccess)**
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [QSA,L]
```

**Nginx**
```nginx
location / {
    try_files $uri $uri/ /index.php?$query_string;
}

location /api {
    try_files $uri $uri/ /api.php?$query_string;
}
```

3. **Set environment to production**
```php
// config/app.php
return [
    'env' => 'production',
    'debug' => false,
    // ...
];
```

## 📊 Performance

### Optimization Tips

1. **Enable PHP OPcache**
2. **Use HTTP/2**
3. **Enable gzip compression**
4. **Optimize images before upload**
5. **Use CDN for static assets**
6. **Implement browser caching**

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Credits

Inspired by [Berta CMS](https://www.berta.me/), built with modern technologies.

## 📞 Support

For issues and questions:
- GitHub Issues: [github.com/yourusername/ramingo/issues](https://github.com/yourusername/ramingo/issues)
- Documentation: [docs.ramingo.dev](https://docs.ramingo.dev)

---

**Built with ❤️ using PHP, React, and modern web technologies.**
