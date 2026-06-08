import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AppColors } from '@/constants/appColors';

export function LoadingIndicator() {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={AppColors.primary} size="large" />
      <Text style={styles.text}>Opening the meaning...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: AppColors.card,
    padding: 24,
    gap: 12,
  },
  text: {
    color: AppColors.textSecondary,
    fontSize: 15,
  },
});
