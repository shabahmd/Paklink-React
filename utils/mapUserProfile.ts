import { UserProfile } from '../types/user.types';

// Supabase profile shape (snake_case)
export interface SupabaseProfile {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  cover_photo_url?: string;
  bio?: string;
  location?: string;
  website?: string;
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
}

export function mapSupabaseProfileToUserProfile(profile: SupabaseProfile): UserProfile {
  return {
    id: profile.id,
    name: profile.full_name || '',
    username: profile.username || '',
    avatarUrl: profile.avatar_url || '',
    coverPhotoUrl: profile.cover_photo_url || '',
    bio: profile.bio || '',
    location: profile.location || '',
    website: profile.website || '',
    followersCount: profile.followers_count || 0,
    followingCount: profile.following_count || 0,
    postsCount: profile.posts_count || 0,
  };
}
