# Upload Sync System Setup

This document explains how to set up and configure the automatic upload synchronization system for the Oyagema music platform.

## Overview

The upload sync system automatically executes a synchronization script every time a new music file is uploaded. This ensures that uploaded files are properly synchronized between the main application directory and the standalone build directory in production.

## Components

### 1. Sync Scripts

#### Development Script (`scripts/sync-uploads.sh`)
- Basic sync script for development environment
- Syncs files from `public/uploads` to `.next/standalone/public/uploads`
- Simple logging and error handling

#### Production Script (`scripts/sync-uploads-production.sh`)
- Enhanced script for production environment
- Comprehensive logging to `/var/log/oyagema/sync-uploads.log`
- Better error handling and permission management
- Optional cleanup of old files with `--cleanup` flag

### 2. Upload API Integration

#### Modified Upload Route (`src/app/api/upload/route.ts`)
- Automatically executes sync script after successful audio file uploads
- Uses utility functions for better organization
- Environment-aware script selection

#### Sync Utility (`src/lib/utils/sync-uploads.ts`)
- Centralized sync logic
- Environment detection
- Error handling that doesn't break uploads
- Configurable via environment variables

### 3. File Watcher (`scripts/upload-watcher.js`)
- PM2 process that watches the uploads directory
- Automatically triggers sync when new audio files are detected
- Debounced execution to prevent multiple rapid syncs
- Backup mechanism in case API-triggered sync fails

## Configuration

### Environment Variables

```bash
# Enable/disable upload sync
ENABLE_UPLOAD_SYNC=true          # Enable in development
DISABLE_UPLOAD_SYNC=false        # Disable completely

# Production environment
NODE_ENV=production               # Automatically enables sync
```

### PM2 Configuration

The `ecosystem.config.js` includes a new process:

```javascript
{
  name: 'upload-watcher',
  script: './scripts/upload-watcher.js',
  // ... other configuration
}
```

## Installation & Setup

### 1. Install Dependencies

```bash
npm install chokidar
```

### 2. Make Scripts Executable

```bash
chmod +x scripts/sync-uploads.sh
chmod +x scripts/sync-uploads-production.sh
```

### 3. Create Log Directory (Production)

```bash
sudo mkdir -p /var/log/oyagema
sudo chown $USER:www-data /var/log/oyagema
sudo chmod 775 /var/log/oyagema
```

### 4. Update Paths in Production Scripts

Edit `scripts/sync-uploads-production.sh` and update paths:

```bash
SOURCE="/var/www/oyagema/public/uploads"
DEST="/var/www/oyagema/.next/standalone/public/uploads"
```

### 5. Deploy with PM2

```bash
# Start all processes including the upload watcher
pm2 start ecosystem.config.js

# Or start just the watcher
pm2 start ecosystem.config.js --only upload-watcher
```

## Usage

### Automatic Sync

1. **API Upload**: When a music file is uploaded via the API, sync runs automatically
2. **File Watcher**: The watcher process detects new files and triggers sync
3. **Manual Execution**: Run scripts manually when needed

### Manual Sync

```bash
# Development
bash scripts/sync-uploads.sh

# Production
bash scripts/sync-uploads-production.sh

# Production with cleanup
bash scripts/sync-uploads-production.sh --cleanup
```

## Monitoring

### PM2 Monitoring

```bash
# Check all processes
pm2 status

# Monitor upload watcher specifically
pm2 logs upload-watcher

# Restart if needed
pm2 restart upload-watcher
```

### Log Files

- **Development**: Console output
- **Production**: `/var/log/oyagema/sync-uploads.log`
- **PM2 Logs**: `./logs/upload-watcher-*.log`

## Troubleshooting

### Common Issues

1. **Permission Denied**
   ```bash
   sudo chown -R $USER:www-data /var/www/oyagema/public/uploads
   sudo chmod -R 775 /var/www/oyagema/public/uploads
   ```

2. **Script Not Found**
   - Verify script paths in configuration
   - Ensure scripts are executable

3. **Sync Not Triggering**
   - Check environment variables
   - Verify PM2 watcher process is running
   - Check API logs for sync execution

4. **Watcher Process Crashes**
   - Check PM2 logs: `pm2 logs upload-watcher`
   - Verify chokidar dependency is installed
   - Check file permissions on uploads directory

### Debug Mode

Enable detailed logging by setting:

```bash
export DEBUG=chokidar:*
pm2 restart upload-watcher
```

## Security Considerations

1. **Script Permissions**: Scripts should only be writable by authorized users
2. **Log Files**: Ensure log files don't expose sensitive information
3. **Directory Permissions**: Maintain proper ownership and permissions
4. **Process Isolation**: Upload watcher runs as separate PM2 process

## Performance Notes

- Sync operations are debounced to prevent excessive execution
- File watcher only monitors for audio file additions
- Sync failures don't affect upload success
- Memory usage is limited via PM2 configuration

## Maintenance

### Regular Tasks

1. **Log Rotation**: Set up logrotate for sync logs
2. **Cleanup**: Run periodic cleanup of old files
3. **Monitoring**: Check PM2 process health
4. **Updates**: Keep chokidar dependency updated

### Backup Strategy

The sync system provides redundancy:
- Primary: API-triggered sync
- Secondary: File watcher sync
- Manual: Direct script execution

This ensures uploads are synchronized even if one mechanism fails.