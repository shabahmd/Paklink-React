import { RealtimeChannel } from '@supabase/supabase-js';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';
import { supabase } from './supabase';

export type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  parent_id?: string;
  likes_count: number | { count: number };
  is_liked: boolean;
  replies?: Comment[];
  user?: {
    id: string;
    username: string;
    avatar_url: string;
  };
};

export type CommentSubscriptionCallback = (payload: {
  new: Comment;
  old: Comment | null;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
}) => void;

export const fetchPostComments = async (postId: string): Promise<Comment[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  // First, fetch all comments for the post
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      user:profiles!comments_user_id_fkey (
        id,
        username,
        avatar_url
      ),
      likes_count:comment_likes(count),
      is_liked:comment_likes(id)
    `)
    .eq('post_id', postId)
    .is('parent_id', null) // Only fetch top-level comments
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Then, fetch replies for each comment
  const commentsWithReplies = await Promise.all((data || []).map(async (comment) => {
    const { data: replies, error: repliesError } = await supabase
      .from('comments')
      .select(`
        *,
        user:profiles!comments_user_id_fkey (
          id,
          username,
          avatar_url
        ),
        likes_count:comment_likes(count),
        is_liked:comment_likes(id)
      `)
      .eq('parent_id', comment.id)
      .order('created_at', { ascending: true });

    if (repliesError) throw repliesError;

    return {
      ...comment,
      replies: replies || [],
    };
  }));

  return commentsWithReplies;
};

export const createComment = async (
  postId: string,
  content: string,
  imageUrl?: string,
  parentId?: string
): Promise<Comment> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('comments')
    .insert([
      {
        post_id: postId,
        user_id: user.id,
        content,
        image_url: imageUrl,
        parent_id: parentId,
      },
    ])
    .select(`
      *,
      user:profiles!comments_user_id_fkey (
        id,
        username,
        avatar_url
      ),
      likes_count:comment_likes(count),
      is_liked:comment_likes(id)
    `)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Failed to create comment');
  
  // Normalize likes_count to a number
  const likesCount = typeof data.likes_count === 'object' && data.likes_count !== null ? 
    (data.likes_count.count || 0) : (data.likes_count || 0);
  
  // Add default values for newly created comment
  return {
    ...data,
    likes_count: likesCount,
    is_liked: !!data.is_liked,
    replies: []
  };
};

export const updateComment = async (
  commentId: string,
  content: string,
  imageUrl?: string
): Promise<Comment> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('comments')
    .update({
      content,
      image_url: imageUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', commentId)
    .eq('user_id', user.id)
    .select(`
      *,
      user:profiles!comments_user_id_fkey (
        id,
        username,
        avatar_url
      ),
      likes_count:comment_likes(count),
      is_liked:comment_likes(id)
    `)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Failed to update comment');
  
  // Normalize likes_count to a number
  const likesCount = typeof data.likes_count === 'object' && data.likes_count !== null ? 
    (data.likes_count.count || 0) : (data.likes_count || 0);
  
  // Add default values
  return {
    ...data,
    likes_count: likesCount,
    is_liked: !!data.is_liked,
    replies: []
  };
};

export const deleteComment = async (commentId: string): Promise<void> => {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId);

  if (error) throw error;
};

export const likeComment = async (commentId: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('comment_likes')
    .insert([
      {
        comment_id: commentId,
        user_id: user.id,
      },
    ]);

  if (error && error.code !== '23505') { // Ignore unique constraint violations
    throw error;
  }
};

export const unlikeComment = async (commentId: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('comment_likes')
    .delete()
    .eq('comment_id', commentId)
    .eq('user_id', user.id);

  if (error) throw error;
};

export const fetchSingleComment = async (commentId: string): Promise<Comment | null> => {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      user:profiles!comments_user_id_fkey (
        id,
        username,
        avatar_url
      ),
      likes_count:comment_likes(count),
      is_liked:comment_likes(id)
    `)
    .eq('id', commentId)
    .maybeSingle();

    if (error) {
      console.error('Error fetching single comment:', error);
      return null;
    }

    if (!data) return null;

    // Normalize likes_count to a number
    const likesCount = typeof data.likes_count === 'object' && data.likes_count !== null ? 
      (data.likes_count as unknown as { count: number }).count || 0 : (data.likes_count || 0);
    
    // Add default values
    return {
      ...data,
      likes_count: likesCount,
      is_liked: !!data.is_liked,
      replies: data.replies || []
    };
}

export const uploadCommentImage = async (uri: string): Promise<string> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const filePath = `${user.id}/${new Date().getTime()}.jpeg`;
    const { error } = await supabase.storage
      .from('comment-images')
      .upload(filePath, decode(base64), { 
        contentType: 'image/jpeg',
        upsert: false,
       });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage
      .from('comment-images')
      .getPublicUrl(filePath);

    if (!data.publicUrl) {
      throw new Error('Failed to get public URL for uploaded image');
    }

    console.log('[DEBUG] Image uploaded successfully:', data.publicUrl);
    return data.publicUrl;
  } catch (error) {
    console.error('[DEBUG] Image upload error:', error);
    throw error;
  }
};

export const subscribeToPostComments = (
  postId: string,
  callback: CommentSubscriptionCallback
): RealtimeChannel => {
  return supabase
    .channel(`comments:${postId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'comments',
        filter: `post_id=eq.${postId}`,
      },
      (payload) => {
        callback({
          new: payload.new as Comment,
          old: payload.old as Comment | null,
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
        });
      }
    )
    .subscribe();
}; 