import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export function LoadingIndicator() {
  return (
    <View style={styles.container}>
      <ActivityIndicator color="#2457d6" size="large" />
      <Text style={styles.text}>Looking up the word...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    padding: 24,
    gap: 12,
  },
  text: {
    color: '#4f5f76',
    fontSize: 15,
  },
});
