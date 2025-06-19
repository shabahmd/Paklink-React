import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, ImageSourcePropType, Text, TouchableOpacity, View } from 'react-native';
import { Post, usePostsContext } from '../../contexts/posts-context';

function getImageSource(src: string | number | undefined): ImageSourcePropType | undefined {
  if (!src) return undefined;
  if (typeof src === 'string') return { uri: src };
  return src;
}

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const { toggleLike } = usePostsContext();
  const router = useRouter();

  const handleCommentPress = () => {
    console.log('[DEBUG] Comment button pressed in Post.tsx');
    console.log('[DEBUG] Post data:', post);
    router.push({
      pathname: '/comments',
      params: {
        postId: post.id,
        postUserId: post.user.id,
      },
    });
  };

  return (
    <View className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm my-2">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-4 pb-2">
        <Image
          source={getImageSource(post.user.avatarUri)}
          className="w-10 h-10 rounded-full bg-gray-200"
          resizeMode="cover"
        />
        <View className="flex-1 ml-3">
          <Text className="text-base font-semibold text-gray-900 dark:text-white">{post.user.name}</Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">{new Date(post.createdAt).toLocaleString()}</Text>
        </View>
        <TouchableOpacity className="p-2" accessibilityLabel="More options" accessibilityRole="button">
          <Ionicons name="ellipsis-horizontal" size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {post.content ? (
        <Text className="px-4 pb-2 text-base text-gray-900 dark:text-white">{post.content}</Text>
      ) : null}

      {/* Image */}
      {post.imageUri ? (
        <Image
          source={getImageSource(post.imageUri)}
          className="w-full aspect-[4/3] bg-gray-200"
          resizeMode="cover"
        />
      ) : null}

      {/* Stats */}
      <View className="flex-row justify-between px-4 py-2 border-b border-gray-100 dark:border-neutral-800">
        <View className="flex-row items-center">
          <Ionicons name="heart" size={16} color="#22c55e" />
          <Text className="ml-1 text-xs text-gray-600 dark:text-gray-300">{post.likes || 0}</Text>
        </View>
        <View className="flex-row space-x-4">
          <Text className="text-xs text-gray-600 dark:text-gray-300">{post.comments || 0} comments</Text>
          <Text className="text-xs text-gray-600 dark:text-gray-300">{post.shares || 0} shares</Text>
        </View>
      </View>

      {/* Actions */}
      <View className="flex-row justify-around py-2">
        <TouchableOpacity
          className="flex-row items-center px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-neutral-800"
          onPress={() => toggleLike(post.id)}
          accessibilityLabel={post.likedByMe ? 'Unlike' : 'Like'}
          accessibilityRole="button"
        >
          <Ionicons
            name={post.likedByMe ? 'heart' : 'heart-outline'}
            size={22}
            color={post.likedByMe ? '#22c55e' : '#6b7280'}
          />
          <Text className={post.likedByMe ? 'ml-1 text-sm text-green-600 dark:text-green-400 font-semibold' : 'ml-1 text-sm text-gray-600 dark:text-gray-300'}>
            Like
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-row items-center px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-neutral-800"
          onPress={handleCommentPress}
          accessibilityLabel="Comment"
          accessibilityRole="button"
        >
          <Ionicons
            name="chatbubble-outline"
            size={22}
            color="#6b7280"
          />
          <Text className="ml-1 text-sm text-gray-600 dark:text-gray-300">
            Comment {(post.comments ?? 0) > 0 ? `(${post.comments})` : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-row items-center px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-neutral-800"
          accessibilityLabel="Share"
          accessibilityRole="button"
        >
          <Ionicons name="share-social-outline" size={22} color="#6b7280" />
          <Text className="ml-1 text-sm text-gray-600 dark:text-gray-300">
            Share {(post.shares ?? 0) > 0 ? `(${post.shares})` : ''}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 