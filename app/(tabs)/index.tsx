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
import { PostCard } from '../../components/feed/PostCard';
import { StatusUpdate } from '../../components/feed/StatusUpdate';
import { useAuth } from '../../contexts/AuthContext';
import { usePostsContext } from '../../contexts/posts-context';

const DEFAULT_AVATAR_URL = 'https://via.placeholder.com/50';

export default function TabOneScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { 
    posts, 
    isLoading,
    clearPosts
  } = usePostsContext();

  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
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

  const renderHeader = () => (
    <StatusUpdate userAvatar={user?.email ? `https://ui-avatars.com/api/?name=${user.email.charAt(0)}` : DEFAULT_AVATAR_URL} />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={({ item }) => <PostCard post={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 90 }]}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={() => clearPosts()} />
        }
      />

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    paddingTop: 0,
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginTop: 40,
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
    zIndex: 999,
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
