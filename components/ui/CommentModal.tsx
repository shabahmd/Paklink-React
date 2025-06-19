import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { CommentData, usePostsContext } from '../../contexts/posts-context';
import { Comment } from '../../services/supabase/comments';
import CommentItem from './CommentItem';

interface CommentModalProps {
  isVisible: boolean;
  onClose: () => void;
  postId: string;
  postUserId: string;
  comments: Comment[];
}

export default function CommentModal({ isVisible, onClose, postId, postUserId, comments }: CommentModalProps) {
  const { user, isAuthenticated } = useAuth();
  const { addComment } = usePostsContext();
  const [newComment, setNewComment] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if ((!newComment.trim() && !selectedImage) || !isAuthenticated) {
      Alert.alert('Error', 'Please enter a comment or select an image');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const commentData: CommentData = {
        content: newComment.trim(),
        imageUri: selectedImage || undefined
      };
      
      await addComment(postId, commentData);
      
      setNewComment('');
      setSelectedImage(null);
      Alert.alert('Success', 'Your comment has been posted');
    } catch (error) {
      console.error('Failed to add comment:', error);
      Alert.alert('Error', 'Failed to add comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add missing handler functions
  const handleDelete = (commentId: string) => {
    Alert.alert('Delete Comment', 'This functionality is not implemented yet');
  };

  const handleReply = (commentId: string, content: string) => {
    Alert.alert('Reply to Comment', 'This functionality is not implemented yet');
  };

  const handleLike = (commentId: string) => {
    Alert.alert('Like Comment', 'This functionality is not implemented yet');
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeAreaContainer} edges={['left', 'right', 'bottom']}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
        
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 40}
        >
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Comments</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0095F6" />
              </View>
            ) : (
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
            )}

            {/* Comment input section */}
            <View style={styles.inputContainer}>
              {selectedImage && (
                <View style={styles.selectedImageContainer}>
                  <Image 
                    source={{ uri: selectedImage }} 
                    style={styles.selectedImage}
                    resizeMode="cover" 
                  />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setSelectedImage(null)}
                  >
                    <Ionicons name="close-circle" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}
              <View style={styles.inputRow}>
                <Image 
                  source={{ uri: user?.email ? `https://ui-avatars.com/api/?name=${user.email.charAt(0)}` : 'https://ui-avatars.com/api/?name=User' }}
                  style={styles.userAvatar} 
                />
                <View style={styles.inputWrapper}>
                  <TextInput
                    ref={inputRef}
                    style={styles.input}
                    placeholder="Add a comment..."
                    value={newComment}
                    onChangeText={setNewComment}
                    multiline
                    maxLength={1000}
                    editable={!isSubmitting}
                  />
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={styles.imagePickerButton}
                      onPress={pickImage}
                      disabled={isSubmitting}
                    >
                      <Ionicons name="image" size={24} color="#0095F6" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.sendButton,
                        (!newComment.trim() && !selectedImage || !isAuthenticated) && styles.sendButtonDisabled
                      ]}
                      onPress={handleSubmit}
                      disabled={(!newComment.trim() && !selectedImage) || isSubmitting || !isAuthenticated}
                    >
                      {isSubmitting ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Ionicons name="send" size={20} color="#fff" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '95%',
    width: '100%',
    paddingTop: 20,
    paddingBottom: Platform.OS === 'android' ? 30 : 0, // Increased padding for Android
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentsList: {
    paddingTop: 10,
    paddingBottom: 60,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 40,
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
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: 12,
    paddingBottom: Platform.OS === 'android' ? 36 : 12, // Increased padding for Android
    backgroundColor: '#fff',
    position: 'relative',
    zIndex: 10,
  },
  selectedImageContainer: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    alignSelf: 'flex-start',
    maxWidth: 150,
    height: 150,
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  inputWrapper: {
    flex: 1,
    position: 'relative',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    paddingRight: 80, // Space for buttons
    maxHeight: 80,
    fontSize: 14,
  },
  buttonContainer: {
    position: 'absolute',
    right: 8,
    bottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  imagePickerButton: {
    marginRight: 8,
    padding: 4,
  },
  sendButton: {
    backgroundColor: '#0095F6',
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
}); 