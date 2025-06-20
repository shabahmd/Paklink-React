// User profile data model for Paklink-React (Facebook-style)
export interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  coverPhotoUrl: string;
  bio?: string;
  location?: string;
  website?: string;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
}
