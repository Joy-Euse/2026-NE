import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = '@dictionaryapp:search-history';
const MAX_HISTORY_ITEMS = 8;

export async function getSearchHistory(): Promise<string[]> {
  try {
    const storedHistory = await AsyncStorage.getItem(HISTORY_KEY);
    const parsedHistory = storedHistory ? JSON.parse(storedHistory) : [];
    return Array.isArray(parsedHistory) ? parsedHistory.filter(Boolean) : [];
  } catch {
    return [];
  }
}

export async function saveSearchWord(word: string): Promise<string[]> {
  const cleanedWord = word.trim().toLowerCase();
  if (!cleanedWord) {
    return getSearchHistory();
  }

  const currentHistory = await getSearchHistory();
  const dedupedHistory = currentHistory.filter((item) => item !== cleanedWord);
  const nextHistory = [cleanedWord, ...dedupedHistory].slice(0, MAX_HISTORY_ITEMS);

  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
  return nextHistory;
}
