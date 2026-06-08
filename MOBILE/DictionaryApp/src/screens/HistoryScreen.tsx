import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppColors } from '@/constants/appColors';
import { useAuth } from '@/context/AuthContext';
import {
  clearSearchHistory,
  getSearchHistory,
  SearchHistoryItem,
} from '@/storage/historyStorage';

export function HistoryScreen() {
  const { currentUser } = useAuth();
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);

  const loadHistory = useCallback(() => {
    if (!currentUser) {
      setHistory([]);
      return;
    }

    getSearchHistory(currentUser.id).then(setHistory);
  }, [currentUser]);

  useFocusEffect(loadHistory);

  const handleSelectWord = (word: string) => {
    router.replace({ pathname: '/', params: { word } } as never);
  };

  const getStatusLabel = (item: SearchHistoryItem) => {
    if (item.status === 'not_found') {
      return 'Not found';
    }

    if (item.status === 'error') {
      return 'Failed';
    }

    return '';
  };

  const handleClearHistory = async () => {
    if (!currentUser) {
      return;
    }

    await clearSearchHistory(currentUser.id);
    setHistory([]);
  };

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-background">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="w-full max-w-3xl gap-5 self-center px-5 py-5">
          <View className="gap-2">
            <Text className="text-[13px] font-black uppercase tracking-normal text-primary">
              Word trail
            </Text>
            <Text className="text-3xl font-black text-text">Everything you have explored</Text>
            <Text className="text-base leading-6 text-secondary">
              Your newest searches stay at the top, ready for quick review.
            </Text>
          </View>

          {history.length === 0 ? (
            <View className="items-center gap-2.5 rounded-lg bg-card p-7 shadow-sm">
              <Ionicons color={AppColors.primary} name="time-outline" size={30} />
              <Text className="text-xl font-black text-text">Your word trail is empty</Text>
              <Text className="text-center text-[15px] leading-6 text-secondary">
                Search a word from Home and LexiTech will keep it here for your next study session.
              </Text>
            </View>
          ) : (
            <View className="gap-2.5">
              <Pressable
                accessibilityRole="button"
                className="flex-row items-center gap-2 self-start rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 active:opacity-75"
                onPress={handleClearHistory}>
                <Ionicons color={AppColors.danger} name="trash-outline" size={18} />
                <Text className="font-black text-red-700">Clear history</Text>
              </Pressable>

              {history.map((item) => (
                <Pressable
                  accessibilityRole="button"
                  className="min-h-[58px] flex-row items-center gap-3 rounded-lg bg-card px-4 shadow-sm active:opacity-75"
                  key={item.id}
                  onPress={() => handleSelectWord(item.word)}>
                  <Ionicons
                    color={item.status === 'success' ? AppColors.primary : AppColors.textSecondary}
                    name={item.status === 'success' ? 'book-outline' : 'alert-circle-outline'}
                    size={20}
                  />
                  <View className="flex-1">
                    <Text className="text-[17px] font-extrabold capitalize text-text">
                      {item.word}
                    </Text>
                    {getStatusLabel(item) ? (
                      <Text
                        className={`text-xs font-black ${
                          item.status === 'not_found' ? 'text-amber-700' : 'text-red-700'
                        }`}>
                        {getStatusLabel(item)}
                      </Text>
                    ) : null}
                  </View>
                  <Ionicons color={AppColors.textSecondary} name="chevron-forward" size={18} />
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
