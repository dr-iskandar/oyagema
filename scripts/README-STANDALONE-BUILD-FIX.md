# Standalone Build Fix Documentation

## Problem

The error `Cannot find module '/var/www/oyagema/.next/standalone/server.js'` indicates that the standalone build is incomplete or failed. This typically happens when:

1. The build process was interrupted
2. The `.next/standalone/server.js` file was not created during the build
3. The standalone output configuration is not working properly
4. Dependencies or build artifacts are missing

## Root Cause

Next.js standalone builds require:
- Proper `output: 'standalone'` configuration in `next.config.js` ✅ (already configured)
- Complete build process that generates `server.js` in `.next/standalone/`
- All dependencies properly installed
- Prisma client generated before build

## Solution

I've created a comprehensive fix script that:

1. **Cleans previous builds**: Removes `.next` directory to start fresh
2. **Reinstalls dependencies**: Ensures all packages are properly installed
3. **Regenerates Prisma client**: Updates database client before build
4. **Rebuilds application**: Creates new standalone build
5. **Verifies server.js**: Checks if the critical file was created
6. **Copies assets**: Ensures all static files are in place

## Usage

### On Remote Server

Run the fix script:

```bash
npm run fix-standalone
```

Or directly:

```bash
./scripts/fix-standalone-build.sh
```

### After Fix

Once the script completes successfully:

```bash
# Restart PM2
pm2 restart oyagema

# Monitor logs
pm2 logs oyagema

# Check status
pm2 status
```

## Verification

The script will:
- ✅ Confirm `server.js` exists at `.next/standalone/server.js`
- ✅ Copy all necessary assets
- ✅ Show directory structure if there are issues

## Prevention

To prevent this issue in the future:

1. **Always run full build**: Use `npm run build` instead of partial builds
2. **Check disk space**: Ensure sufficient space for build artifacts
3. **Monitor build logs**: Watch for any errors during the build process
4. **Use deployment script**: The `deploy-pm2.sh` script includes proper build steps

## Alternative Deployment

If the standalone build continues to fail, you can temporarily use:

```bash
# Update ecosystem.config.js to use development mode
script: 'npm',
args: 'run dev',
env: {
  NODE_ENV: 'development',
  PORT: 3000
}
```

However, this is not recommended for production as it's less optimized.

## Files Created/Modified

- `scripts/fix-standalone-build.sh` - Main fix script
- `package.json` - Added `fix-standalone` npm script
- This documentation file

## Notes

- The fix script is safe to run multiple times
- It will show detailed output to help diagnose any remaining issues
- All existing uploads and assets will be preserved
- The script includes error handling and verification steps