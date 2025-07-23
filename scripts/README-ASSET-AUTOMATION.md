# Asset Automation Documentation

## Overview

This document explains the automated process for copying static assets and uploaded files to the standalone output directory in the Oyagema application. This automation ensures that all necessary files are properly copied to the `.next/standalone` directory when new content is uploaded through the API.

## Implementation Details

### Enhanced `post-asset.sh` Script

The `post-asset.sh` script has been enhanced to copy all necessary files to the standalone output directory:

1. **Uploaded Files**: Copies files from `public/uploads` to `.next/standalone/public/uploads`
2. **Public Assets**: Copies all files from `public` to `.next/standalone/public`
3. **Static Assets**: Copies files from `.next/static` to `.next/standalone/.next/static`

The script creates all necessary directories if they don't exist and handles errors gracefully.

### New NPM Scripts

The following scripts have been added to `package.json`:

- `update-static`: Creates the static directory in standalone and copies static files
- `update-all`: Runs all update scripts (public, uploads, static) in sequence
- `post-asset:all`: Runs the enhanced post-asset.sh script that copies all necessary files

### API Integration

The upload API (`src/app/api/upload/route.ts`) has been updated to use the enhanced script:

- In standalone mode: Files are saved directly to `.next/standalone/public/uploads`
- In non-standalone mode: Files are saved to `public/uploads` and then the `post-asset:all` script is executed to copy all necessary files to the standalone directory

## Usage

### Automatic Usage

The automation works automatically when files are uploaded through the `/api/upload` endpoint. No additional steps are required.

### Manual Usage

To manually copy all assets to the standalone directory, run:

```bash
npm run post-asset:all
```

Or use the individual scripts for specific assets:

```bash
npm run update-public    # Copy public folder
npm run update-uploads   # Copy uploads folder
npm run update-static    # Copy static folder
npm run update-all       # Copy all folders
```

## Benefits

1. **Consistency**: Ensures all necessary files are copied to the standalone directory
2. **Automation**: No manual steps required after file uploads
3. **Reliability**: Creates directories if they don't exist, preventing errors
4. **Flexibility**: Provides both automatic and manual options for copying files

## Notes

- The automation only runs in non-standalone mode, as files are saved directly to the correct location in standalone mode
- For high-volume production environments, consider using external storage solutions instead of local file storage