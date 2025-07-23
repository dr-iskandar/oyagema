const chokidar = require('chokidar');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
const SCRIPT_PATH = path.join(process.cwd(), 'scripts', 'sync-uploads.sh');
const PRODUCTION_SCRIPT_PATH = path.join(process.cwd(), 'scripts', 'sync-uploads-production.sh');

// Determine which script to use
const isProduction = process.env.NODE_ENV === 'production';
const syncScript = isProduction ? PRODUCTION_SCRIPT_PATH : SCRIPT_PATH;

// Check if sync is enabled
const isSyncEnabled = process.env.DISABLE_UPLOAD_SYNC !== 'true' && 
                     (isProduction || process.env.ENABLE_UPLOAD_SYNC === 'true');

if (!isSyncEnabled) {
  console.log('Upload sync is disabled. Exiting watcher.');
  process.exit(0);
}

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  console.log(`Created uploads directory: ${UPLOADS_DIR}`);
}

// Check if sync script exists
if (!fs.existsSync(syncScript)) {
  console.error(`Sync script not found: ${syncScript}`);
  process.exit(1);
}

console.log(`Starting upload watcher for: ${UPLOADS_DIR}`);
console.log(`Using sync script: ${syncScript}`);

// Debounce function to prevent multiple rapid executions
let syncTimeout;
const DEBOUNCE_DELAY = 2000; // 2 seconds

function executeSyncScript() {
  clearTimeout(syncTimeout);
  syncTimeout = setTimeout(() => {
    console.log('Executing sync script...');
    exec(`bash "${syncScript}"`, (error, stdout, stderr) => {
      if (error) {
        console.error('Sync script error:', error);
        return;
      }
      if (stdout) {
        console.log('Sync output:', stdout.trim());
      }
      if (stderr) {
        console.warn('Sync warnings:', stderr.trim());
      }
    });
  }, DEBOUNCE_DELAY);
}

// Watch for file additions in uploads directory
const watcher = chokidar.watch(UPLOADS_DIR, {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true,
  ignoreInitial: true // don't trigger on existing files
});

// Handle file additions
watcher.on('add', (filePath) => {
  const fileName = path.basename(filePath);
  const fileExt = path.extname(fileName).toLowerCase();
  
  // Only sync for audio files
  const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac'];
  if (audioExtensions.includes(fileExt)) {
    console.log(`New audio file detected: ${fileName}`);
    executeSyncScript();
  } else {
    console.log(`File added (not audio): ${fileName}`);
  }
});

// Handle errors
watcher.on('error', (error) => {
  console.error('Watcher error:', error);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Stopping upload watcher...');
  watcher.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Stopping upload watcher...');
  watcher.close();
  process.exit(0);
});

console.log('Upload watcher started successfully. Watching for new audio files...');