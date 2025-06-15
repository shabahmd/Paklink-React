import React from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { Post } from '../../contexts/posts-context';
import { colors } from '../../theme/colors';
import { PostCard } from './Post';

interface PostListProps {
  posts: Post[];
  isRefreshing: boolean;
  onRefresh: () => void;
}

export function PostList({ posts, isRefreshing, onRefresh }: PostListProps) {
  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <PostCard post={item} />}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor={colors.greenPrimary}
          colors={[colors.greenPrimary]}
        />
      }
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    />
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
  },
  separator: {
    height: 8,
    backgroundColor: colors.gray100,
  },
}); 