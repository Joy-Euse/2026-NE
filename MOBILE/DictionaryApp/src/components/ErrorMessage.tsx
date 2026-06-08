import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppColors } from '@/constants/appColors';

type ErrorMessageProps = {
  message: string;
  onRetry?: () => void;
};

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>We could not find that yet</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <Pressable accessibilityRole="button" onPress={onRetry} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AppColors.dangerBorder,
    backgroundColor: AppColors.dangerSoft,
    padding: 18,
    gap: 8,
  },
  title: {
    color: AppColors.danger,
    fontSize: 16,
    fontWeight: '800',
  },
  message: {
    color: AppColors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  retryButton: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    backgroundColor: AppColors.danger,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  retryText: {
    color: AppColors.onPrimary,
    fontWeight: '800',
  },
});
