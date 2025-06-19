import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
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
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { Comment, usePostsContext } from '../../contexts/posts-context';

interface CommentModalProps {
  isVisible: boolean;
  onClose: () => void;
  postId: string;
  comments: Comment[];
}

export default function CommentModal({ isVisible, onClose, postId, comments }: CommentModalProps) {
  const { user, isAuthenticated } = useAuth();
  const { addComment } = usePostsContext();
  const [newComment, setNewComment] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [showGuestNameInput, setShowGuestNameInput] = useState(false);
  const [pendingComment, setPendingComment] = useState<{content: string; imageUri?: string} | null>(null);

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
    if (!newComment.trim() && !selectedImage) {
      Alert.alert('Error', 'Please enter a comment or select an image');
      return;
    }

    // For guest users, store the comment and show name input
    if (!isAuthenticated && !guestName) {
      setPendingComment({
        content: newComment.trim(),
        imageUri: selectedImage || undefined
      });
      setShowGuestNameInput(true);
      return;
    }

    await submitComment(newComment, selectedImage);
  };

  const submitComment = async (content: string, imageUri: string | null) => {
    try {
      setIsSubmitting(true);
      const userName = isAuthenticated ? user?.email?.split('@')[0] || 'Guest' : guestName || 'Guest';
      
      await addComment(postId, {
        content: content.trim(),
        imageUri: imageUri || undefined,
        user: {
          id: user?.email || 'guest',
          name: userName,
          avatarUri: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userName),
        },
      });
      setNewComment('');
      setSelectedImage(null);
      setPendingComment(null);
    } catch (error) {
      console.error('Failed to add comment:', error);
      Alert.alert('Error', 'Failed to add comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestNameSubmit = async () => {
    if (!guestName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    
    setShowGuestNameInput(false);
    
    if (pendingComment) {
      await submitComment(pendingComment.content, pendingComment.imageUri || null);
    }
  };

  const renderComment = ({ item: comment }: { item: Comment }) => (
    <View style={styles.commentContainer}>
      <View style={styles.commentHeader}>
        <View style={styles.userInfo}>
          <Image
            source={{ uri: comment.user.avatarUri }}
            style={styles.avatar}
          />
          <Text style={styles.username}>{comment.user.name}</Text>
        </View>
        <Text style={styles.timestamp}>
          {new Date(comment.createdAt).toLocaleDateString()}
        </Text>
      </View>
      {comment.content ? (
        <Text style={styles.commentContent}>{comment.content}</Text>
      ) : null}
      {comment.imageUri ? (
        <Image
          source={{ uri: comment.imageUri }}
          style={styles.commentImage}
          resizeMode="cover"
        />
      ) : null}
    </View>
  );

  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isVisible}
        onRequestClose={onClose}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <SafeAreaView style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Comments</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={comments}
              renderItem={renderComment}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.commentsList}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No comments yet. Be the first!</Text>
              }
            />

            {selectedImage && (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => setSelectedImage(null)}
                >
                  <Ionicons name="close-circle" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={newComment}
                onChangeText={setNewComment}
                placeholder="Write a comment..."
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={styles.imageButton}
                onPress={pickImage}
              >
                <Ionicons name="image-outline" size={24} color="#007AFF" />
              </TouchableOpacity>
              {isSubmitting ? (
                <ActivityIndicator style={styles.submitButton} />
              ) : (
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    (!newComment.trim() && !selectedImage) && styles.submitButtonDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={(!newComment.trim() && !selectedImage) || isSubmitting}
                >
                  <Ionicons name="send" size={24} color="#007AFF" />
                </TouchableOpacity>
              )}
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={showGuestNameInput}
        onRequestClose={() => setShowGuestNameInput(false)}
      >
        <View style={styles.guestModalContainer}>
          <View style={styles.guestModalContent}>
            <Text style={styles.guestModalTitle}>Enter Your Name</Text>
            <TextInput
              style={styles.guestNameInput}
              value={guestName}
              onChangeText={setGuestName}
              placeholder="Your name"
              maxLength={30}
              autoFocus
            />
            <View style={styles.guestModalButtons}>
              <TouchableOpacity
                style={[styles.guestModalButton, styles.guestModalButtonCancel]}
                onPress={() => {
                  setShowGuestNameInput(false);
                  setPendingComment(null);
                }}
              >
                <Text style={styles.guestModalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.guestModalButton, styles.guestModalButtonSubmit]}
                onPress={handleGuestNameSubmit}
              >
                <Text style={styles.guestModalButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  commentsList: {
    padding: 16,
  },
  commentContainer: {
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  username: {
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  commentContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  commentImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#f1f3f4',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  imageButton: {
    padding: 8,
  },
  submitButton: {
    padding: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  imagePreviewContainer: {
    padding: 16,
    backgroundColor: '#f1f3f4',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 24,
    right: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 16,
  },
  guestModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 400,
  },
  guestModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  guestNameInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  guestModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  guestModalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  guestModalButtonCancel: {
    backgroundColor: '#ddd',
  },
  guestModalButtonSubmit: {
    backgroundColor: '#007AFF',
  },
  guestModalButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
}); 