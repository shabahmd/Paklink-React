import { Database } from './database.types';

export type Post = Database['public']['Tables']['posts']['Row'];
export type PostInsert = Database['public']['Tables']['posts']['Insert'];
export type Profile = Database['public']['Tables']['profiles']['Row'];

export interface PostWithProfile extends Omit<Post, 'user_id'> {
  profiles: Profile;
}

export interface PostFormData {
  text_content: string;
  media_url?: string;
  media_type?: string;
} 