import 'react-native-gesture-handler';

import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { AuthProvider, useAuth } from '@/context/AuthContext';

function RootNavigator() {
  const { currentUser, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return <LoadingIndicator />;
  }

  if (currentUser) {
    return (
      <Stack key="app" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(app)" />
      </Stack>
    );
  }

  return (
    <Stack key="auth" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <AnimatedSplashOverlay />
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}
