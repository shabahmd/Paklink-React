import React, { createContext, ReactNode, useContext } from 'react';
import { usePosts } from '../hooks/usePosts';
import { postImages, userAvatars } from '../src/utils/assets';

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
}

interface PostsContextProps extends PostsState {
  addPost: (post: Omit<Post, 'id' | 'createdAt'>) => Promise<void>;
  removePost: (id: string) => Promise<void>;
  clearPosts: () => Promise<void>;
  toggleLike: (id: string) => void;
}

const SEED_POSTS: Post[] = [
  {
    id: '1',
    user: { id: 'user1', name: 'Alice', avatarUri: userAvatars.user2 },
    content: 'Just shipped my first package with Paklink! Amazing service 📦',
    imageUri: postImages.post1,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    likes: 12,
    comments: 3,
    shares: 1,
    likedByMe: false,
  },
  {
    id: '2',
    user: { id: 'user2', name: 'Bob', avatarUri: userAvatars.user3 },
    content: 'Great experience with international shipping through Paklink!',
    imageUri: postImages.post2,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    likes: 8,
    comments: 1,
    shares: 0,
    likedByMe: false,
  },
  {
    id: '3',
    user: { id: 'user3', name: 'Carol', avatarUri: userAvatars.user4 },
    content: 'Loving the new app design! #paklink',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    likes: 5,
    comments: 0,
    shares: 0,
    likedByMe: false,
  },
];

const initialState: PostsState = {
  posts: [],
  isLoading: true,
};

// Actions
const LOAD_POSTS = 'LOAD_POSTS';
const ADD_POST = 'ADD_POST';
const REMOVE_POST = 'REMOVE_POST';
const CLEAR_POSTS = 'CLEAR_POSTS';
const TOGGLE_LIKE = 'TOGGLE_LIKE';

interface Action {
  type: string;
  payload?: any;
}

function postsReducer(state: PostsState, action: Action): PostsState {
  switch (action.type) {
    case LOAD_POSTS:
      return { ...state, posts: action.payload, isLoading: false };
    case ADD_POST:
      return { ...state, posts: [action.payload, ...state.posts] };
    case REMOVE_POST:
      return { ...state, posts: state.posts.filter(p => p.id !== action.payload) };
    case CLEAR_POSTS:
      return { ...state, posts: [] };
    case TOGGLE_LIKE:
      return {
        ...state,
        posts: state.posts.map(post =>
          post.id === action.payload
            ? {
                ...post,
                likedByMe: !post.likedByMe,
                likes: (post.likes || 0) + (post.likedByMe ? -1 : 1),
              }
            : post
        ),
      };
    default:
      return state;
  }
}

// Create a context with the same shape as the usePosts hook
type PostsContextType = ReturnType<typeof usePosts> & {
  toggleLike: (id: string) => void;
  addPost: (post: Omit<Post, 'id' | 'createdAt'>) => Promise<void>;
  removePost: (id: string) => Promise<void>;
  clearPosts: () => Promise<void>;
};

const PostsContext = createContext<PostsContextType | undefined>(undefined);

const STORAGE_KEY = 'paklink_posts';

export function PostsProvider({ children }: { children: ReactNode }) {
  // Use the usePosts hook to get all the posts functionality
  const postsData = usePosts();
  
  // Implement toggleLike function
  const toggleLike = (id: string) => {
    const updatedPosts = postsData.posts.map(post => 
      post.id === id 
        ? { 
            ...post, 
            likedByMe: !post.likedByMe,
            likes: (post.likes || 0) + (post.likedByMe ? -1 : 1)
          }
        : post
    );
    
    console.log('Toggle like for post:', id);
  };
  
  // Implement addPost function
  const addPost = async (post: Omit<Post, 'id' | 'createdAt'>): Promise<void> => {
    const newPost: Post = {
      ...post,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: 0,
      shares: 0,
      likedByMe: false,
    };
    console.log('Adding post:', newPost);
    // In a real implementation, we would update the state here
  };
  
  // Implement removePost function
  const removePost = async (id: string): Promise<void> => {
    console.log('Removing post:', id);
    // In a real implementation, we would update the state here
  };
  
  // Implement clearPosts function
  const clearPosts = async (): Promise<void> => {
    console.log('Clearing all posts');
    // In a real implementation, we would update the state here
  };

  return (
    <PostsContext.Provider value={{ 
      ...postsData, 
      toggleLike,
      addPost,
      removePost,
      clearPosts
    }}>
      {children}
    </PostsContext.Provider>
  );
}

// Custom hook to use the posts context
export function usePostsContext() {
  const context = useContext(PostsContext);
  if (context === undefined) {
    throw new Error('usePostsContext must be used within a PostsProvider');
  }
  return context;
} 