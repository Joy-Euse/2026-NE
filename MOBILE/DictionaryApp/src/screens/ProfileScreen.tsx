import { Image, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/context/AuthContext';

const profileImage = require('../../assets/images/profile.jpg');

export function ProfileScreen() {
  const { currentUser } = useAuth();

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-background">
      <View className="w-full max-w-3xl self-center px-5 py-5">
        <View className="items-center gap-2.5 rounded-lg bg-card p-7 shadow-sm">
          <View className="h-24 w-24 items-center justify-center rounded-full border-4 border-primary bg-background shadow-sm">
            <Image
              accessibilityLabel="Profile picture"
              resizeMode="cover"
              source={profileImage}
              style={{ borderRadius: 48, height: 96, width: 96 }}
            />
          </View>
          <Text className="text-center text-3xl font-black text-text">
            {currentUser?.fullName || 'Unknown user'}
          </Text>
          <Text className="text-base font-extrabold text-primary">
            @{currentUser?.username || 'unknown'}
          </Text>
          <Text className="text-[13px] text-secondary">ID: {currentUser?.id || 'Not available'}</Text>
          <Text className="max-w-lg text-center text-[15px] leading-6 text-secondary">
            This is your LexiTech space. Your searches stay separate, so your word list follows
            only you.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
