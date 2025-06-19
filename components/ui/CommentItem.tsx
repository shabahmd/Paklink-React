import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Comment } from '../../services/supabase/comments';
import { formatRelativeTime } from '../../utils/dateUtils';

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  postUserId?: string;
  onDelete: (commentId: string) => void;
  onReply: (commentId: string, content: string) => void;
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
    if (replyText.trim()) {
      onReply(comment.id, replyText.trim());
      setReplyText('');
      setIsReplying(false);
    }
  };

  return (
    <>
      {/* Main Comment Container */}
      <View style={[
        styles.commentContainer,
        depth > 0 && styles.indentedComment,
        commentContainer
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
            {/* Username */}
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
          <View style={styles.inputRow}>
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
              style={[styles.sendButton, !replyText.trim() && styles.sendButtonDisabled]}
              onPress={handleReplySubmit}
              disabled={!replyText.trim()}
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
    height: 150,
    borderRadius: 12,
    marginTop: 8,
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
    marginRight: 16,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#65676b',
  },
  actionTextActive: {
    color: '#0095F6',
  },
  deleteText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF3B30',
  },
  replyInputContainer: {
    marginLeft: 48,
    marginTop: 4,
    marginBottom: 8,
    marginRight: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 120,
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: '#0095F6',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#cccccc',
  },
}); 