import React, { useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import EditProfileModal from '../../components/profile/EditProfileModal';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase/supabase';
import { UserProfile } from '../../types/user.types';
import { mapSupabaseProfileToUserProfile } from '../../utils/mapUserProfile';

const TABS = ['Posts', 'Photos', 'Videos'] as const;
type TabKey = typeof TABS[number];

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('Posts');
  const [loading, setLoading] = useState(false);

  // Fetch profile from Supabase
  const fetchProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      setProfile(mapSupabaseProfileToUserProfile(data));
    } catch (err) {
      setProfile(null);
      Alert.alert('Failed to load profile', (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      Alert.alert('Error signing out', (error as Error).message);
    }
  };

  const handleSaveProfile = async (updated: UserProfile) => {
    setEditing(false);
    setLoading(true);
    try {
      // Map UserProfile to Supabase profile shape
      const updates = {
        id: updated.id,
        full_name: updated.name,
        username: updated.username,
        avatar_url: updated.avatarUrl,
        cover_photo_url: updated.coverPhotoUrl,
        bio: updated.bio,
        location: updated.location,
        website: updated.website,
      };
      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;
      await fetchProfile();
    } catch (err) {
      Alert.alert('Failed to update profile', (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.name}>Not logged in</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Cover Photo Section */}
      <View style={styles.coverPhotoWrapper}>
        {profile.coverPhotoUrl ? (
          <Image source={{ uri: profile.coverPhotoUrl }} style={styles.coverPhoto} />
        ) : (
          <View style={styles.coverPhotoPlaceholder} />
        )}
        <TouchableOpacity style={styles.coverPhotoButton}>
          <Text style={styles.coverPhotoButtonText}>Add a cover photo</Text>
        </TouchableOpacity>
      </View>
      {/* Profile Image + Edit Icon */}
      <View style={styles.profileImageWrapper}>
        <Image source={{ uri: profile.avatarUrl }} style={styles.profileImage} />
        <TouchableOpacity style={styles.profileImageEditIcon}>
          <Text style={styles.profileImageEditText}>✎</Text>
        </TouchableOpacity>
      </View>
      {/* Name & Friends Count */}
      <View style={styles.headerInfo}>
        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.friendsCount}>3 friends</Text>
      </View>
      {/* Action Buttons Row */}
      <View style={styles.actionButtonsRow}>
        <TouchableOpacity style={styles.storyButton}>
          <Text style={styles.storyButtonText}>+ Add to story</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.editProfileButton} onPress={() => setEditing(true)}>
          <Text style={styles.editProfileButtonText}>Edit profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.moreButton}>
          <Text style={styles.moreButtonText}>...</Text>
        </TouchableOpacity>
      </View>
      {/* Tabs */}
      <View style={styles.tabsRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* Details Section */}
      <View style={styles.detailsSection}>
        <Text style={styles.detailsText}>See your About info</Text>
        <TouchableOpacity>
          <Text style={styles.editDetailsText}>Edit public details</Text>
        </TouchableOpacity>
      </View>
      {/* Friends Preview Row */}
      <View style={styles.friendsSection}>
        <View style={styles.friendsHeaderRow}>
          <Text style={styles.friendsHeader}>Friends</Text>
          <TouchableOpacity>
            <Text style={styles.findFriendsText}>Find friends</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.friendsRow}>
          {/* Example friends, replace with real data if available */}
          <View style={styles.friendItem}>
            <Image source={{ uri: 'https://i.imgur.com/4YQxjzU.jpg' }} style={styles.friendImage} />
            <Text style={styles.friendName}>Niggendar Kvmar Chvdani Dalit-Randi</Text>
          </View>
          <View style={styles.friendItem}>
            <Image source={{ uri: 'https://i.imgur.com/3GvwNBf.jpg' }} style={styles.friendImage} />
            <Text style={styles.friendName}>Agha Shahzaman</Text>
          </View>
          <View style={styles.friendItem}>
            <Image source={{ uri: 'https://i.imgur.com/2nCt3Sbl.jpg' }} style={styles.friendImage} />
            <Text style={styles.friendName}>Mani Alt</Text>
          </View>
        </View>
      </View>
      {/* Tab Content */}
      <View style={styles.tabContent}>
        {activeTab === 'Posts' && (
          <Text style={styles.tabPlaceholder}>Posts content coming soon...</Text>
        )}
        {activeTab === 'Photos' && (
          <Text style={styles.tabPlaceholder}>Photos content coming soon...</Text>
        )}
        {activeTab === 'Videos' && (
          <Text style={styles.tabPlaceholder}>Videos content coming soon...</Text>
        )}
      </View>
      <EditProfileModal
        visible={editing}
        user={profile}
        onSave={handleSaveProfile}
        onClose={() => setEditing(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  coverPhotoWrapper: {
    height: 180,
    backgroundColor: '#f0f2f5',
    position: 'relative',
  },
  coverPhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverPhotoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e9ebee',
  },
  coverPhotoButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 6,
    borderRadius: 4,
  },
  coverPhotoButtonText: {
    color: 'white',
    fontSize: 12,
  },
  profileImageWrapper: {
    position: 'absolute',
    top: 130,
    left: 20,
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'white',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  profileImageEditIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1877f2',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageEditText: {
    color: 'white',
    fontSize: 14,
  },
  headerInfo: {
    marginTop: 60,
    alignItems: 'flex-start',
    paddingHorizontal: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  friendsCount: {
    color: '#65676b',
    fontSize: 14,
    marginBottom: 12,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  storyButton: {
    flex: 2,
    backgroundColor: '#1877f2',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  storyButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  editProfileButton: {
    flex: 3,
    backgroundColor: '#e4e6eb',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  editProfileButtonText: {
    color: '#050505',
    fontWeight: 'bold',
  },
  moreButton: {
    flex: 0.5,
    backgroundColor: '#e4e6eb',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  moreButtonText: {
    color: '#050505',
    fontWeight: 'bold',
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#2196F3',
  },
  tabText: {
    color: '#888',
    fontWeight: 'bold',
    fontSize: 16,
  },
  tabTextActive: {
    color: '#2196F3',
  },
  detailsSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  detailsText: {
    fontSize: 16,
    marginBottom: 8,
  },
  editDetailsText: {
    color: '#1877f2',
    fontSize: 14,
  },
  friendsSection: {
    padding: 20,
  },
  friendsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  friendsHeader: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  findFriendsText: {
    color: '#1877f2',
    fontSize: 14,
  },
  friendsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  friendItem: {
    width: 100,
  },
  friendImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    backgroundColor: '#e4e6eb',
  },
  friendName: {
    marginTop: 4,
    fontSize: 12,
    color: '#050505',
    textAlign: 'center',
  },
  tabContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  tabPlaceholder: {
    color: '#aaa',
    fontSize: 18,
    textAlign: 'center',
  },
});