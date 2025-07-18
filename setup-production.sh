#!/bin/bash

# Quick Setup Script for Production Environment
# This script prepares the environment for production deployment

echo "🔧 Setting up production environment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create uploads directory if it doesn't exist
echo "📁 Creating uploads directory..."
mkdir -p public/uploads

# Make deployment script executable
echo "🔐 Making deployment script executable..."
chmod +x deploy-production.sh

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production file not found!"
    echo "The production environment file should already exist with Niagahoster server settings."
    exit 1
fi

echo "✅ Production environment setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Ensure PostgreSQL is running on 88.222.212.111:5433"
echo "2. Verify database 'oyagema' exists and is accessible"
echo "3. Run deployment: ./deploy-production.sh"
echo ""
echo "🌐 After deployment, your app will be available at:"
echo "   - Main App: http://88.222.212.111:8996"
echo "   - Donation Service: http://88.222.212.111:5001"
echo ""
echo "👤 Admin Login:"
echo "   - Email: oyagema@gmail.com"
echo "   - Password: @VoiceofHeav3n"