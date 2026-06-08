import { ActivityIndicator, Text, View } from 'react-native';

import { AppColors } from '@/constants/appColors';

export function LoadingIndicator() {
  return (
    <View className="items-center gap-3 rounded-lg bg-card p-6 shadow-sm">
      <ActivityIndicator color={AppColors.primary} size="large" />
      <Text className="text-base text-secondary">Opening the meaning...</Text>
    </View>
  );
}
