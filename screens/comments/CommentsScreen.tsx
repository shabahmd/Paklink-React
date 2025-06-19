import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import CommentItem from '../../components/comments/CommentItem';
import { useAuth } from '../../contexts/AuthContext';
import { usePostsContext } from '../../contexts/posts-context';
import {
  Comment,
  createComment,
  deleteComment,
  fetchPostComments,
  fetchSingleComment,
  likeComment,
  subscribeToPostComments,
  unlikeComment,
  uploadCommentImage
} from '../../services/supabase/comments';

interface CommentsScreenProps {
  postId: string;
  postUserId: string;
  onClose?: () => void;
}

export default function CommentsScreen({ postId, postUserId, onClose }: CommentsScreenProps) {
  const { user } = useAuth();
  const { deleteComment: deletePostComment, addComment: addPostComment } = usePostsContext();
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

  const loadComments = useCallback(async () => {
    if (!postId) {
      console.log('[DEBUG] No postId provided, skipping comment load');
      return;
    }
    
    console.log('[DEBUG] Loading comments for post:', postId);
    setLoading(true);
    
    try {
      const fetchedComments = await fetchPostComments(postId);
      console.log('[DEBUG] Fetched comments:', fetchedComments.length);
      setComments(fetchedComments);
    } catch (error) {
      console.error('[DEBUG] Error loading comments:', error);
      Alert.alert('Error', 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    console.log('[DEBUG] CommentsScreen mounted with props:', { postId, postUserId });
    
    if (!postId) {
      console.error('[DEBUG] CommentsScreen mounted without postId');
      return;
    }
    
    loadComments();

    // Subscribe to real-time updates
    const subscription = subscribeToPostComments(
      postId,
      async ({ new: newComment, old: oldComment, eventType }) => {
        if (eventType === 'INSERT' || eventType === 'UPDATE') {
          const fetchedComment = await fetchSingleComment(newComment.id);
          if (fetchedComment) {
            setComments((prevComments) => {
              // Handle replies
              if (fetchedComment.parent_id) {
                return prevComments.map((comment) => {
                  if (comment.id === fetchedComment.parent_id) {
                    const replyExists = comment.replies?.some(
                      (reply) => reply.id === fetchedComment.id
                    );
                    const updatedReplies = replyExists
                      ? comment.replies?.map((reply) =>
                          reply.id === fetchedComment.id ? fetchedComment : reply
                        )
                      : [...(comment.replies || []), fetchedComment];
                    return { ...comment, replies: updatedReplies };
                  }
                  return comment;
                });
              }

              // Handle top-level comments
              const commentExists = prevComments.some(
                (comment) => comment.id === fetchedComment.id
              );
              if (commentExists) {
                return prevComments.map((comment) =>
                  comment.id === fetchedComment.id ? fetchedComment : comment
                );
              } else {
                return [fetchedComment, ...prevComments];
              }
            });
          }
        } else if (eventType === 'DELETE') {
          if (!oldComment) return;
          setComments((prevComments) => {
            // Handle reply deletion
            if (oldComment.parent_id) {
              return prevComments.map((comment) => {
                if (comment.id === oldComment.parent_id) {
                  return {
                    ...comment,
                    replies:
                      comment.replies?.filter(
                        (reply) => reply.id !== oldComment.id
                      ) || [],
                  };
                }
                return comment;
              });
            }
            // Handle top-level comment deletion
            return prevComments.filter(
              (comment) => comment.id !== oldComment.id
            );
          });
        }
      }
    );
    
    return () => {
      console.log('[DEBUG] CommentsScreen unmounting');
      subscription.unsubscribe();
    };
  }, [loadComments, postId]);

  const handleImagePick = async () => {
    console.log('[DEBUG] Opening image picker');
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        console.log('[DEBUG] Image selected:', result.assets[0].uri);
        setSelectedImage(result.assets[0].uri);
      } else {
        console.log('[DEBUG] Image picker cancelled');
      }
    } catch (error) {
      console.error('[DEBUG] Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSubmit = async () => {
    if (!user || (!commentText.trim() && !selectedImage)) {
      console.log('[DEBUG] Invalid submit state:', { user, commentText, selectedImage });
      return;
    }

    console.log('[DEBUG] Submitting comment');
    setSubmitting(true);
    
    try {
      let imageUrl: string | undefined;
      if (selectedImage) {
        try {
          console.log('[DEBUG] Uploading comment image');
          imageUrl = await uploadCommentImage(selectedImage);
          console.log('[DEBUG] Image uploaded:', imageUrl);
        } catch (imageError) {
          console.error('[DEBUG] Error uploading image:', imageError);
          
          // Show specific error for image upload but continue with text comment
          const proceed = await new Promise<boolean>(resolve => {
            Alert.alert(
              'Image Upload Failed',
              'We couldn\'t upload your image, but we can still post your comment without it. Would you like to continue?',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                  onPress: () => resolve(false)
                },
                {
                  text: 'Post without image',
                  onPress: () => resolve(true)
                }
              ]
            );
          });
          
          if (!proceed) {
            setSubmitting(false);
            return;
          }
          // Continue without image
          imageUrl = undefined;
        }
      }

      console.log('[DEBUG] Creating comment');
      
      // Use the context's addComment function for consistent state updates
      await addPostComment(postId, {
        content: commentText.trim(),
        imageUri: imageUrl
      });
      
      // Clear form
      setCommentText('');
      setSelectedImage(null);
      Keyboard.dismiss();
    } catch (error) {
      console.error('[DEBUG] Error posting comment:', error);
      
      // Show more specific error message based on error type
      if (error instanceof Error) {
        if (error.message.includes('Network request failed')) {
          Alert.alert('Network Error', 'Please check your internet connection and try again.');
        } else if (error.message.includes('User not authenticated')) {
          Alert.alert('Authentication Error', 'Your session may have expired. Please log in again.');
        } else {
          Alert.alert('Error', 'Failed to post comment. Please try again.');
        }
      } else {
        Alert.alert('Error', 'An unknown error occurred. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    console.log('[DEBUG] Deleting comment:', commentId);
    
    try {
      await deleteComment(commentId);
      // Using context function to update the post's comment count
      await deletePostComment(postId, commentId);
      console.log('[DEBUG] Comment deleted successfully');
      
    } catch (error) {
      console.error('[DEBUG] Error deleting comment:', error);
      Alert.alert('Error', 'Failed to delete comment');
    }
  };

  const handleReply = async (parentId: string, content: string, imageUri?: string) => {
    if (!user || (!content.trim() && !imageUri)) return;

    setSubmitting(true);
    try {
      let imageUrl: string | undefined;
      if (imageUri) {
        imageUrl = await uploadCommentImage(imageUri);
      }
      await createComment(postId, content.trim(), imageUrl, parentId);
    } catch (error) {
      console.error('[DEBUG] Error posting reply:', error);
      Alert.alert('Error', 'Failed to post reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (commentId: string) => {
    if (!user) return;

    try {
      const comment = comments.find(c => c.id === commentId) || 
                     comments.find(c => c.replies?.some(r => r.id === commentId))?.replies?.find(r => r.id === commentId);
      
      if (!comment) return;

      if (comment.is_liked) {
        await unlikeComment(commentId);
      } else {
        await likeComment(commentId);
      }
    } catch (error) {
      console.error('[DEBUG] Error toggling like:', error);
      Alert.alert('Error', 'Failed to update like');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0095F6" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 120}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Comments</Text>
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#262626" />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={{ flex: 1 }}>
        <FlatList
          data={comments}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <CommentItem
              comment={item}
              currentUserId={user?.id}
              postUserId={postUserId}
              onDelete={handleDelete}
              onReply={handleReply}
              onLike={handleLike}
            />
          )}
          contentContainerStyle={styles.commentsList}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No comments yet</Text>
              <Text style={styles.emptySubText}>Be the first to comment!</Text>
            </View>
          )}
        />
        
        {user ? (
          <View style={styles.inputContainer}>
            {selectedImage && (
              <View style={styles.selectedImageContainer}>
                <Image source={{ uri: selectedImage }} style={styles.selectedImage} resizeMode="cover" />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => setSelectedImage(null)}
                >
                  <MaterialIcons name="close" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.inputRow}>
              <TouchableOpacity style={styles.imageButton} onPress={handleImagePick}>
                <Ionicons name="image-outline" size={24} color="#0095F6" />
              </TouchableOpacity>
              <View style={{ flex: 1, position: 'relative' }}>
                <TextInput
                  ref={inputRef}
                  style={styles.input}
                  placeholder="Add a comment..."
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline
                  maxLength={1000}
                  editable={!submitting}
                />
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    { position: 'absolute', right: 4, bottom: 4 },
                    (!commentText.trim() && !selectedImage) && styles.sendButtonDisabled
                  ]}
                  onPress={handleSubmit}
                  disabled={(!commentText.trim() && !selectedImage) || submitting}
                >
                  <Ionicons name="send" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.loginPrompt}>
            <Text style={styles.loginPromptText}>Please log in to comment</Text>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  commentsList: {
    flexGrow: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  inputContainer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
    paddingBottom: Platform.OS === 'android' ? 36 : 12,
  },
  selectedImageContainer: {
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    alignSelf: 'flex-start',
    maxWidth: 150,
  },
  selectedImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  imageButton: {
    padding: 8,
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingRight: 45,
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: '#0095F6',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#B2DFFC',
  },
  loginPrompt: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  loginPromptText: {
    color: '#666',
    fontSize: 14,
  },
});
