import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/context/AuthContext';
import { clearSearchHistory, getSearchHistory } from '@/storage/historyStorage';

export function HistoryScreen() {
  const { currentUser } = useAuth();
  const [history, setHistory] = useState<string[]>([]);

  const loadHistory = useCallback(() => {
    if (!currentUser) {
      setHistory([]);
      return;
    }

    getSearchHistory(currentUser.id).then(setHistory);
  }, [currentUser]);

  useFocusEffect(loadHistory);

  const handleSelectWord = (word: string) => {
    router.replace({ pathname: '/', params: { word } } as never);
  };

  const handleClearHistory = async () => {
    if (!currentUser) {
      return;
    }

    await clearSearchHistory(currentUser.id);
    setHistory([]);
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Full search history</Text>
          <Text style={styles.title}>Your saved lookups</Text>
          <Text style={styles.subtitle}>Newest searches appear first and duplicates are removed.</Text>
        </View>

        {history.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons color="#2457d6" name="time-outline" size={30} />
            <Text style={styles.emptyTitle}>No history yet</Text>
            <Text style={styles.emptyText}>
              Search for a word on the Home/Search screen and it will appear here.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            <Pressable
              accessibilityRole="button"
              onPress={handleClearHistory}
              style={({ pressed }) => [styles.clearButton, pressed && styles.pressed]}>
              <Ionicons color="#9f1d12" name="trash-outline" size={18} />
              <Text style={styles.clearText}>Clear history</Text>
            </Pressable>

            {history.map((word) => (
              <Pressable
                accessibilityRole="button"
                key={word}
                onPress={() => handleSelectWord(word)}
                style={({ pressed }) => [styles.historyItem, pressed && styles.pressed]}>
                <Ionicons color="#2457d6" name="book-outline" size={20} />
                <Text style={styles.historyWord}>{word}</Text>
                <Ionicons color="#8b95a7" name="chevron-forward" size={18} />
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
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
    gap: 18,
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
    fontSize: 30,
    fontWeight: '900',
  },
  subtitle: {
    color: '#526173',
    fontSize: 16,
    lineHeight: 24,
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    gap: 10,
    padding: 28,
  },
  emptyTitle: {
    color: '#121826',
    fontSize: 20,
    fontWeight: '900',
  },
  emptyText: {
    color: '#526173',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  list: {
    gap: 10,
  },
  clearButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffc7c2',
    backgroundColor: '#fff4f2',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  clearText: {
    color: '#9f1d12',
    fontWeight: '900',
  },
  historyItem: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
  },
  historyWord: {
    flex: 1,
    color: '#121826',
    fontSize: 17,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  pressed: {
    opacity: 0.75,
  },
});
