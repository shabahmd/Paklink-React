import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface StatusUpdateProps {
  userAvatar?: string | null;
}

export function StatusUpdate({ userAvatar }: StatusUpdateProps) {
  const router = useRouter();
  
  return (
    <View style={styles.statusUpdateContainer}>
      <Image 
        source={{ uri: userAvatar || 'https://via.placeholder.com/50' }} 
        style={styles.avatar} 
      />
      <TouchableOpacity 
        style={styles.textInput} 
        onPress={() => router.push('/create-post')}
        accessibilityLabel="Create a post"
        accessibilityRole="button"
      >
        <Text style={styles.textInputPlaceholder}>What's on your mind?</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
}); 