import { isAxiosError } from 'axios';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchWord } from '@/api/dictionaryApi';
import { ErrorMessage } from '@/components/ErrorMessage';
import { HistoryList } from '@/components/HistoryList';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { SearchBar } from '@/components/SearchBar';
import { WordDetails } from '@/components/WordDetails';
import { AppColors } from '@/constants/appColors';
import { useAuth } from '@/context/AuthContext';
import { getSearchHistory, saveSearchWord } from '@/storage/historyStorage';
import { DictionaryEntry } from '@/types/dictionary';
import { validateWord } from '@/utils/wordValidation';

const EMPTY_STATE =
  'Search a word you heard, read, or want to master. LexiTech will bring back meanings, examples, and pronunciation.';

export default function HomeScreen() {
  const { currentUser } = useAuth();
  const params = useLocalSearchParams<{ word?: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [lastSubmittedWord, setLastSubmittedWord] = useState('');
  const [wordEntries, setWordEntries] = useState<DictionaryEntry[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [validationMessage, setValidationMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const searchWord = useCallback(async (wordToSearch = searchTerm) => {
    const trimmedWord = wordToSearch.trim();
    const validation = validateWord(trimmedWord);

    if (!currentUser) {
      setErrorMessage('Please log in before searching.');
      return;
    }

    if (!validation.valid) {
      setValidationMessage(validation.message);
      setErrorMessage('');
      setWordEntries([]);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    setErrorMessage('');
    setValidationMessage('');
    setLastSubmittedWord(trimmedWord);

    try {
      const entries = await fetchWord(trimmedWord);
      setWordEntries(entries);
      setSearchTerm(trimmedWord);
      const nextHistory = await saveSearchWord(currentUser.id, trimmedWord);
      setHistory(nextHistory.slice(0, 8));
    } catch (error) {
      setWordEntries([]);
      if (isAxiosError(error) && error.response?.status === 404) {
        setErrorMessage('Word not found. Please try another word.');
      } else if (isAxiosError(error)) {
        setErrorMessage('Network error. Check your connection and try again.');
      } else {
        setErrorMessage('Unable to read this dictionary response. Please try another word.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, searchTerm]);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    getSearchHistory(currentUser.id).then((items) => setHistory(items.slice(0, 8)));
  }, [currentUser]);

  useEffect(() => {
    if (params.word && params.word !== lastSubmittedWord) {
      const timer = setTimeout(() => {
        searchWord(params.word);
      }, 0);

      return () => clearTimeout(timer);
    }

    return undefined;
  }, [lastSubmittedWord, params.word, searchWord]);

  const retrySearch = () => {
    searchWord(lastSubmittedWord || searchTerm);
  };

  const handleSearchTextChange = (nextValue: string) => {
    setSearchTerm(nextValue);

    if (validationMessage && validateWord(nextValue).valid) {
      setValidationMessage('');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.eyebrow}>LexiTech Dictionary</Text>
            <Text style={styles.title}>Build your word power, one search at a time.</Text>
            <Text style={styles.subtitle}>
              Look up definitions, hear pronunciation, and keep your personal vocabulary trail close.
            </Text>
          </View>

          <View style={styles.searchPanel}>
            <SearchBar
              disabled={isLoading}
              errorMessage={validationMessage}
              onChangeText={handleSearchTextChange}
              onSubmit={() => searchWord()}
              value={searchTerm}
            />
            <HistoryList
              history={history}
              onOpenHistory={() => router.navigate('/history')}
              onSelectWord={searchWord}
            />
          </View>

          {isLoading ? <LoadingIndicator /> : null}

          {!isLoading && errorMessage ? (
            <ErrorMessage message={errorMessage} onRetry={lastSubmittedWord ? retrySearch : undefined} />
          ) : null}

          {!isLoading && !errorMessage && wordEntries.length > 0 ? (
            <WordDetails entries={wordEntries} />
          ) : null}

          {!isLoading && !errorMessage && wordEntries.length === 0 && !hasSearched ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>What word is on your mind?</Text>
              <Text style={styles.emptyText}>{EMPTY_STATE}</Text>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 760,
    padding: 20,
    paddingBottom: 40,
    gap: 18,
  },
  header: {
    gap: 10,
    paddingTop: 8,
    paddingBottom: 4,
  },
  eyebrow: {
    color: AppColors.primary,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  title: {
    color: AppColors.text,
    fontSize: 36,
    fontWeight: '900',
    lineHeight: 42,
  },
  subtitle: {
    color: AppColors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
  },
  searchPanel: {
    borderRadius: 8,
    backgroundColor: AppColors.card,
    padding: 16,
    gap: 16,
  },
  emptyState: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AppColors.border,
    backgroundColor: AppColors.card,
    padding: 24,
    gap: 8,
  },
  emptyTitle: {
    color: AppColors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  emptyText: {
    color: AppColors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
  },
});
