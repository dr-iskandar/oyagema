#!/bin/bash

# PM2 Deployment Script for Oyagema

echo "🚀 Starting Oyagema deployment with PM2..."

# Create logs directory if it doesn't exist
mkdir -p logs

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Generate Prisma client
echo "🔄 Generating Prisma client..."
npx prisma generate

# Build the application
echo "🏗️ Building the application..."
npm run build

# Apply database migrations
echo "🗃️ Applying database migrations..."
npx prisma migrate deploy

# Start or reload the application with PM2
if pm2 list | grep -q "oyagema"; then
  echo "♻️ Reloading existing PM2 process..."
  pm2 reload oyagema
else
  echo "🚀 Starting new PM2 process..."
  pm2 start ecosystem.config.js
  
  # Save PM2 configuration
  echo "💾 Saving PM2 configuration..."
  pm2 save
  
  # Setup PM2 to start on system boot (if not already done)
  if [ ! -f "$HOME/.pm2/dump.pm2" ]; then
    echo "🔄 Setting up PM2 startup..."
    pm2 startup
  fi
fi

# Wait for app to be ready
sleep 5

# Health check
echo "🩺 Performing health check..."
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Deployment successful!"
else
    echo "❌ Health check failed!"
    echo "Check logs with: pm2 logs oyagema"
    exit 1
fi

echo "✨ Deployment completed successfully!"
echo "📊 Monitor your application with: pm2 monit"
echo "📜 View logs with: pm2 logs oyagema"