import React from 'react';
import { FlatList, Image, Text, View } from 'react-native';
import { storyImages, userAvatars } from '../../src/utils/assets';

interface Story {
  id: string;
  user: string;
  avatarUri: any;
  storyImage: any;
}

const STORIES: Story[] = [
  { id: '1', user: 'You', avatarUri: userAvatars.user1, storyImage: storyImages.story1 },
  { id: '2', user: 'Alice', avatarUri: userAvatars.user2, storyImage: storyImages.story2 },
  { id: '3', user: 'Bob', avatarUri: userAvatars.user3, storyImage: storyImages.story3 },
  { id: '4', user: 'Carol', avatarUri: userAvatars.user4, storyImage: storyImages.story4 },
  { id: '5', user: 'Dave', avatarUri: userAvatars.user5, storyImage: storyImages.story1 },
];

export function StoryBar() {
  return (
    <View className="py-2 bg-white dark:bg-neutral-900 border-b border-gray-100 dark:border-neutral-800">
      <FlatList
        data={STORIES}
        horizontal
        keyExtractor={item => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12 }}
        renderItem={({ item }) => (
          <View className="items-center mr-4">
            <Image
              source={item.avatarUri}
              className="w-14 h-14 rounded-full border-2 border-blue-500 bg-gray-200"
              resizeMode="cover"
            />
            <Text className="mt-1 text-xs text-gray-700 dark:text-gray-200" numberOfLines={1}>{item.user}</Text>
          </View>
        )}
      />
    </View>
  );
} 