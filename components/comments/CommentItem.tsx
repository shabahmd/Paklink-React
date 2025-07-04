import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Comment } from '../../services/supabase/comments';
import { formatRelativeTime } from '../../utils/dateUtils';

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  postUserId?: string;
  onDelete: (commentId: string) => void;
  onReply: (commentId: string, content: string, imageUri?: string) => void;
  onLike: (commentId: string) => void;
  depth?: number;
  addComment?: boolean;
  commentContainer?: object;
  commentHeader?: object;
  commentImage?: object;
  commentContent?: object;
  userInfo?: object;
  username?: string;
  timestamp?: string;
  userImage?: string;
  photoURL?: string;
}

export default function CommentItem({
  comment,
  currentUserId,
  postUserId,
  onDelete,
  onReply,
  onLike,
  depth = 0,
  addComment,
  commentContainer,
  commentHeader,
  commentImage,
  commentContent,
  userInfo,
  username,
  timestamp,
  userImage,
  photoURL,
}: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyImage, setReplyImage] = useState<string | null>(null);
  const canDelete = currentUserId && (currentUserId === comment.user_id || currentUserId === postUserId);
  const maxDepth = 3; // Maximum nesting level for replies

  // Safely extract likes count - handle both number and object with count property
  const getLikesCount = () => {
    if (typeof comment.likes_count === 'number') {
      return comment.likes_count;
    } else if (comment.likes_count && typeof comment.likes_count === 'object') {
      return (comment.likes_count as { count: number }).count || 0;
    }
    return 0;
  };
  
  const likesCount = getLikesCount();

  const handleReplySubmit = () => {
    if (replyText.trim() || replyImage) {
      onReply(comment.id, replyText.trim(), replyImage || undefined);
      setReplyText('');
      setReplyImage(null);
      setIsReplying(false);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setReplyImage(result.assets[0].uri);
    }
  };

  return (
    <>
      {/* Main Comment Container */}
      <View style={[
        styles.commentContainer,
        depth > 0 && styles.indentedComment,
        commentContainer,
      ]}>
        {/* User Avatar */}
        <Image
          source={{ uri: photoURL || userImage || comment.user?.avatar_url || 'https://ui-avatars.com/api/?name=User' }}
          style={styles.avatar}
        />

        {/* Comment Content Container */}
        <View style={[styles.contentContainer, commentContent]}>
          {/* Comment Bubble */}
          <View style={styles.commentBubble}>
            {/* Header with username (if provided) */}
            <View style={[styles.userInfoContainer, userInfo, commentHeader]}>
              <Text style={styles.username}>
                {username || comment.user?.username || 'Anonymous'}
              </Text>
            </View>

            {/* Comment Text */}
            {comment.content && (
              <Text style={styles.commentText}>{comment.content}</Text>
            )}

            {/* Comment Image (if any) */}
            {comment.image_url && (
              <Image
                source={{ uri: comment.image_url }}
                style={[styles.commentImage, commentImage]}
                resizeMode="cover"
              />
            )}
          </View>

          {/* Actions Row */}
          <View style={styles.actionsContainer}>
            {/* Timestamp */}
            <Text style={styles.timestamp}>
              {timestamp || formatRelativeTime(new Date(comment.created_at))}
            </Text>

            {/* Like Button */}
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => onLike(comment.id)}
            >
              <Text style={[
                styles.actionText,
                comment.is_liked && styles.actionTextActive
              ]}>
                {likesCount > 0 ? `${likesCount} ` : ''}
                {likesCount === 1 ? 'Like' : 'Likes'}
              </Text>
            </TouchableOpacity>

            {/* Reply Button */}
            {depth < maxDepth && currentUserId && (
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => setIsReplying(!isReplying)}
              >
                <Text style={styles.actionText}>Reply</Text>
              </TouchableOpacity>
            )}

            {/* Delete Button (if user has permission) */}
            {canDelete && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onDelete(comment.id)}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Reply Input (conditionally rendered) */}
      {isReplying && (
        <View style={styles.replyInputContainer}>
          {replyImage && (
            <View style={styles.replyImageContainer}>
              <Image source={{ uri: replyImage }} style={styles.replyImage} />
              <TouchableOpacity style={styles.removeReplyImageButton} onPress={() => setReplyImage(null)}>
                <Ionicons name="close-circle" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.inputRow}>
            <TouchableOpacity style={styles.imagePickerButton} onPress={handlePickImage}>
              <Ionicons name="image-outline" size={22} color="#65676b" />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="Write a reply..."
              value={replyText}
              onChangeText={setReplyText}
              multiline
              maxLength={1000}
              autoFocus
            />
            <TouchableOpacity
              style={[styles.sendButton, (!replyText.trim() && !replyImage) && styles.sendButtonDisabled]}
              onPress={handleReplySubmit}
              disabled={!replyText.trim() && !replyImage}
            >
              <Ionicons name="send" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Recursively render replies */}
      {comment.replies?.map(reply => (
        <CommentItem
          key={reply.id}
          comment={reply}
          currentUserId={currentUserId}
          postUserId={postUserId}
          onDelete={onDelete}
          onReply={onReply}
          onLike={onLike}
          depth={depth + 1}
        />
      ))}
    </>
  );
}

// Modern comment styles following Facebook/Instagram aesthetics
const styles = StyleSheet.create({
  commentContainer: {
    flexDirection: 'row',
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  indentedComment: {
    marginLeft: 40,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentBubble: {
    backgroundColor: '#f0f2f5',
    borderRadius: 18,
    padding: 12,
    maxWidth: '95%',
  },
  username: {
    fontWeight: 'bold',
    marginBottom: 4,
    fontSize: 14,
    color: '#050505',
  },
  commentText: {
    fontSize: 15,
    color: '#050505',
    lineHeight: 20,
  },
  commentImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 8,
    backgroundColor: '#f0f2f5',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingLeft: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#65676b',
    marginRight: 16,
  },
  actionButton: {
    marginRight: 12,
  },
  actionText: {
    fontSize: 12,
    color: '#65676b',
    fontWeight: '600',
  },
  actionTextActive: {
    color: '#2078f4',
  },
  deleteText: {
    fontSize: 12,
    color: '#e74c3c',
    fontWeight: '600',
  },
  replyInputContainer: {
    marginLeft: 52, // Indent to align with comment content
    marginVertical: 8,
    backgroundColor: '#f0f2f5',
    borderRadius: 18,
    padding: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    maxHeight: 80,
  },
  sendButton: {
    backgroundColor: '#0078ff',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#a0c8f0',
  },
  imagePickerButton: {
    padding: 4,
  },
  replyImageContainer: {
    position: 'relative',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  replyImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeReplyImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
  },
}); 