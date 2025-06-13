import { supabase } from '@/lib/supabase';
import { Post, PostInsert, PostWithProfile } from '../types/post.types';

/**
 * Fetches posts with user profiles
 * @param limit Number of posts to fetch
 * @param offset Pagination offset
 * @returns Array of posts with profile information
 */
export async function fetchPosts(
  limit: number = 10,
  offset: number = 0
): Promise<PostWithProfile[]> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profile:user_id (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }

    return data as PostWithProfile[];
  } catch (error) {
    console.error('Error in fetchPosts:', error);
    return [];
  }
}

/**
 * Fetches a single post by ID
 * @param id Post ID
 * @returns Post with profile information or null
 */
export async function fetchPostById(id: string): Promise<PostWithProfile | null> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profile:user_id (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching post:', error);
      throw error;
    }

    return data as PostWithProfile;
  } catch (error) {
    console.error('Error in fetchPostById:', error);
    return null;
  }
}

/**
 * Creates a new post
 * @param post Post data to insert
 * @returns Created post or null on error
 */
export async function createPost(post: PostInsert): Promise<Post | null> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: post.user_id,
        text_content: post.text_content,
        media_url: post.media_url,
        media_type: post.media_type,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating post:', error);
      throw error;
    }

    return data as Post;
  } catch (error) {
    console.error('Error in createPost:', error);
    return null;
  }
}

/**
 * Updates an existing post
 * @param id Post ID
 * @param updates Fields to update
 * @returns Updated post or null on error
 */
export async function updatePost(
  id: string,
  updates: Partial<Post>
): Promise<Post | null> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating post:', error);
      throw error;
    }

    return data as Post;
  } catch (error) {
    console.error('Error in updatePost:', error);
    return null;
  }
}

/**
 * Deletes a post
 * @param id Post ID
 * @returns Success status
 */
export async function deletePost(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting post:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in deletePost:', error);
    return false;
  }
}
