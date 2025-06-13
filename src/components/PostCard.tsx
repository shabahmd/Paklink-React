import { formatDistanceToNow } from 'date-fns';
import { Image as ExpoImage } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { PostWithProfile } from '../types/post.types';

interface PostCardProps {
  post: PostWithProfile;
  onPress?: () => void;
}

export function PostCard({ post, onPress }: PostCardProps) {
  const router = useRouter();
  const { width } = useWindowDimensions();

  // The profile data is aliased as 'profile' in the fetch query.
  const profile = post.profiles;

  // If for some reason the profile data is missing, we can provide a fallback.
  // This prevents the app from crashing.
  if (!profile) {
    // You can return a loading state or null here.
    return null;
  }

  const handleUserPress = () => {
    // Now we can safely use 'profile'
    router.push(`/profile/${profile.username}`);
  };

  const handlePostPress = () => {
    if (onPress) {
      onPress();
    }
  };

  const formattedDate = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });

  return (
    <Pressable
      style={styles.container}
      onPress={handlePostPress}
      android_ripple={{ color: '#eee' }}
    >
      <View style={styles.header}>
        <Pressable onPress={handleUserPress}>
          {/* We now safely access profile properties */}
          {profile.avatar_url && (
            <ExpoImage
              source={{ uri: profile.avatar_url }}
              style={styles.avatar}
              contentFit="cover"
            />
          )}
        </Pressable>

        <View style={styles.userInfo}>
          <Pressable onPress={handleUserPress}>
            <Text style={styles.username}>{profile.username}</Text>
            {profile.full_name && (
              <Text style={styles.fullName}>{profile.full_name}</Text>
            )}
          </Pressable>
          <Text style={styles.timestamp}>{formattedDate}</Text>
        </View>
      </View>

      <Text style={styles.content}>{post.text_content}</Text>

      {post.media_url && (
        <ExpoImage
          source={{ uri: post.media_url }}
          style={[styles.image, { width: width - 32 }]}
          contentFit="cover"
          transition={500}
        />
      )}

      <View style={styles.footer}>
        {/* Placeholder for like, comment, share buttons */}
        <View style={styles.actionButtons}>
          <Pressable style={styles.actionButton}>
            <Text>❤️ Like</Text>
          </Pressable>

          <Pressable style={styles.actionButton}>
            <Text>💬 Comment</Text>
          </Pressable>

          <Pressable style={styles.actionButton}>
            <Text>↗️ Share</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

// Styles remain the same
const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userInfo: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
  },
  fullName: {
    fontSize: 14,
    color: '#666',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  image: {
    height: 300,
    borderRadius: 8,
    marginBottom: 12,
  },
  footer: {
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
});
