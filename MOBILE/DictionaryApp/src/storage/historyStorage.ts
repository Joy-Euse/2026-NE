import AsyncStorage from '@react-native-async-storage/async-storage';

import { validateWord } from '@/utils/wordValidation';

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

function normalizeHistoryWord(word: string) {
  return word.trim().toLowerCase();
}

function normalizeHistoryItem(item: unknown): SearchHistoryItem | null {
  if (typeof item === 'string') {
    const word = normalizeHistoryWord(item);
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
    word: normalizeHistoryWord(candidate.word),
    status:
      candidate.status === 'not_found' || candidate.status === 'error'
        ? candidate.status
        : 'success',
    searchedAt: candidate.searchedAt || new Date().toISOString(),
  };
}

function dedupeHistoryItems(history: SearchHistoryItem[]): SearchHistoryItem[] {
  const seenWords = new Set<string>();

  return history.filter((item) => {
    const normalizedWord = item.word.trim().toLowerCase();
    if (!normalizedWord || seenWords.has(normalizedWord)) {
      return false;
    }

    seenWords.add(normalizedWord);
    return true;
  });
}

export async function getSearchHistory(userId: string): Promise<SearchHistoryItem[]> {
  try {
    const storedHistory = await AsyncStorage.getItem(historyKeyForUser(userId));
    const parsedHistory = storedHistory ? JSON.parse(storedHistory) : [];
    const normalizedHistory = Array.isArray(parsedHistory)
      ? parsedHistory.map(normalizeHistoryItem).filter((item): item is SearchHistoryItem => !!item)
      : [];

    return dedupeHistoryItems(normalizedHistory);
  } catch {
    return [];
  }
}

export async function saveSearchAttempt(
  userId: string,
  word: string,
  status: SearchHistoryStatus,
): Promise<SearchHistoryItem[]> {
  const trimmedWord = word.trim();
  if (!validateWord(trimmedWord).valid) {
    return getSearchHistory(userId);
  }

  const cleanedWord = normalizeHistoryWord(trimmedWord);
  const currentHistory = await getSearchHistory(userId);
  const existingItem = currentHistory.find(
    (item) => normalizeHistoryWord(item.word) === cleanedWord,
  );
  const nextItem: SearchHistoryItem = {
    id: existingItem?.id || createHistoryId(cleanedWord),
    word: cleanedWord,
    status,
    searchedAt: new Date().toISOString(),
  };
<<<<<<< HEAD
  const restHistory = currentHistory.filter(
    (item) => normalizeHistoryWord(item.word) !== cleanedWord,
  );
  const nextHistory = [nextItem, ...restHistory];
=======
  const historyWithoutWord = currentHistory.filter(
    (item) => item.word.trim().toLowerCase() !== cleanedWord,
  );
  const nextHistory = [newItem, ...historyWithoutWord];
>>>>>>> 8ce0a777a9afa46540274f75e09d65d514d0bd25

  await AsyncStorage.setItem(historyKeyForUser(userId), JSON.stringify(nextHistory));
  return nextHistory;
}

export async function clearSearchHistory(userId: string): Promise<void> {
  await AsyncStorage.removeItem(historyKeyForUser(userId));
}
