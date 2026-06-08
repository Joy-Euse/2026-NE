import AsyncStorage from '@react-native-async-storage/async-storage';

const historyKeyForUser = (userId: string) => `history_${userId}`;

export async function getSearchHistory(userId: string): Promise<string[]> {
  try {
    const storedHistory = await AsyncStorage.getItem(historyKeyForUser(userId));
    const parsedHistory = storedHistory ? JSON.parse(storedHistory) : [];
    return Array.isArray(parsedHistory) ? parsedHistory.filter(Boolean) : [];
  } catch {
    return [];
  }
}

export async function saveSearchWord(userId: string, word: string): Promise<string[]> {
  const cleanedWord = word.trim().toLowerCase();
  if (!cleanedWord) {
    return getSearchHistory(userId);
  }

  const currentHistory = await getSearchHistory(userId);
  const dedupedHistory = currentHistory.filter((item) => item !== cleanedWord);
  const nextHistory = [cleanedWord, ...dedupedHistory];

  await AsyncStorage.setItem(historyKeyForUser(userId), JSON.stringify(nextHistory));
  return nextHistory;
}

export async function clearSearchHistory(userId: string): Promise<void> {
  await AsyncStorage.removeItem(historyKeyForUser(userId));
}
