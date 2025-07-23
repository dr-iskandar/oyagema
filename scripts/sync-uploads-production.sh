#!/bin/bash
# Production sync script for oyagema uploads
# This script syncs uploads from public/uploads to standalone build directory

# Configuration
SOURCE="/var/www/oyagema/public/uploads"
DEST="/var/www/oyagema/.next/standalone/public/uploads"
LOG_FILE="/var/log/oyagema/sync-uploads.log"

# Create log directory if it doesn't exist
sudo mkdir -p "$(dirname "$LOG_FILE")"

# Function to log messages
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | sudo tee -a "$LOG_FILE"
}

# Check if source directory exists
if [ ! -d "$SOURCE" ]; then
    log_message "ERROR: Source directory $SOURCE does not exist"
    exit 1
fi

# Create destination directory if it doesn't exist
if [ ! -d "$DEST" ]; then
    log_message "INFO: Creating destination directory $DEST"
    sudo mkdir -p "$DEST"
fi

# Perform the sync
log_message "INFO: Starting sync from $SOURCE to $DEST"

if rsync -av "$SOURCE/" "$DEST/" 2>&1 | sudo tee -a "$LOG_FILE"; then
    # Set proper permissions
    sudo chown -R $USER:www-data "$DEST" 2>&1 | sudo tee -a "$LOG_FILE"
    sudo chmod -R 775 "$DEST" 2>&1 | sudo tee -a "$LOG_FILE"
    
    log_message "SUCCESS: Sync completed successfully"
    
    # Count files synced
    FILE_COUNT=$(find "$DEST" -type f | wc -l)
    log_message "INFO: Total files in destination: $FILE_COUNT"
else
    log_message "ERROR: Sync failed"
    exit 1
fi

# Optional: Clean up old files (older than 30 days)
if [ "$1" = "--cleanup" ]; then
    log_message "INFO: Cleaning up files older than 30 days"
    find "$DEST" -type f -mtime +30 -delete 2>&1 | sudo tee -a "$LOG_FILE"
    log_message "INFO: Cleanup completed"
fi

log_message "INFO: Sync operation completed"