import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { AppColors } from '@/constants/appColors';
import { DictionaryEntry } from '@/types/dictionary';
import { getDisplayPhonetic, getPronunciationOptions } from '@/utils/audioUtils';

type WordDetailsProps = {
  entries: DictionaryEntry[];
};

export function WordDetails({ entries }: WordDetailsProps) {
  const firstEntry = entries[0];
  const pronunciations = getPronunciationOptions(entries);
  const pronunciationSetKey = pronunciations.map((item) => item.audioUrl).join('|');
  const [selectedPronunciation, setSelectedPronunciation] = useState({ index: 0, setKey: '' });
  const activePronunciationIndex =
    selectedPronunciation.setKey === pronunciationSetKey ? selectedPronunciation.index : 0;
  const activePronunciation = pronunciations[activePronunciationIndex] ?? pronunciations[0] ?? null;
  const audioUrl = activePronunciation?.audioUrl ?? null;
  const phonetic = getDisplayPhonetic(firstEntry);
  const player = useAudioPlayer(audioUrl);
  const status = useAudioPlayerStatus(player);
  const [manualAudioError, setManualAudioError] = useState<{ message: string; url: string | null }>(
    {
      message: '',
      url: null,
    },
  );

  const isAudioLoading = !!audioUrl && status.isBuffering;
  const isAudioPlaying = !!audioUrl && status.playing;
  const isAudioActive = isAudioPlaying || status.currentTime > 0;
  const audioError =
    (status.error ? 'Pronunciation audio is unavailable right now.' : '') ||
    (manualAudioError.url === audioUrl ? manualAudioError.message : '');

  useEffect(() => {
    if (status.didJustFinish) {
      player.seekTo(0).catch(() => undefined);
    }
  }, [player, status.didJustFinish]);

  useEffect(
    () => () => {
      try {
        player.pause();
        player.remove();
      } catch {
        // The hook also manages cleanup; this is a defensive release for screen exits.
      }
    },
    [player],
  );

  const togglePronunciation = (index = activePronunciationIndex) => {
    const nextPronunciation = pronunciations[index];
    if (!nextPronunciation) {
      return;
    }

    const isSamePronunciation = nextPronunciation.audioUrl === audioUrl;

    try {
      setManualAudioError({ message: '', url: nextPronunciation.audioUrl });
      setSelectedPronunciation({ index, setKey: pronunciationSetKey });

      if (isSamePronunciation && isAudioPlaying) {
        player.pause();
        return;
      }

      if (!isSamePronunciation) {
        player.pause();
        player.seekTo(0).catch(() => undefined);
        player.replace(nextPronunciation.audioUrl);
      }

      player.play();
    } catch {
      setManualAudioError({
        message: 'Pronunciation audio is unavailable right now.',
        url: nextPronunciation.audioUrl,
      });
    }
  };

  const stopPronunciation = async () => {
    try {
      player.pause();
      await player.seekTo(0);
    } catch {
      setManualAudioError({
        message: 'Pronunciation audio is unavailable right now.',
        url: audioUrl,
      });
    }
  };

  const renderSinglePronunciationControl = () => {
    if (pronunciations.length !== 1) {
      return null;
    }

    return (
      <View className="flex-row items-center gap-2">
        <Pressable
          accessibilityLabel={isAudioPlaying ? 'Pause pronunciation' : 'Play pronunciation'}
          accessibilityRole="button"
          className={`h-11 w-12 items-center justify-center rounded-lg bg-indigo-50 ${
            isAudioLoading ? 'opacity-70' : 'active:opacity-75'
          }`}
          disabled={isAudioLoading}
          onPress={() => togglePronunciation(0)}>
          <Ionicons
            color={AppColors.primary}
            name={isAudioPlaying ? 'pause' : isAudioLoading ? 'hourglass-outline' : 'volume-high'}
            size={22}
          />
        </Pressable>

        {isAudioActive ? (
          <Pressable
            accessibilityLabel="Stop pronunciation"
            accessibilityRole="button"
            className="h-10 w-10 items-center justify-center rounded-lg bg-red-50 active:opacity-75"
            onPress={stopPronunciation}>
            <Ionicons color={AppColors.danger} name="stop" size={18} />
          </Pressable>
        ) : null}
      </View>
    );
  };

  const renderPronunciationSelector = () => {
    if (pronunciations.length < 2) {
      return null;
    }

    return (
      <View className="gap-3">
        <View className="flex-row items-center gap-2">
          <Ionicons color={AppColors.accent} name="mic-outline" size={18} />
          <Text className="text-[17px] font-black text-text">Pronunciations</Text>
        </View>

        <View className="gap-2.5">
          {pronunciations.map((pronunciation, index) => {
            const isSelected = pronunciation.audioUrl === audioUrl;
            const isPlayingThis = isSelected && isAudioPlaying;
            const isLoadingThis = isSelected && isAudioLoading;

            return (
              <View
                className={`min-h-[66px] flex-row items-center gap-3 rounded-lg border p-3 ${
                  isSelected ? 'border-accent bg-purple-50' : 'border-gray-200 bg-card'
                }`}
                key={pronunciation.id}>
                <Pressable
                  accessibilityRole="button"
                  className="h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 active:opacity-75"
                  onPress={() => togglePronunciation(index)}>
                  <Ionicons
                    color={isPlayingThis ? AppColors.accent : AppColors.primary}
                    name={
                      isPlayingThis ? 'pause' : isLoadingThis ? 'hourglass-outline' : 'volume-high'
                    }
                    size={20}
                  />
                </Pressable>

                <View className="flex-1 gap-0.5">
                  <Text className="text-[15px] font-black text-text">{pronunciation.label}</Text>
                  {pronunciation.phoneticText ? (
                    <Text className="text-[13px] font-bold text-secondary">
                      {pronunciation.phoneticText}
                    </Text>
                  ) : null}
                  {isPlayingThis ? (
                    <Text className="text-xs font-black uppercase text-accent">Playing now</Text>
                  ) : null}
                </View>

                {isSelected && isAudioActive ? (
                  <Pressable
                    accessibilityLabel="Stop pronunciation"
                    accessibilityRole="button"
                    className="h-9 w-9 items-center justify-center rounded-lg bg-red-50 active:opacity-75"
                    onPress={stopPronunciation}>
                    <Ionicons color={AppColors.danger} name="stop" size={16} />
                  </Pressable>
                ) : null}
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  if (!firstEntry) {
    return null;
  }

  return (
    <View className="gap-5 rounded-lg bg-card p-5 shadow-sm">
      <View className="flex-row items-center justify-between gap-4">
        <View className="flex-1 gap-1.5">
          <Text className="text-[34px] font-black capitalize leading-10 text-text">
            {firstEntry.word || 'Unknown word'}
          </Text>
          {phonetic ? <Text className="text-[17px] font-bold text-accent">{phonetic}</Text> : null}
        </View>

        {renderSinglePronunciationControl()}
      </View>

      {audioError ? <Text className="text-sm font-bold text-red-700">{audioError}</Text> : null}
      {pronunciations.length === 0 ? (
        <Text className="text-sm leading-5 text-secondary">
          Pronunciation audio is not available for this word yet.
        </Text>
      ) : null}
      {renderPronunciationSelector()}

      {entries.map((entry, entryIndex) =>
        (entry.meanings ?? []).map((meaning, meaningIndex) => (
          <View
            className="gap-3"
            key={`${entry.word}-${entryIndex}-${meaning.partOfSpeech}-${meaningIndex}`}>
            <Text className="self-start overflow-hidden rounded-lg bg-purple-50 px-2.5 py-1 text-sm font-black uppercase text-accent">
              {meaning.partOfSpeech || 'Meaning'}
            </Text>
            {(meaning.definitions ?? []).map((definition, definitionIndex) => (
              <View className="flex-row gap-3" key={`${definition.definition}-${definitionIndex}`}>
                <Text className="h-7 w-7 rounded-lg bg-indigo-50 text-center text-[13px] font-extrabold leading-7 text-primary">
                  {definitionIndex + 1}
                </Text>
                <View className="flex-1 gap-2">
                  <Text className="text-base leading-6 text-text">
                    {definition.definition || 'No definition available.'}
                  </Text>
                  {definition.example ? (
                    <Text className="border-l-4 border-accent pl-3 text-[15px] italic leading-6 text-secondary">
                      {`"${definition.example}"`}
                    </Text>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        )),
      )}
    </View>
  );
}
