import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppColors } from '@/constants/appColors';
import { useAuth } from '@/context/AuthContext';

export function LoginScreen() {
  const { currentUser, login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser) {
      router.replace('/(app)' as never);
    }
  }, [currentUser]);

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      setMessage('Please enter both username and password.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');
    try {
      await login(username, password);
      router.replace('/(app)' as never);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="w-full max-w-xl flex-1 justify-center gap-5 self-center px-6 py-8">
        <View className="gap-2">
          <Text className="text-[13px] font-black uppercase tracking-normal text-primary">
            LexiTech Dictionary
          </Text>
          <Text className="text-[34px] font-black text-text">Your words are waiting.</Text>
          <Text className="text-base leading-6 text-secondary">
            Log in with your account and pick up your vocabulary journey right where you left
            it.
          </Text>
        </View>

        <View className="gap-3 rounded-lg bg-card p-5 shadow-sm">
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            className="min-h-[52px] rounded-lg border border-gray-200 px-4 text-base text-text"
            onChangeText={setUsername}
            placeholder="Username"
            placeholderTextColor={AppColors.textSecondary}
            value={username}
          />
          <TextInput
            className="min-h-[52px] rounded-lg border border-gray-200 px-4 text-base text-text"
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={AppColors.textSecondary}
            secureTextEntry
            value={password}
          />
          {message ? <Text className="text-sm leading-5 text-red-700">{message}</Text> : null}
          <Pressable
            accessibilityRole="button"
            className={`min-h-[52px] items-center justify-center rounded-lg bg-primary ${
              isSubmitting ? 'opacity-70' : 'active:opacity-75'
            }`}
            disabled={isSubmitting}
            onPress={handleLogin}>
            <Text className="text-base font-extrabold text-white">
              {isSubmitting ? 'Logging in...' : 'Login'}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
