#!/bin/bash
# /var/www/oyagema/sync-uploads.sh
# Script to sync uploads from public/uploads to standalone build directory

SOURCE="/var/www/oyagema/public/uploads"
DEST="/var/www/oyagema/.next/standalone/public/uploads"

if [ -d "$SOURCE" ]; then
    rsync -av "$SOURCE/" "$DEST/"
    chown -R $USER:www-data "$DEST"
    chmod -R 775 "$DEST"
    echo "[$(date)] Sync completed: $SOURCE -> $DEST"
else
    echo "[$(date)] Error: Source directory $SOURCE does not exist"
    exit 1
fi