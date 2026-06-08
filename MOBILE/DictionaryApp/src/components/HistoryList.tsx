import { Pressable, StyleSheet, Text, View } from 'react-native';

type HistoryListProps = {
  history: string[];
  onSelectWord: (word: string) => void;
};

export function HistoryList({ history, onSelectWord }: HistoryListProps) {
  if (history.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent searches</Text>
      <View style={styles.items}>
        {history.map((word) => (
          <Pressable
            accessibilityRole="button"
            key={word}
            onPress={() => onSelectWord(word)}
            style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}>
            <Text style={styles.itemText}>{word}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  title: {
    color: '#4f5f76',
    fontSize: 14,
    fontWeight: '700',
  },
  items: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  item: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d7dde8',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  itemPressed: {
    backgroundColor: '#eef4ff',
  },
  itemText: {
    color: '#2457d6',
    fontSize: 14,
    fontWeight: '700',
  },
});
