import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Post, usePostsContext } from '../../contexts/posts-context';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const { toggleLike } = usePostsContext();
  const router = useRouter();

  // Format the timestamp
  const formatTimestamp = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleCommentPress = () => {
    console.log('[DEBUG] Comment button pressed');
    console.log('[DEBUG] Navigating to comments with params:', {
      postId: post.id,
      postUserId: post.user.id,
    });
    
    router.push({
      pathname: '/comments',
      params: {
        postId: post.id,
        postUserId: post.user.id,
      },
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Image 
          source={typeof post.user.avatarUri === 'string' ? { uri: post.user.avatarUri } : post.user.avatarUri} 
          style={styles.avatar} 
        />
        <View style={styles.headerText}>
          <Text style={styles.userName}>{post.user.name}</Text>
          <Text style={styles.timestamp}>{formatTimestamp(post.createdAt)}</Text>
        </View>
      </View>
      
      <Text style={styles.content}>{post.content}</Text>
      
      {post.imageUri && (
        <Image 
          source={typeof post.imageUri === 'string' ? { uri: post.imageUri } : post.imageUri} 
          style={styles.postImage} 
        />
      )}
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => toggleLike(post.id)}
        >
          <Text>{post.likedByMe ? '❤️' : '👍'} {post.likes || 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleCommentPress}
        >
          <Text>💬 {post.comments || 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text>↗️ {post.shares || 0}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  headerText: {
    flex: 1,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  timestamp: {
    color: '#666',
    fontSize: 12,
  },
  content: {
    fontSize: 16,
    marginBottom: 12,
    lineHeight: 22,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
  },
}); 