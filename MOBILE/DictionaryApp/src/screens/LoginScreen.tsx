import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Log in to access your personal search history.</Text>
        </View>

        <View style={styles.card}>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setUsername}
            placeholder="Username"
            placeholderTextColor="#8b95a7"
            style={styles.input}
            value={username}
          />
          <TextInput
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="#8b95a7"
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
          Local demo access only. Use one of the authorized school project accounts.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f7fb',
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
    color: '#2457d6',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  title: {
    color: '#121826',
    fontSize: 34,
    fontWeight: '900',
  },
  subtitle: {
    color: '#526173',
    fontSize: 16,
    lineHeight: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 18,
    gap: 12,
  },
  input: {
    minHeight: 52,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d7dde8',
    paddingHorizontal: 16,
    color: '#121826',
    fontSize: 16,
  },
  message: {
    color: '#9f1d12',
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    minHeight: 52,
    borderRadius: 8,
    backgroundColor: '#2457d6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonMuted: {
    opacity: 0.72,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  footerText: {
    color: '#526173',
    textAlign: 'center',
    fontSize: 15,
  },
});
