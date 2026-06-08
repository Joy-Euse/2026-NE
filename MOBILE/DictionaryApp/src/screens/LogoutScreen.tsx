import { router } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';

import { useAuth } from '@/context/AuthContext';

export function LogoutScreen() {
  const { logout } = useAuth();

  useEffect(() => {
    logout().finally(() => {
      router.replace('/login' as never);
    });
  }, [logout]);

  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      <Text className="text-base font-extrabold text-secondary">Signing you out of LexiTech...</Text>
    </View>
  );
}
