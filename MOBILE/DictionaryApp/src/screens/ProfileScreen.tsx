import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/context/AuthContext';

export function ProfileScreen() {
  const { currentUser } = useAuth();

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.card}>
          <Ionicons color="#2457d6" name="person-circle-outline" size={58} />
          <Text style={styles.username}>{currentUser?.fullName || 'Unknown user'}</Text>
          <Text style={styles.handle}>@{currentUser?.username || 'unknown'}</Text>
          <Text style={styles.userId}>ID: {currentUser?.id || 'Not available'}</Text>
          <Text style={styles.note}>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f7fb',
  },
  content: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 760,
    padding: 20,
  },
  card: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    gap: 10,
    padding: 28,
  },
  username: {
    color: '#121826',
    fontSize: 28,
    fontWeight: '900',
  },
  handle: {
    color: '#2457d6',
    fontSize: 16,
    fontWeight: '800',
  },
  userId: {
    color: '#526173',
    fontSize: 13,
  },
  note: {
    color: '#526173',
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 460,
    textAlign: 'center',
  },
});
