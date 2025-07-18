// Type definitions for database models

// User model types
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'USER' | 'ADMIN';
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Track model types
export interface Track {
  id: string;
  title: string;
  artist: string;
  description?: string | null;
  coverUrl: string;
  audioUrl: string;
  duration: string;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Category model types
export interface Category {
  id: string;
  title: string;
  description?: string | null;
  coverUrl: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

// Removed Playlist, PlaylistTrack, and Favorite models as they are not used

// History model types
export interface History {
  id: string;
  userId: string;
  trackId: string;
  playedAt: Date;
}

// Relation types
// Removed FavoriteWithTrack and PlaylistWithTracks as they are not used

export interface HistoryWithTrack extends History {
  track: Track;
}