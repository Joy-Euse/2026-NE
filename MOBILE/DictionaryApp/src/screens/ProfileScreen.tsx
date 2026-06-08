import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppColors } from '@/constants/appColors';
import { useAuth } from '@/context/AuthContext';

export function ProfileScreen() {
  const { currentUser } = useAuth();

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.card}>
          <Ionicons color={AppColors.primary} name="person-circle-outline" size={58} />
          <Text style={styles.username}>{currentUser?.fullName || 'Unknown user'}</Text>
          <Text style={styles.handle}>@{currentUser?.username || 'unknown'}</Text>
          <Text style={styles.userId}>ID: {currentUser?.id || 'Not available'}</Text>
          <Text style={styles.note}>
            This is your LexiTech space. Your searches stay separate, so your word list follows only you.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  content: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 760,
    padding: 20,
  },
  card: {
    alignItems: 'center',
    backgroundColor: AppColors.card,
    borderRadius: 8,
    gap: 10,
    padding: 28,
  },
  username: {
    color: AppColors.text,
    fontSize: 28,
    fontWeight: '900',
  },
  handle: {
    color: AppColors.primary,
    fontSize: 16,
    fontWeight: '800',
  },
  userId: {
    color: AppColors.textSecondary,
    fontSize: 13,
  },
  note: {
    color: AppColors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 460,
    textAlign: 'center',
  },
});
