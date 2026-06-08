import { isAxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchWord } from '@/api/dictionaryApi';
import { ErrorMessage } from '@/components/ErrorMessage';
import { HistoryList } from '@/components/HistoryList';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { SearchBar } from '@/components/SearchBar';
import { WordDetails } from '@/components/WordDetails';
import { getSearchHistory, saveSearchWord } from '@/storage/historyStorage';
import { DictionaryEntry } from '@/types/dictionary';

const EMPTY_STATE =
  'Search for any English word to see definitions, parts of speech, examples, and pronunciation.';

export default function HomeScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const [lastSubmittedWord, setLastSubmittedWord] = useState('');
  const [wordEntries, setWordEntries] = useState<DictionaryEntry[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    getSearchHistory().then(setHistory);
  }, []);

  const searchWord = async (wordToSearch = searchTerm) => {
    const trimmedWord = wordToSearch.trim();

    if (!trimmedWord) {
      setErrorMessage('Please enter a word before searching.');
      setWordEntries([]);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    setErrorMessage('');
    setLastSubmittedWord(trimmedWord);

    try {
      const entries = await fetchWord(trimmedWord);
      setWordEntries(entries);
      setSearchTerm(trimmedWord);
      setHistory(await saveSearchWord(trimmedWord));
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
  };

  const retrySearch = () => {
    searchWord(lastSubmittedWord || searchTerm);
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
            <Text style={styles.eyebrow}>Pocket dictionary</Text>
            <Text style={styles.title}>Find precise meanings fast.</Text>
            <Text style={styles.subtitle}>
              Search definitions, examples, phonetics, and pronunciation in one calm reading view.
            </Text>
          </View>

          <View style={styles.searchPanel}>
            <SearchBar
              disabled={isLoading}
              onChangeText={setSearchTerm}
              onSubmit={() => searchWord()}
              value={searchTerm}
            />
            <HistoryList history={history} onSelectWord={searchWord} />
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
              <Text style={styles.emptyTitle}>Ready when you are</Text>
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
    backgroundColor: '#f4f7fb',
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
    color: '#2457d6',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  title: {
    color: '#121826',
    fontSize: 36,
    fontWeight: '900',
    lineHeight: 42,
  },
  subtitle: {
    color: '#526173',
    fontSize: 16,
    lineHeight: 24,
  },
  searchPanel: {
    borderRadius: 8,
    backgroundColor: '#ffffff',
    padding: 16,
    gap: 16,
  },
  emptyState: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dce4f0',
    backgroundColor: '#ffffff',
    padding: 24,
    gap: 8,
  },
  emptyTitle: {
    color: '#121826',
    fontSize: 20,
    fontWeight: '900',
  },
  emptyText: {
    color: '#526173',
    fontSize: 16,
    lineHeight: 24,
  },
});
