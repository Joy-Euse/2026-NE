import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppColors } from '@/constants/appColors';
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
          <Text style={styles.eyebrow}>Word trail</Text>
          <Text style={styles.title}>Everything you have explored</Text>
          <Text style={styles.subtitle}>Your newest searches stay at the top, ready for quick review.</Text>
        </View>

        {history.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons color={AppColors.primary} name="time-outline" size={30} />
            <Text style={styles.emptyTitle}>Your word trail is empty</Text>
            <Text style={styles.emptyText}>
              Search a word from Home and LexiTech will keep it here for your next study session.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            <Pressable
              accessibilityRole="button"
              onPress={handleClearHistory}
              style={({ pressed }) => [styles.clearButton, pressed && styles.pressed]}>
              <Ionicons color={AppColors.danger} name="trash-outline" size={18} />
              <Text style={styles.clearText}>Clear history</Text>
            </Pressable>

            {history.map((word) => (
              <Pressable
                accessibilityRole="button"
                key={word}
                onPress={() => handleSelectWord(word)}
                style={({ pressed }) => [styles.historyItem, pressed && styles.pressed]}>
                <Ionicons color={AppColors.primary} name="book-outline" size={20} />
                <Text style={styles.historyWord}>{word}</Text>
                <Ionicons color={AppColors.textSecondary} name="chevron-forward" size={18} />
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
    backgroundColor: AppColors.background,
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
    color: AppColors.primary,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  title: {
    color: AppColors.text,
    fontSize: 30,
    fontWeight: '900',
  },
  subtitle: {
    color: AppColors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: AppColors.card,
    borderRadius: 8,
    gap: 10,
    padding: 28,
  },
  emptyTitle: {
    color: AppColors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  emptyText: {
    color: AppColors.textSecondary,
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
    borderColor: AppColors.dangerBorder,
    backgroundColor: AppColors.dangerSoft,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  clearText: {
    color: AppColors.danger,
    fontWeight: '900',
  },
  historyItem: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 8,
    backgroundColor: AppColors.card,
    paddingHorizontal: 16,
  },
  historyWord: {
    flex: 1,
    color: AppColors.text,
    fontSize: 17,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  pressed: {
    opacity: 0.75,
  },
});
