import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchPosts } from '../services/posts';

// The options for our hook remain the same.
interface UsePostsOptions {
  limit?: number;
}

export function usePosts({ limit = 10 }: UsePostsOptions = {}) {
  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
    fetchNextPage, // Function to fetch the next page of results
    hasNextPage,    // Boolean that is true if there is a next page to fetch
    isFetchingNextPage, // Boolean to show a "loading more" indicator
  } = useInfiniteQuery({
    queryKey: ['posts'],
    // The query function now receives a 'pageParam' which tracks the offset.
    queryFn: ({ pageParam = 0 }) => fetchPosts(limit, pageParam),
    // We define how to get the 'pageParam' for the next page.
    getNextPageParam: (lastPage, allPages) => {
      // If the last page had fewer items than the limit, there are no more pages.
      if (lastPage.length < limit) {
        return undefined;
      }
      // The next page's offset is the total number of items fetched so far.
      return allPages.flat().length;
    },
    // The initial page starts at offset 0.
    initialPageParam: 0,
  });

  // We need to flatten the 'pages' array that useInfiniteQuery gives us
  // into a single, continuous list of posts.
  const posts = data?.pages.flat() || [];

  return {
    posts,
    isLoading,
    isError,
    isRefetching,
    isFetchingNextPage, // Use this for your "Load More" button's loading state
    hasNextPage,        // Use this to know when to show the "Load More" button
    refetch,            // This function is for "pull-to-refresh"
    fetchNextPage,      // Call this function when the user presses "Load More"
  };
}
