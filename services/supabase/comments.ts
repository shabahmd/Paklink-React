import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './supabase';

export type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
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
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      user:profiles!comments_user_id_fkey (
        id,
        username,
        avatar_url
      )
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const createComment = async (
  postId: string,
  content: string,
  imageUrl?: string
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
      },
    ])
    .select(`
      *,
      user:profiles!comments_user_id_fkey (
        id,
        username,
        avatar_url
      )
    `)
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to create comment');
  return data;
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
      )
    `)
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to update comment');
  return data;
};

export const deleteComment = async (commentId: string): Promise<void> => {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId);

  if (error) throw error;
};

export const uploadCommentImage = async (uri: string): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const filename = `${user.id}/${Date.now()}.jpg`;
  const response = await fetch(uri);
  const blob = await response.blob();

  const { error: uploadError } = await supabase.storage
    .from('comment-images')
    .upload(filename, blob);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('comment-images')
    .getPublicUrl(filename);

  return publicUrl;
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