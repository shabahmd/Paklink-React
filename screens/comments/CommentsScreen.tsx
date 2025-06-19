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
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import CommentItem from '../../components/comments/CommentItem';
import { useAuth } from '../../contexts/AuthContext';
import {
    Comment,
    createComment,
    deleteComment,
    fetchPostComments,
    subscribeToPostComments,
    uploadCommentImage
} from '../../services/supabase/comments';
import { styles } from './styles';

interface CommentsScreenProps {
  postId: string;
  postUserId: string;
  onClose?: () => void;
}

export default function CommentsScreen({ postId, postUserId, onClose }: CommentsScreenProps) {
  const { user } = useAuth();
  
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
    const subscription = subscribeToPostComments(postId, ({ new: newComment, old: oldComment, eventType }) => {
      setComments(prevComments => {
        switch (eventType) {
          case 'INSERT':
            return [newComment, ...prevComments];
          case 'UPDATE':
            return prevComments.map(comment => 
              comment.id === newComment.id ? newComment : comment
            );
          case 'DELETE':
            return prevComments.filter(comment => 
              comment.id !== oldComment?.id
            );
          default:
            return prevComments;
        }
      });
    });
    
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
        console.log('[DEBUG] Uploading comment image');
        imageUrl = await uploadCommentImage(selectedImage);
        console.log('[DEBUG] Image uploaded:', imageUrl);
      }

      console.log('[DEBUG] Creating comment');
      await createComment(postId, commentText.trim(), imageUrl);
      
      setCommentText('');
      setSelectedImage(null);
      Keyboard.dismiss();
    } catch (error) {
      console.error('[DEBUG] Error posting comment:', error);
      Alert.alert('Error', 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    console.log('[DEBUG] Attempting to delete comment:', commentId);
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('[DEBUG] Deleting comment:', commentId);
              await deleteComment(commentId);
              console.log('[DEBUG] Comment deleted successfully');
            } catch (error) {
              console.error('[DEBUG] Error deleting comment:', error);
              Alert.alert('Error', 'Failed to delete comment');
            }
          },
        },
      ],
    );
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
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Comments</Text>
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#262626" />
          </TouchableOpacity>
        )}
      </View>
      
      <FlatList
        data={comments}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <CommentItem
            comment={item}
            currentUserId={user?.id}
            postUserId={postUserId}
            onDelete={handleDelete}
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
                <MaterialIcons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.inputRow}>
            <TouchableOpacity style={styles.imageButton} onPress={handleImagePick}>
              <Ionicons name="image-outline" size={24} color="#0095F6" />
            </TouchableOpacity>
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
                (!commentText.trim() && !selectedImage) && styles.sendButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={submitting || (!commentText.trim() && !selectedImage)}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="send" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.loginPrompt}>
          <Text style={styles.loginPromptText}>Please log in to comment</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
