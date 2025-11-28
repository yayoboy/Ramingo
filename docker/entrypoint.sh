#!/bin/sh
set -e

echo "🚀 Starting Ramingo CMS..."

# Create log directories
mkdir -p /var/log/php /var/log/nginx /var/log/supervisor

# Set permissions
chown -R www-data:www-data /var/www/html/storage
chown -R www-data:www-data /var/www/html/data
chown -R www-data:www-data /var/www/html/public/uploads
chmod -R 775 /var/www/html/storage
chmod -R 775 /var/www/html/data
chmod -R 775 /var/www/html/public/uploads

# Initialize default data if not exists
if [ ! -f "/var/www/html/data/users.json" ]; then
    echo "📝 Initializing default user data..."
    cp -n /var/www/html/data.dist/* /var/www/html/data/ 2>/dev/null || true
fi

# Create default admin user if users.json doesn't exist
if [ ! -f "/var/www/html/data/users.json" ]; then
    echo "👤 Creating default admin user..."
    cat > /var/www/html/data/users.json << 'EOF'
{
  "users": [
    {
      "id": "usr-admin-default",
      "username": "admin",
      "password": "$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
      "email": "admin@ramingo.local",
      "role": "admin",
      "sites": ["default"],
      "preferences": {
        "theme": "light",
        "language": "en"
      },
      "createdAt": "2025-01-01T00:00:00+00:00",
      "lastLogin": null
    }
  ]
}
EOF
    chown www-data:www-data /var/www/html/data/users.json
    echo "✅ Default admin user created (username: admin, password: admin123)"
fi

echo "✅ Ramingo CMS initialized successfully!"
echo "🌐 Application will be available at http://localhost:8080"
echo "🔐 Admin Panel: http://localhost:3000/admin"

# Execute the main command
exec "$@"
