import React, { useCallback } from 'react';
import { FlatList, RefreshControl, Text, View } from 'react-native';
import { usePostsContext } from '../../contexts/posts-context';
import { PostCard } from './Post';

export function Feed() {
  const { posts, isLoading, clearPosts } = usePostsContext();

  const onRefresh = useCallback(() => {
    clearPosts(); // For demo: clears all posts. Replace with reload logic if needed.
  }, [clearPosts]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-500 dark:text-gray-300">Loading feed...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={posts}
      keyExtractor={item => item.id}
      renderItem={({ item }) => <PostCard post={item} />}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={onRefresh}
          tintColor="#22c55e"
          colors={["#22c55e"]}
        />
      }
      contentContainerStyle={{ flexGrow: 1, paddingVertical: 8 }}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <View className="flex-1 items-center justify-center mt-20">
          <Text className="text-gray-400 dark:text-gray-600">No posts yet. Create one!</Text>
        </View>
      }
    />
  );
} 