#!/bin/bash

# PM2 Deployment Script for Oyagema
# This script sets up and deploys the application using PM2

set -e  # Exit on any error

echo "🚀 Starting PM2 deployment for Oyagema..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    print_error "PM2 is not installed. Installing PM2 globally..."
    npm install -g pm2
fi

# Check if Node.js version is compatible
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18 or higher is required. Current version: $(node --version)"
    exit 1
fi

print_status "Node.js version check passed: $(node --version)"

# Install dependencies for main application
print_status "Installing dependencies for main application..."
npm ci

# Generate Prisma client
print_status "Generating Prisma client..."
npm run prisma:generate

# Build the Next.js application
print_status "Building Next.js application..."
npm run build

# Install dependencies for donation service
print_status "Installing dependencies for donation service..."
cd donation-service
npm ci
cd ..

# Check if PostgreSQL is running (optional)
if command -v pg_isready &> /dev/null; then
    if pg_isready -h 88.222.212.111 -p 5433 -U postgres; then
        print_status "Database connection successful"
    else
        print_warning "Cannot connect to database. Please ensure PostgreSQL is running."
    fi
else
    print_warning "pg_isready not found. Skipping database connection check."
fi

# Run database migrations
print_status "Running database migrations..."
npx prisma migrate deploy

# Stop existing PM2 processes if they exist
print_status "Stopping existing PM2 processes..."
pm2 stop ecosystem.config.js || true
pm2 delete ecosystem.config.js || true

# Start applications with PM2
print_status "Starting applications with PM2..."
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
print_status "Saving PM2 configuration..."
pm2 save

# Setup PM2 startup script
print_status "Setting up PM2 startup script..."
pm2 startup || print_warning "PM2 startup setup failed. You may need to run this manually with sudo."

# Show PM2 status
print_status "PM2 Status:"
pm2 status

# Show logs
print_status "Recent logs:"
pm2 logs --lines 10

print_status "✅ Deployment completed successfully!"
print_status "🌐 Main application should be running on port 8996"
print_status "💰 Donation service should be running on port 5000"
print_status ""
print_status "Useful PM2 commands:"
print_status "  pm2 status                    - Show process status"
print_status "  pm2 logs                      - Show logs"
print_status "  pm2 restart oyagema-nextjs   - Restart main app"
print_status "  pm2 restart all              - Restart all processes"
print_status "  pm2 stop all                 - Stop all processes"
print_status "  pm2 monit                    - Monitor processes"