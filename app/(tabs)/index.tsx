import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PostCard } from '../../src/components/PostCard';
import { usePosts } from '../../src/hooks/usePosts';

export default function TabOneScreen() {
  const insets = useSafeAreaInsets();
  const { 
    posts, 
    isLoading, 
    isError, 
    refetch, 
    isRefetching, 
    hasNextPage, 
    fetchNextPage, 
    isFetchingNextPage 
  } = usePosts();

  const renderEmptyState = () => {
    // This function remains the same.
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" />
        </View>
      );
    }
    if (isError) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Failed to load posts</Text>
          <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No posts yet</Text>
        <Text style={styles.emptySubtext}>Be the first to share something!</Text>
      </View>
    );
  };

  return (
    // FIX: The paddingBottom has been removed from this container View.
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={({ item }) => <PostCard post={item} />}
        keyExtractor={(item) => item.id}
        // FIX: The paddingBottom is now applied to the FlatList's content.
        // This ensures the list items don't hide behind the tab bar,
        // but it doesn't affect the floating button's position.
        // We add extra padding to also clear the floating button itself.
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 90 }]}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => 
          isFetchingNextPage ? <ActivityIndicator style={{ marginVertical: 20 }} /> : null
        }
      />

      {/* This floating action button (FAB) will now be visible. */}
      <Link href="/create-post" asChild>
        <TouchableOpacity 
          style={[styles.fab, { bottom: insets.bottom + 16 }]}
          accessibilityLabel="Create Post"
          accessibilityRole="button"
        >
          <Ionicons name="add" size={32} color="#fff" />
        </TouchableOpacity>
      </Link>
    </View>
  );
}

// Styles are mostly the same, just a minor adjustment to listContent might be needed.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    paddingHorizontal: 16, // Use horizontal padding
    paddingTop: 16,        // Use top padding
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#ff3b30',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007aff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
  },
  fab: {
    position: 'absolute',
    right: 16,
    width: 64,
    height: 64,
    borderRadius: 32,
    zIndex: 999, // <- 🔥 Add this
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
});
