#!/bin/bash

# Production Deployment Script for Niagahoster Server
# Server IP: 88.222.212.111

echo "🚀 Starting production deployment..."

# Check if production environment file exists
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production file not found!"
    echo "Please create .env.production file with production settings."
    exit 1
fi

# Copy production environment to .env
echo "📋 Copying production environment..."
cp .env.production .env

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.production.yml down

# Remove old images (optional - uncomment if needed)
# echo "🗑️  Removing old images..."
# docker-compose -f docker-compose.production.yml down --rmi all

# Build and start containers
echo "🔨 Building and starting containers..."
docker-compose -f docker-compose.production.yml up -d --build

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Run database migrations
echo "🗄️  Running database migrations..."
docker-compose -f docker-compose.production.yml exec nextjs npx prisma migrate deploy

# Seed database (optional - uncomment if needed)
# echo "🌱 Seeding database..."
# docker-compose -f docker-compose.production.yml exec nextjs npx prisma db seed

# Show container status
echo "📊 Container status:"
docker-compose -f docker-compose.production.yml ps

echo "✅ Production deployment completed!"
echo "🌐 Application should be available at: http://88.222.212.111:8996"
echo "🔧 Donation service available at: http://88.222.212.111:5001"

# Show logs (optional)
echo "📝 Recent logs:"
docker-compose -f docker-compose.production.yml logs --tail=20