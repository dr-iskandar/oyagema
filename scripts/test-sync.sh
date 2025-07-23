#!/bin/bash
# Test script to verify upload sync functionality

echo "=== Upload Sync System Test ==="
echo "Testing sync functionality..."
echo

# Check if required scripts exist
echo "1. Checking sync scripts..."
if [ -f "scripts/sync-uploads.sh" ]; then
    echo "✓ Development sync script found"
else
    echo "✗ Development sync script missing"
fi

if [ -f "scripts/sync-uploads-production.sh" ]; then
    echo "✓ Production sync script found"
else
    echo "✗ Production sync script missing"
fi

if [ -f "scripts/upload-watcher.js" ]; then
    echo "✓ Upload watcher script found"
else
    echo "✗ Upload watcher script missing"
fi

echo

# Check if scripts are executable
echo "2. Checking script permissions..."
if [ -x "scripts/sync-uploads.sh" ]; then
    echo "✓ Development sync script is executable"
else
    echo "✗ Development sync script is not executable"
    echo "  Run: chmod +x scripts/sync-uploads.sh"
fi

if [ -x "scripts/sync-uploads-production.sh" ]; then
    echo "✓ Production sync script is executable"
else
    echo "✗ Production sync script is not executable"
    echo "  Run: chmod +x scripts/sync-uploads-production.sh"
fi

echo

# Check if uploads directory exists
echo "3. Checking directories..."
if [ -d "public/uploads" ]; then
    echo "✓ Uploads directory exists"
    echo "  Path: $(pwd)/public/uploads"
    echo "  Files: $(find public/uploads -type f | wc -l) files"
else
    echo "✗ Uploads directory missing"
    echo "  Creating directory..."
    mkdir -p public/uploads
    echo "✓ Created uploads directory"
fi

echo

# Check Node.js dependencies
echo "4. Checking dependencies..."
if npm list chokidar >/dev/null 2>&1; then
    echo "✓ chokidar dependency installed"
else
    echo "✗ chokidar dependency missing"
    echo "  Run: npm install chokidar"
fi

echo

# Test sync script execution (development)
echo "5. Testing sync script execution..."
echo "Running development sync script..."
if bash scripts/sync-uploads.sh 2>/dev/null; then
    echo "✓ Development sync script executed successfully"
else
    echo "⚠ Development sync script execution failed (this is normal if destination doesn't exist)"
fi

echo

# Check PM2 configuration
echo "6. Checking PM2 configuration..."
if grep -q "upload-watcher" ecosystem.config.js; then
    echo "✓ Upload watcher configured in PM2"
else
    echo "✗ Upload watcher not found in PM2 configuration"
fi

echo

# Environment variables check
echo "7. Environment configuration..."
echo "NODE_ENV: ${NODE_ENV:-'not set'}"
echo "ENABLE_UPLOAD_SYNC: ${ENABLE_UPLOAD_SYNC:-'not set'}"
echo "DISABLE_UPLOAD_SYNC: ${DISABLE_UPLOAD_SYNC:-'not set'}"

echo
echo "=== Test Complete ==="
echo
echo "Next steps:"
echo "1. Set environment variables as needed"
echo "2. Deploy with PM2: pm2 start ecosystem.config.js"
echo "3. Monitor logs: pm2 logs upload-watcher"
echo "4. Test by uploading a music file through the web interface"
echo