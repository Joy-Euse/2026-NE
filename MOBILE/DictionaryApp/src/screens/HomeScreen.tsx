import { isAxiosError } from 'axios';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchWord } from '@/api/dictionaryApi';
import { ErrorMessage } from '@/components/ErrorMessage';
import { HistoryList } from '@/components/HistoryList';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { SearchBar } from '@/components/SearchBar';
import { WordDetails } from '@/components/WordDetails';
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

  const searchWord = useCallback(
    async (wordToSearch = searchTerm) => {
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
    },
    [currentUser, searchTerm],
  );

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
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1">
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View className="w-full max-w-3xl gap-5 self-center px-5 pb-10 pt-5">
            <View className="gap-2.5">
              <Text className="text-sm font-black uppercase tracking-normal text-primary">
                LexiTech Dictionary
              </Text>
              <Text className="text-4xl font-black leading-tight text-text">
                Build your word power, one search at a time.
              </Text>
              <Text className="text-base leading-6 text-secondary">
                Look up definitions, hear pronunciation, and keep your personal vocabulary trail
                close.
              </Text>
            </View>

            <View className="gap-4 rounded-lg bg-card p-4 shadow-sm">
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
              <View className="gap-2 rounded-lg border border-gray-200 bg-card p-6 shadow-sm">
                <Text className="text-xl font-black text-text">What word is on your mind?</Text>
                <Text className="text-base leading-6 text-secondary">{EMPTY_STATE}</Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
