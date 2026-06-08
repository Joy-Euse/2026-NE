import { Pressable, StyleSheet, Text, View } from 'react-native';

type ErrorMessageProps = {
  message: string;
  onRetry?: () => void;
};

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Something went wrong</Text>
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
    borderColor: '#ffc7c2',
    backgroundColor: '#fff4f2',
    padding: 18,
    gap: 8,
  },
  title: {
    color: '#9f1d12',
    fontSize: 16,
    fontWeight: '800',
  },
  message: {
    color: '#5f2b26',
    fontSize: 15,
    lineHeight: 22,
  },
  retryButton: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    backgroundColor: '#9f1d12',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  retryText: {
    color: '#ffffff',
    fontWeight: '800',
  },
});
