#!/bin/bash

# Deployment script for Oyagema with Nginx
# Usage: ./deploy-nginx.sh

set -e

echo "🚀 Starting Oyagema deployment with Nginx..."

# Check if required files exist
if [ ! -f ".env.production" ]; then
    echo "❌ Error: .env.production file not found!"
    echo "Please create .env.production file with required environment variables."
    exit 1
fi

if [ ! -f "nginx.conf" ]; then
    echo "❌ Error: nginx.conf file not found!"
    exit 1
fi

# Create SSL directory if it doesn't exist
echo "📁 Creating SSL directory..."
mkdir -p ssl

# Create uploads directory if it doesn't exist
echo "📁 Creating uploads directory..."
mkdir -p public/uploads
chmod 755 public/uploads

# Copy environment file
echo "📋 Setting up environment..."
cp .env.production .env

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.nginx.yml down --remove-orphans || true

# Remove old images (optional)
echo "🧹 Cleaning up old images..."
docker image prune -f || true

# Build and start containers
echo "🔨 Building and starting containers..."
docker-compose -f docker-compose.nginx.yml up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Run database migrations
echo "🗄️ Running database migrations..."
docker-compose -f docker-compose.nginx.yml exec -T nextjs npx prisma migrate deploy || echo "⚠️ Migration failed or already up to date"

# Generate Prisma client
echo "🔧 Generating Prisma client..."
docker-compose -f docker-compose.nginx.yml exec -T nextjs npx prisma generate || echo "⚠️ Prisma generate failed"

# Seed database (optional)
echo "🌱 Seeding database..."
docker-compose -f docker-compose.nginx.yml exec -T nextjs npm run db:seed || echo "⚠️ Database seeding failed or already seeded"

# Show container status
echo "📊 Container status:"
docker-compose -f docker-compose.nginx.yml ps

# Show logs
echo "📝 Recent logs:"
docker-compose -f docker-compose.nginx.yml logs --tail=20

echo ""
echo "✅ Deployment completed!"
echo ""
echo "🌐 Application URLs:"
echo "   - Main App: https://oyagema.com"
echo "   - Donation API: https://oyagema.com/api/donation"
echo "   - Health Check: https://oyagema.com/health"
echo ""
echo "📋 Admin Access:"
echo "   - Email: oyagema@gmail.com"
echo "   - Password: @VoiceofHeav3n"
echo ""
echo "🔧 Useful commands:"
echo "   - View logs: docker-compose -f docker-compose.nginx.yml logs -f"
echo "   - Stop services: docker-compose -f docker-compose.nginx.yml down"
echo "   - Restart services: docker-compose -f docker-compose.nginx.yml restart"
echo ""
echo "⚠️ Important Notes:"
echo "   - Make sure to configure SSL certificates in the ssl/ directory"
echo "   - Update DNS records to point oyagema.com to this server"
echo "   - Configure firewall to allow ports 80 and 443"
echo "   - Monitor logs for any issues"
echo ""