import { useEffect, useState } from 'react';
import { Post } from '../contexts/posts-context';

// Mock data for posts
const mockPosts: Post[] = [
  {
    id: '1',
    user: {
      id: 'user1',
      name: 'John Doe',
      avatarUri: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    content: 'Just finished setting up my new React Native project with Expo. Loving the developer experience so far!',
    imageUri: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?q=80&w=2070',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    likes: 24,
    comments: 5,
    shares: 2,
    likedByMe: false,
  },
  {
    id: '2',
    user: {
      id: 'user2',
      name: 'Jane Smith',
      avatarUri: 'https://randomuser.me/api/portraits/women/44.jpg',
    },
    content: 'Beautiful day at the beach! 🏖️ #weekend #relax',
    imageUri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    likes: 56,
    comments: 12,
    shares: 4,
    likedByMe: false,
  },
  {
    id: '3',
    user: {
      id: 'user3',
      name: 'Alex Johnson',
      avatarUri: 'https://randomuser.me/api/portraits/men/75.jpg',
    },
    content: 'Just released a new version of my app! Check it out and let me know what you think.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    likes: 18,
    comments: 3,
    shares: 1,
    likedByMe: false,
  },
  {
    id: '4',
    user: {
      id: 'user4',
      name: 'Sarah Williams',
      avatarUri: 'https://randomuser.me/api/portraits/women/68.jpg',
    },
    content: 'Learning TypeScript has been a game changer for my React Native development. Highly recommended!',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    likes: 32,
    comments: 7,
    shares: 5,
    likedByMe: false,
  },
];

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  
  // Simulate fetching posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setPosts(mockPosts);
        setIsError(false);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setIsError(true);
      } finally {
        setIsLoading(false);
        setIsRefetching(false);
      }
    };
    
    fetchPosts();
  }, []);
  
  // Refetch posts
  const refetch = async () => {
    setIsRefetching(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPosts(mockPosts);
      setIsError(false);
    } catch (error) {
      console.error('Error refetching posts:', error);
      setIsError(true);
    } finally {
      setIsRefetching(false);
    }
  };
  
  // Mock pagination
  const fetchNextPage = async () => {
    // In a real app, you would fetch the next page of posts
    // For this example, we'll just wait and do nothing
    await new Promise(resolve => setTimeout(resolve, 1000));
  };
  
  return {
    posts,
    isLoading,
    isError,
    refetch,
    isRefetching,
    hasNextPage: false, // Mock value
    fetchNextPage,
    isFetchingNextPage: false, // Mock value
  };
} 