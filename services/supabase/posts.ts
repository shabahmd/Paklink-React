import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';
import { supabase } from './supabase';

export type Post = {
  id: string;
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

export const fetchPosts = async (): Promise<Post[]> => {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      user:profiles!posts_user_id_fkey (
        id,
        username,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const createPost = async (
  content: string,
  imageUrl?: string
): Promise<Post> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('posts')
    .insert([
      {
        user_id: user.id,
        content,
        image_url: imageUrl,
      },
    ])
    .select(`
      *,
      user:profiles!posts_user_id_fkey (
        id,
        username,
        avatar_url
      )
    `)
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to create post');

  return data;
};

export const updatePost = async (
  id: string,
  content: string,
  imageUrl?: string
): Promise<Post> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('posts')
    .update({
      content,
      image_url: imageUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id) // Ensure user owns the post
    .select(`
      *,
      user:profiles!posts_user_id_fkey (
        id,
        username,
        avatar_url
      )
    `)
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to update post');

  return data;
};

export const deletePost = async (id: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id); // Ensure user owns the post

  if (error) throw error;
};

export const uploadPostImage = async (uri: string): Promise<string> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Read the file as base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const fileName = `${user.id}/${Date.now()}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from('post-images')
      .upload(fileName, decode(base64), {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('post-images')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}; 