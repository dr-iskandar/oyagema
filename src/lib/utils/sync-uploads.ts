import { exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import { existsSync } from 'fs';

const execAsync = promisify(exec);

/**
 * Executes the upload sync script to synchronize files between directories
 * This is typically used in production to sync uploads to the standalone build
 */
export async function executeSyncScript(): Promise<void> {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    const scriptName = isProduction ? 'sync-uploads-production.sh' : 'sync-uploads.sh';
    const scriptPath = join(process.cwd(), 'scripts', scriptName);
    
    // Check if script exists
    if (!existsSync(scriptPath)) {
      console.warn(`Sync script not found at ${scriptPath}`);
      return;
    }
    
    console.log(`Executing sync script: ${scriptName}`);
    
    // Execute the script with timeout
    const { stdout, stderr } = await execAsync(`bash "${scriptPath}"`, {
      timeout: 30000, // 30 seconds timeout
      cwd: process.cwd()
    });
    
    if (stdout) {
      console.log('Sync script output:', stdout);
    }
    
    if (stderr) {
      console.warn('Sync script warnings:', stderr);
    }
    
    console.log('Upload sync completed successfully');
  } catch (error) {
    console.error('Error executing sync script:', error);
    // Don't throw the error to prevent upload failure
    // The sync is a nice-to-have feature, not critical
  }
}

/**
 * Executes sync script specifically for music uploads
 * Only runs if the file type is audio
 */
export async function syncMusicUpload(fileType: string): Promise<void> {
  if (!fileType.includes('audio')) {
    return; // Only sync for audio files
  }
  
  console.log('Music file uploaded, executing sync script...');
  await executeSyncScript();
}

/**
 * Checks if sync is enabled based on environment variables
 */
export function isSyncEnabled(): boolean {
  // Allow disabling sync via environment variable
  if (process.env.DISABLE_UPLOAD_SYNC === 'true') {
    return false;
  }
  
  // Only enable sync in production or when explicitly enabled
  return process.env.NODE_ENV === 'production' || process.env.ENABLE_UPLOAD_SYNC === 'true';
}