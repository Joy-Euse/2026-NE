import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppColors } from '@/constants/appColors';
import { useAuth } from '@/context/AuthContext';

export function ProfileScreen() {
  const { currentUser } = useAuth();

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-background">
      <View className="w-full max-w-3xl self-center px-5 py-5">
        <View className="items-center gap-2.5 rounded-lg bg-card p-7 shadow-sm">
          <Ionicons color={AppColors.primary} name="person-circle-outline" size={58} />
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
