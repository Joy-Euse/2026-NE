import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppColors } from '@/constants/appColors';

type HistoryListProps = {
  history: string[];
  onOpenHistory: () => void;
  onSelectWord: (word: string) => void;
};

export function HistoryList({ history, onOpenHistory, onSelectWord }: HistoryListProps) {
  if (history.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Words you recently explored</Text>
        <Pressable
          accessibilityLabel="Open full search history"
          accessibilityRole="button"
          onPress={onOpenHistory}
          style={({ pressed }) => [styles.iconButton, pressed && styles.itemPressed]}>
          <Ionicons color={AppColors.primary} name="time-outline" size={20} />
        </Pressable>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.items}>
        {history.map((word) => (
          <Pressable
            accessibilityRole="button"
            key={word}
            onPress={() => onSelectWord(word)}
            style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}>
            <Text style={styles.itemText}>{word}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    color: AppColors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  iconButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: AppColors.primarySoft,
  },
  items: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 8,
  },
  item: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AppColors.border,
    backgroundColor: AppColors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  itemPressed: {
    backgroundColor: AppColors.primarySoft,
  },
  itemText: {
    color: AppColors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});
