/**
 * Database configuration utilities
 */

/**
 * Checks if database operations should be skipped
 * Used during build time to prevent database connection attempts
 */
export const shouldSkipDbOperations = () => {
  // Check environment variable
  return process.env.NEXT_PUBLIC_SKIP_DB_OPERATIONS === 'true';
};

/**
 * Returns mock data when database operations are skipped
 */
export const getMockData = (type: string) => {
  // Return empty arrays or counts for different data types
  switch (type) {
    case 'tracks':
    // Removed playlists case
    case 'categories':
    case 'users':
      return [];
    case 'count':
      return 0;
    default:
      return null;
  }
};