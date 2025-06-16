import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

// Types
export interface Post {
  id: string;
  user: {
    id: string;
    name: string;
    avatarUri: string | number;
  };
  content: string;
  imageUri?: string | number;
  createdAt: string;
  likes?: number;
  comments?: number;
  shares?: number;
  likedByMe?: boolean;
}

interface PostsState {
  posts: Post[];
  isLoading: boolean;
  error: Error | null;
}

interface PostsContextType {
  posts: Post[];
  isLoading: boolean;
  error: Error | null;
  addPost: (post: Omit<Post, 'id' | 'createdAt' | 'likes' | 'comments' | 'shares' | 'likedByMe'>) => Promise<void>;
  removePost: (id: string) => Promise<void>;
  toggleLike: (id: string) => void;
  clearPosts: () => Promise<void>;
}

// Remove SEED_POSTS since they reference lib folder assets
const STORAGE_KEY = 'paklink_posts';

const PostsContext = createContext<PostsContextType | undefined>(undefined);

function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load posts from storage on mount
  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      const storedPosts = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedPosts) {
        setPosts(JSON.parse(storedPosts));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load posts'));
    } finally {
      setIsLoading(false);
    }
  };

  const savePosts = async (newPosts: Post[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newPosts));
    } catch (err) {
      console.error('Failed to save posts:', err);
      throw err;
    }
  };

  const addPost = useCallback(async (post: Omit<Post, 'id' | 'createdAt' | 'likes' | 'comments' | 'shares' | 'likedByMe'>) => {
    try {
      const newPost: Post = {
        ...post,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        likes: 0,
        comments: 0,
        shares: 0,
        likedByMe: false,
      };

      const updatedPosts = [newPost, ...posts];
      setPosts(updatedPosts);
      await savePosts(updatedPosts);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add post'));
      throw err;
    }
  }, [posts]);

  const removePost = useCallback(async (id: string) => {
    try {
      const updatedPosts = posts.filter(post => post.id !== id);
      setPosts(updatedPosts);
      await savePosts(updatedPosts);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to remove post'));
      throw err;
    }
  }, [posts]);

  const toggleLike = useCallback((id: string) => {
    const updatedPosts = posts.map(post =>
      post.id === id
        ? {
            ...post,
            likedByMe: !post.likedByMe,
            likes: (post.likes || 0) + (post.likedByMe ? -1 : 1)
          }
        : post
    );
    setPosts(updatedPosts);
    savePosts(updatedPosts).catch(err => {
      console.error('Failed to save like status:', err);
      // Revert the change if save fails
      setPosts(posts);
    });
  }, [posts]);

  const clearPosts = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
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
  if (!context) {
    throw new Error('usePostsContext must be used within a PostsProvider');
  }
  return context;
} 