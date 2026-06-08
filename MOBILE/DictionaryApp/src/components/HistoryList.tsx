import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { AppColors } from '@/constants/appColors';
import { SearchHistoryItem } from '@/storage/historyStorage';

type HistoryListProps = {
  history: SearchHistoryItem[];
  onOpenHistory: () => void;
  onSelectWord: (word: string) => void;
};

export function HistoryList({ history, onOpenHistory, onSelectWord }: HistoryListProps) {
  if (history.length === 0) {
    return null;
  }

  return (
    <View className="gap-2.5">
      <View className="flex-row items-center justify-between gap-3">
        <Text className="text-sm font-bold text-secondary">Words you recently explored</Text>
        <Pressable
          accessibilityLabel="Open full search history"
          accessibilityRole="button"
          className="h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 active:opacity-75"
          onPress={onOpenHistory}>
          <Ionicons color={AppColors.primary} name="time-outline" size={20} />
        </Pressable>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="flex-row gap-2 pr-2">
        {history.map((item) => (
          <Pressable
            accessibilityRole="button"
            className="rounded-lg border border-gray-200 bg-card px-3 py-2 active:bg-indigo-50"
            key={item.id}
            onPress={() => onSelectWord(item.word)}>
            <Text className="text-sm font-bold text-primary">{item.word}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
