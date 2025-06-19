import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../../screens/comments/styles';
import { Comment } from '../../services/supabase/comments';
import { formatRelativeTime } from '../../utils/dateUtils';

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  postUserId?: string;
  onDelete: (commentId: string) => void;
}

export default function CommentItem({
  comment,
  currentUserId,
  postUserId,
  onDelete,
}: CommentItemProps) {
  const canDelete = currentUserId && (currentUserId === comment.user_id || currentUserId === postUserId);

  return (
    <View style={styles.commentContainer}>
      <Image
        source={{ uri: comment.user?.avatar_url || 'https://ui-avatars.com/api/?name=User' }}
        style={styles.commentAvatar}
      />
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentUsername}>{comment.user?.username || 'Anonymous'}</Text>
          {canDelete && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => onDelete(comment.id)}
            >
              <MaterialIcons name="delete-outline" size={20} color="#FF3B30" />
            </TouchableOpacity>
          )}
        </View>
        {comment.content && (
          <Text style={styles.commentText}>{comment.content}</Text>
        )}
        {comment.image_url && (
          <Image
            source={{ uri: comment.image_url }}
            style={styles.commentImage}
            resizeMode="cover"
          />
        )}
        <Text style={styles.commentTime}>
          {formatRelativeTime(new Date(comment.created_at))}
        </Text>
      </View>
    </View>
  );
} 