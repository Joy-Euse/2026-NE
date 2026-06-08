import AsyncStorage from '@react-native-async-storage/async-storage';

export type SearchHistoryStatus = 'success' | 'not_found' | 'error';

export type SearchHistoryItem = {
  id: string;
  word: string;
  status: SearchHistoryStatus;
  searchedAt: string;
};

const historyKeyForUser = (userId: string) => `history_${userId}`;

function createHistoryId(word: string) {
  return `${word}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeHistoryItem(item: unknown): SearchHistoryItem | null {
  if (typeof item === 'string') {
    const word = item.trim().toLowerCase();
    if (!word) {
      return null;
    }

    return {
      id: createHistoryId(word),
      word,
      status: 'success',
      searchedAt: new Date().toISOString(),
    };
  }

  if (!item || typeof item !== 'object') {
    return null;
  }

  const candidate = item as Partial<SearchHistoryItem>;
  if (!candidate.word || typeof candidate.word !== 'string') {
    return null;
  }

  return {
    id: candidate.id || createHistoryId(candidate.word),
    word: candidate.word.trim().toLowerCase(),
    status:
      candidate.status === 'not_found' || candidate.status === 'error'
        ? candidate.status
        : 'success',
    searchedAt: candidate.searchedAt || new Date().toISOString(),
  };
}

export async function getSearchHistory(userId: string): Promise<SearchHistoryItem[]> {
  try {
    const storedHistory = await AsyncStorage.getItem(historyKeyForUser(userId));
    const parsedHistory = storedHistory ? JSON.parse(storedHistory) : [];
    return Array.isArray(parsedHistory)
      ? parsedHistory.map(normalizeHistoryItem).filter((item): item is SearchHistoryItem => !!item)
      : [];
  } catch {
    return [];
  }
}

export async function saveSearchAttempt(
  userId: string,
  word: string,
  status: SearchHistoryStatus,
): Promise<SearchHistoryItem[]> {
  const cleanedWord = word.trim().toLowerCase();
  if (!cleanedWord) {
    return getSearchHistory(userId);
  }

  const currentHistory = await getSearchHistory(userId);
  const newItem: SearchHistoryItem = {
    id: createHistoryId(cleanedWord),
    word: cleanedWord,
    status,
    searchedAt: new Date().toISOString(),
  };
  const [, ...restHistory] = currentHistory;
  const nextHistory =
    currentHistory[0]?.word.toLowerCase() === cleanedWord
      ? [newItem, ...restHistory]
      : [newItem, ...currentHistory];

  await AsyncStorage.setItem(historyKeyForUser(userId), JSON.stringify(nextHistory));
  return nextHistory;
}

export async function clearSearchHistory(userId: string): Promise<void> {
  await AsyncStorage.removeItem(historyKeyForUser(userId));
}
