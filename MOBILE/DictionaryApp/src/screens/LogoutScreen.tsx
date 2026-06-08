import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppColors } from '@/constants/appColors';
import { useAuth } from '@/context/AuthContext';

export function LogoutScreen() {
  const { logout } = useAuth();

  useEffect(() => {
    logout().finally(() => {
      router.replace('/login' as never);
    });
  }, [logout]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Signing you out of LexiTech...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.background,
  },
  text: {
    color: AppColors.textSecondary,
    fontSize: 16,
    fontWeight: '800',
  },
});
