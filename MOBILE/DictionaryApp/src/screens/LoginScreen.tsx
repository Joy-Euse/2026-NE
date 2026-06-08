import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>LexiTech Dictionary</Text>
          <Text style={styles.title}>Your words are waiting.</Text>
          <Text style={styles.subtitle}>
            Log in with your class account and pick up your vocabulary journey right where you left it.
          </Text>
        </View>

        <View style={styles.card}>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setUsername}
            placeholder="Username"
            placeholderTextColor={AppColors.textSecondary}
            style={styles.input}
            value={username}
          />
          <TextInput
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={AppColors.textSecondary}
            secureTextEntry
            style={styles.input}
            value={password}
          />
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <Pressable
            accessibilityRole="button"
            disabled={isSubmitting}
            onPress={handleLogin}
            style={({ pressed }) => [styles.button, (pressed || isSubmitting) && styles.buttonMuted]}>
            <Text style={styles.buttonText}>{isSubmitting ? 'Logging in...' : 'Login'}</Text>
          </Pressable>
        </View>

        <Text style={styles.footerText}>
          Local demo access only. Use your assigned LexiTech account to continue.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 18,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 520,
  },
  header: {
    gap: 8,
  },
  eyebrow: {
    color: AppColors.primary,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  title: {
    color: AppColors.text,
    fontSize: 34,
    fontWeight: '900',
  },
  subtitle: {
    color: AppColors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
  },
  card: {
    backgroundColor: AppColors.card,
    borderRadius: 8,
    padding: 18,
    gap: 12,
  },
  input: {
    minHeight: 52,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AppColors.border,
    paddingHorizontal: 16,
    color: AppColors.text,
    fontSize: 16,
  },
  message: {
    color: AppColors.danger,
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    minHeight: 52,
    borderRadius: 8,
    backgroundColor: AppColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonMuted: {
    opacity: 0.72,
  },
  buttonText: {
    color: AppColors.onPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  footerText: {
    color: AppColors.textSecondary,
    textAlign: 'center',
    fontSize: 15,
  },
});
