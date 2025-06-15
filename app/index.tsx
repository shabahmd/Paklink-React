import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PostCard } from '../components/feed/PostCard';
import { StatusUpdate } from '../components/feed/StatusUpdate';
import { useAuth } from '../contexts/AuthContext';
import { usePosts } from '../hooks/usePosts';

const DEFAULT_AVATAR_URL = 'https://via.placeholder.com/50';

// --- Mock Data for UI ---
const userAvatars = [
  'https://randomuser.me/api/portraits/women/68.jpg',
  'https://randomuser.me/api/portraits/men/75.jpg',
  'https://randomuser.me/api/portraits/women/79.jpg',
  'https://randomuser.me/api/portraits/men/53.jpg',
  'https://randomuser.me/api/portraits/women/44.jpg',
  'https://randomuser.me/api/portraits/men/32.jpg',
];

const stories = [
  { id: '1', user: 'Sam Wilson', image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070' },
  { id: '2', user: 'Jane Doe', image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071' },
  { id: '3', user: 'John Smith', image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070' },
  { id: '4', user: 'Sarah Lee', image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2070' },
];
// --- End Mock Data ---


// Header component for Action Buttons (Live, Photo, Room)
const ActionButtons = () => (
  <View style={styles.actionButtonsContainer}>
    <TouchableOpacity style={styles.actionButton}>
      <Ionicons name="videocam" size={24} color="#F44336" />
      <Text style={styles.actionButtonText}>Live</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.actionButton}>
      <Ionicons name="images" size={24} color="#4CAF50" />
      <Text style={styles.actionButtonText}>Photo</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.actionButton}>
      <Ionicons name="videocam-outline" size={24} color="#9C27B0" />
      <Text style={styles.actionButtonText}>Room</Text>
    </TouchableOpacity>
  </View>
);

// Header component for the "Rooms" section
const Rooms = () => (
  <View style={styles.roomsContainer}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <TouchableOpacity style={styles.createRoomButton}>
        <Ionicons name="add-circle" size={28} color="#E8F3FF" style={{ backgroundColor: '#007AFF', borderRadius: 14 }} />
        <Text style={styles.createRoomText}>Create Room</Text>
      </TouchableOpacity>
      {userAvatars.map((uri, index) => (
        <Image key={index} source={{ uri }} style={styles.roomAvatar} />
      ))}
    </ScrollView>
  </View>
);

// Header component for the "Stories" section
const Stories = () => (
    <View style={styles.storiesContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {stories.map((story) => (
          <TouchableOpacity key={story.id} style={styles.storyCard}>
            <Image source={{ uri: story.image }} style={styles.storyImage} />
            <Text style={styles.storyUser}>{story.user}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
);


// The main Home Screen component
export default function FacebookFeedScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const {
    posts,
    isLoading,
    isError,
    refetch,
    isRefetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = usePosts();

  // Skip login option - set a flag in AsyncStorage to bypass login
  useEffect(() => {
    const setSkipLogin = async () => {
      if (!isAuthenticated) {
        await AsyncStorage.setItem('skipLogin', 'true');
        router.replace('/(tabs)');
      }
    };
    setSkipLogin();
  }, [isAuthenticated, router]);

  const renderListHeader = () => (
    <>
      <StatusUpdate userAvatar={user?.email ? `https://ui-avatars.com/api/?name=${user.email.charAt(0)}` : DEFAULT_AVATAR_URL} />
      <View style={styles.divider} />
      <ActionButtons />
      <View style={styles.dividerThick} />
      <Rooms />
      <View style={styles.dividerThick} />
      <Stories />
      <View style={styles.dividerThick} />
    </>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={({ item }) => <PostCard post={item} />}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderListHeader}
        ListFooterComponent={() =>
          isFetchingNextPage ? <ActivityIndicator style={{ margin: 20 }} /> : null
        }
        onRefresh={refetch}
        refreshing={isRefetching}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5', // Facebook's grey background
  },
  // Status Update Section
  statusUpdateContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  textInput: {
      flex: 1,
      height: 40,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: '#CED0D4',
      justifyContent: 'center',
      paddingLeft: 16,
  },
  textInputPlaceholder: {
      color: '#65676B',
  },
  divider: {
    height: 1,
    backgroundColor: '#CED0D4',
  },
  dividerThick: {
    height: 8,
    backgroundColor: '#CED0D4',
  },
  // Action Buttons Section
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonText: {
    marginLeft: 8,
    fontWeight: '600',
    color: '#65676B',
  },
  // Rooms Section
  roomsContainer: {
    padding: 12,
    backgroundColor: '#fff',
  },
  createRoomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8F3FF',
    marginRight: 12,
  },
  createRoomText: {
    marginLeft: 8,
    color: '#007AFF',
    fontWeight: '600',
  },
  roomAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 6,
  },
  // Stories Section
  storiesContainer: {
    paddingVertical: 12,
    paddingLeft: 12,
    backgroundColor: '#fff',
  },
  storyCard: {
    width: 110,
    height: 180,
    borderRadius: 12,
    marginRight: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  storyImage: {
    width: '100%',
    height: '100%',
  },
  storyUser: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    color: '#fff',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
});
