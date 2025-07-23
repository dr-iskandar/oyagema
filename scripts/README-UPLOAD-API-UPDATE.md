# Upload API Update - Automatic Asset Management

This document explains the changes made to the upload API to automatically handle static asset management in standalone Next.js applications running with PM2.

## Problem

When running a Next.js application in standalone mode with PM2, uploaded files saved to `public/uploads/` are not accessible because the standalone build creates its own isolated `public` directory at `.next/standalone/public/`. This causes uploaded assets to be inaccessible to users.

## Solution

The `/api/upload` endpoint has been modified to automatically detect the runtime environment and handle file uploads appropriately:

1. **Standalone Mode (Production)**: Files are saved directly to `.next/standalone/public/uploads/`
2. **Development/Regular Mode**: Files are saved to `public/uploads/` and the `post-asset:sh` script is executed to sync them

## Implementation Details

### Changes Made

1. **Environment Detection**: Added logic to detect if running in standalone mode
2. **Dynamic Path Resolution**: Uses appropriate upload directory based on environment
3. **Conditional Script Execution**: Only runs post-asset script when not in standalone mode
4. **Directory Creation**: Ensures upload directory exists before saving files

### Code Changes

```typescript
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { exec } from 'child_process';

// Environment detection
const isStandalone = process.env.NODE_ENV === 'production' && 
                    existsSync(join(process.cwd(), '.next', 'standalone'));

// Dynamic path resolution
let publicDir, uploadsDir;

if (isStandalone) {
  // In standalone mode, save to .next/standalone/public/uploads
  publicDir = join(process.cwd(), '.next', 'standalone', 'public');
  uploadsDir = join(publicDir, 'uploads');
} else {
  // In development or regular production, save to public/uploads
  publicDir = join(process.cwd(), 'public');
  uploadsDir = join(publicDir, 'uploads');
}

// Ensure directory exists and save file
await mkdir(uploadsDir, { recursive: true });
await writeFile(filePath, buffer);

// Run enhanced post-asset script only in non-standalone mode
if (!isStandalone) {
  exec('npm run post-asset:all', (error, stdout, stderr) => {
    // ... error handling ...
  });
}
```

## Benefits

1. **Environment-Aware**: Automatically adapts to different deployment scenarios
2. **Direct File Access**: In standalone mode, files are immediately accessible without additional copying
3. **Backward Compatibility**: Maintains existing behavior for development and regular production
4. **Robust Error Handling**: Upload functionality is preserved even if sync operations fail
5. **Performance Optimization**: Eliminates unnecessary file copying in standalone mode
6. **Complete Asset Management**: Automatically copies all necessary files (uploads, public, and static) to the standalone directory

## Environment Behavior

### Development Mode
- Files saved to: `public/uploads/`
- Enhanced post-asset script: **Executed** (for testing PM2 compatibility)
- Files copied: Uploads, Public, and Static assets
- File accessibility: Immediate via Next.js static file serving

### Standalone Production Mode
- Files saved to: `.next/standalone/public/uploads/`
- Enhanced post-asset script: **Not executed** (unnecessary)
- File accessibility: Immediate via standalone server

### Regular Production Mode
- Files saved to: `public/uploads/`
- Enhanced post-asset script: **Executed** (for PM2 compatibility)
- Files copied: Uploads, Public, and Static assets
- File accessibility: After script execution

## Notes

- Environment detection is based on `NODE_ENV=production` and existence of `.next/standalone` directory
- Directory creation is handled automatically with `mkdir({ recursive: true })`
- This solution eliminates the ENOENT errors seen in standalone deployments
- For high-volume production environments, consider using external storage services (AWS S3, Cloudinary, etc.)
- For more detailed information about the asset automation process, see [README-ASSET-AUTOMATION.md](./README-ASSET-AUTOMATION.md)