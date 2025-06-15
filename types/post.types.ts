import { Post } from '../contexts/posts-context';

export interface PostWithProfile extends Post {
  // Add any additional properties that might be needed for the PostCard component
  // For example, if there are additional profile-related fields:
  user: {
    id: string;
    name: string;
    avatarUri: string | number;
    // Additional profile fields can be added here
  };
} 