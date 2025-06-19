import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { Comment, createComment, uploadCommentImage } from '../services/supabase/comments';
import { deletePost, Post as SupabasePost } from '../services/supabase/posts';
import { supabase } from '../services/supabase/supabase';

// Types
export interface Post {
  id: string;
  user: {
    id: string;
    name: string;
    avatarUri: string;
  };
  content: string;
  imageUri?: string;
  createdAt: string;
  likes?: number;
  comments?: number;
  shares?: number;
  likedByMe?: boolean;
}

export interface CommentData {
  content: string;
  imageUri?: string;
  parentId?: string;
}

interface PostsContextType {
  posts: Post[];
  isLoading: boolean;
  error: Error | null;
  addPost: (post: Omit<Post, 'id' | 'createdAt' | 'likes' | 'comments' | 'shares' | 'likedByMe'>) => Promise<Post>;
  addComment: (postId: string, commentData: CommentData) => Promise<Comment>;
  deleteComment: (postId: string, commentId: string) => Promise<void>;
  removePost: (id: string) => Promise<void>;
  toggleLike: (id: string) => void;
  clearPosts: () => Promise<void>;
}

const PostsContext = createContext<PostsContextType | undefined>(undefined);

// Convert Supabase post to our app's post format
const convertSupabasePost = (supabasePost: SupabasePost): Post => ({
  id: supabasePost.id,
  user: {
    id: supabasePost.user?.id || 'anonymous',
    name: supabasePost.user?.username || 'Anonymous',
    avatarUri: supabasePost.user?.avatar_url || 'https://ui-avatars.com/api/?name=Anonymous',
  },
  content: supabasePost.content,
  imageUri: supabasePost.image_url,
  createdAt: supabasePost.created_at,
  likes: 0, // TODO: Implement likes
  comments: supabasePost.comment_count || 0,
  shares: 0, // TODO: Implement shares
  likedByMe: false, // TODO: Implement likes
});

function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load posts from Supabase on mount
  useEffect(() => {
    loadPosts();

    // Set up real-time subscription for comment count changes
    const subscription = supabase
      .channel('post-comment-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all changes (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'comments',
        },
        async (payload: any) => {
          console.log('[DEBUG] Comment change detected:', payload);
          
          // If a comment was added or deleted, update the relevant post's comment count
          if (payload.eventType === 'INSERT' || payload.eventType === 'DELETE') {
            const postId = payload.new?.post_id || payload.old?.post_id;
            
            if (postId) {
              // Fetch the updated comment count for this specific post
              const { data, error } = await supabase
                .from('posts')
                .select('id, comment_count')
                .eq('id', postId)
                .single();
              
              if (!error && data) {
                console.log('[DEBUG] Updated post data:', data);
                
                // Update the local posts state with the new count
                setPosts((prevPosts) =>
                  prevPosts.map((post) =>
                    post.id === postId
                      ? { ...post, comments: data.comment_count || 0 }
                      : post
                  )
                );
              }
            }
          }
        }
      )
      .subscribe();
    
    // Clean up subscription on unmount
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const loadPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:profiles!posts_user_id_fkey(id, username, avatar_url)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Convert Supabase data format to app format
      const formattedPosts = data?.map(post => ({
        id: post.id,
        user: {
          id: post.user_id || 'anonymous',
          name: post.profiles?.username || 'Anonymous',
          avatarUri: post.profiles?.avatar_url || 'https://ui-avatars.com/api/?name=Anonymous',
        },
        content: post.content,
        imageUri: post.image_url,
        createdAt: post.created_at,
        likes: 0,
        comments: post.comment_count || 0,
        shares: 0,
        likedByMe: false,
      })) || [];
      
      setPosts(formattedPosts);
    } catch (error) {
      console.error('Failed to load posts:', error);
      setError(error instanceof Error ? error : new Error('Failed to load posts'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addPost = async (postData: Omit<Post, 'id' | 'createdAt' | 'likes' | 'comments' | 'shares' | 'likedByMe'>) => {
    try {
      // Make sure user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('User not authenticated');
      }
      
      const { data: newPostData, error } = await supabase
        .from('posts')
        .insert([{
          user_id: session.user.id,
          content: postData.content,
          image_url: postData.imageUri
        }])
        .select(`
          *,
          profiles:profiles!posts_user_id_fkey(id, username, avatar_url)
        `)
        .single();
      
      if (error) throw error;
      if (!newPostData) throw new Error('Failed to create post');
      
      // Format the new post to match the app's format
      const newPost: Post = {
        id: newPostData.id,
        user: {
          id: newPostData.user_id || 'anonymous',
          name: newPostData.profiles?.username || 'Anonymous',
          avatarUri: newPostData.profiles?.avatar_url || 'https://ui-avatars.com/api/?name=Anonymous',
        },
        content: newPostData.content,
        imageUri: newPostData.image_url,
        createdAt: newPostData.created_at,
        likes: 0,
        comments: 0,
        shares: 0,
        likedByMe: false,
      };

      setPosts((prevPosts) => [newPost, ...prevPosts]);
      return newPost;
    } catch (error) {
      console.error('Error adding post:', error);
      throw error;
    }
  };

  const addComment = async (postId: string, commentData: CommentData) => {
    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('User not authenticated');
      }

      // Upload image if provided
      let publicImageUrl: string | undefined;
      if (commentData.imageUri) {
        try {
          console.log('[DEBUG] Uploading comment image:', commentData.imageUri);
          publicImageUrl = await uploadCommentImage(commentData.imageUri);
          console.log('[DEBUG] Image uploaded successfully:', publicImageUrl);
        } catch (imageError) {
          console.error('[DEBUG] Error uploading image:', imageError);
          
          // Provide option to continue without image
          const proceedWithoutImage = await new Promise<boolean>((resolve) => {
            Alert.alert(
              'Image Upload Failed',
              'We couldn\'t upload your image. Would you like to post your comment without the image?',
              [
                { text: 'Cancel', onPress: () => resolve(false), style: 'cancel' },
                { text: 'Post without image', onPress: () => resolve(true) }
              ]
            );
          });
          
          if (!proceedWithoutImage) {
            throw new Error('Comment submission cancelled by user');
          }
          // Continue without image URL
        }
      }

      // Create the comment in Supabase
      const comment = await createComment(
        postId, 
        commentData.content, 
        publicImageUrl,
        commentData.parentId
      );
      
      // Optimistically update the comment count in the UI
      // This provides an immediate update even before the subscription triggers
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                comments: (post.comments || 0) + 1 
              }
            : post
        )
      );

      return comment;
    } catch (error) {
      console.error('[DEBUG] Error adding comment:', error);
      throw error;
    }
  };

  const deleteComment = async (postId: string, commentId: string) => {
    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('User not authenticated');
      }
      
      // Import the deleteComment function from the comments service
      const { deleteComment: deleteCommentService } = require('../services/supabase/comments');
      
      // Delete the comment in Supabase
      await deleteCommentService(commentId);
      
      // Optimistically update the comment count in the UI
      // This provides an immediate update even before the subscription triggers
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                comments: Math.max(0, (post.comments || 0) - 1) // Ensure count never goes below 0
              }
            : post
        )
      );
    } catch (error) {
      console.error('[DEBUG] Error deleting comment:', error);
      throw error;
    }
  };

  const removePost = useCallback(async (id: string) => {
    try {
      await deletePost(id);
      setPosts((prevPosts) => prevPosts.filter(post => post.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to remove post'));
      throw err;
    }
  }, []);

  const toggleLike = useCallback((id: string) => {
    // TODO: Implement likes with Supabase
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === id
          ? {
              ...post,
              likes: post.likedByMe ? (post.likes || 1) - 1 : (post.likes || 0) + 1,
              likedByMe: !post.likedByMe,
            }
          : post
      )
    );
  }, []);

  const clearPosts = useCallback(async () => {
    try {
      setPosts([]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to clear posts'));
      throw err;
    }
  }, []);

  return {
    posts,
    isLoading,
    error,
    addPost,
    addComment,
    deleteComment,
    removePost,
    toggleLike,
    clearPosts,
  };
}

export function PostsProvider({ children }: { children: ReactNode }) {
  const postsData = usePosts();

  return (
    <PostsContext.Provider value={postsData}>
      {children}
    </PostsContext.Provider>
  );
}

export function usePostsContext() {
  const context = useContext(PostsContext);
  if (context === undefined) {
    throw new Error('usePostsContext must be used within a PostsProvider');
  }
  return context;
} 