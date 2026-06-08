import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

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
  const [manualAudioError, setManualAudioError] = useState<{ message: string; url: string | null }>({
    message: '',
    url: null,
  });

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
      <View style={styles.audioControls}>
        <Pressable
          accessibilityLabel={isAudioPlaying ? 'Pause pronunciation' : 'Play pronunciation'}
          accessibilityRole="button"
          disabled={isAudioLoading}
          onPress={() => togglePronunciation(0)}
          style={({ pressed }) => [
            styles.audioButton,
            (pressed || isAudioLoading) && styles.audioButtonPressed,
          ]}>
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
            onPress={stopPronunciation}
            style={({ pressed }) => [styles.stopButton, pressed && styles.audioButtonPressed]}>
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
      <View style={styles.pronunciationSection}>
        <View style={styles.pronunciationHeading}>
          <Ionicons color={AppColors.accent} name="mic-outline" size={18} />
          <Text style={styles.pronunciationTitle}>Pronunciations</Text>
        </View>

        <View style={styles.pronunciationCards}>
          {pronunciations.map((pronunciation, index) => {
            const isSelected = pronunciation.audioUrl === audioUrl;
            const isPlayingThis = isSelected && isAudioPlaying;
            const isLoadingThis = isSelected && isAudioLoading;

            return (
              <View
                key={pronunciation.id}
                style={[styles.pronunciationCard, isSelected && styles.pronunciationCardActive]}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => togglePronunciation(index)}
                  style={({ pressed }) => [
                    styles.pronunciationPlayButton,
                    pressed && styles.audioButtonPressed,
                  ]}>
                  <Ionicons
                    color={isPlayingThis ? AppColors.accent : AppColors.primary}
                    name={isPlayingThis ? 'pause' : isLoadingThis ? 'hourglass-outline' : 'volume-high'}
                    size={20}
                  />
                </Pressable>

                <View style={styles.pronunciationTextGroup}>
                  <Text style={styles.pronunciationLabel}>{pronunciation.label}</Text>
                  {pronunciation.phoneticText ? (
                    <Text style={styles.pronunciationMeta}>{pronunciation.phoneticText}</Text>
                  ) : null}
                  {isPlayingThis ? <Text style={styles.playingNow}>Playing now</Text> : null}
                </View>

                {isSelected && isAudioActive ? (
                  <Pressable
                    accessibilityLabel="Stop pronunciation"
                    accessibilityRole="button"
                    onPress={stopPronunciation}
                    style={({ pressed }) => [styles.cardStopButton, pressed && styles.audioButtonPressed]}>
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
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.wordGroup}>
          <Text style={styles.word}>{firstEntry.word || 'Unknown word'}</Text>
          {phonetic ? <Text style={styles.phonetic}>{phonetic}</Text> : null}
        </View>

        {renderSinglePronunciationControl()}
      </View>

      {audioError ? <Text style={styles.audioError}>{audioError}</Text> : null}
      {pronunciations.length === 0 ? (
        <Text style={styles.noAudioText}>Pronunciation audio is not available for this word yet.</Text>
      ) : null}
      {renderPronunciationSelector()}

      {entries.map((entry, entryIndex) =>
        (entry.meanings ?? []).map((meaning, meaningIndex) => (
          <View
            key={`${entry.word}-${entryIndex}-${meaning.partOfSpeech}-${meaningIndex}`}
            style={styles.meaning}>
            <Text style={styles.partOfSpeech}>{meaning.partOfSpeech || 'Meaning'}</Text>
            {(meaning.definitions ?? []).map((definition, definitionIndex) => (
              <View key={`${definition.definition}-${definitionIndex}`} style={styles.definitionRow}>
                <Text style={styles.definitionNumber}>{definitionIndex + 1}</Text>
                <View style={styles.definitionTextGroup}>
                  <Text style={styles.definitionText}>
                    {definition.definition || 'No definition available.'}
                  </Text>
                  {definition.example ? (
                    <Text style={styles.exampleText}>{`"${definition.example}"`}</Text>
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

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    backgroundColor: AppColors.card,
    padding: 20,
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    alignItems: 'center',
  },
  wordGroup: {
    flex: 1,
    gap: 6,
  },
  word: {
    color: AppColors.text,
    fontSize: 34,
    fontWeight: '900',
    textTransform: 'capitalize',
  },
  phonetic: {
    color: AppColors.accent,
    fontSize: 17,
    fontWeight: '700',
  },
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  audioButton: {
    width: 46,
    height: 42,
    borderRadius: 8,
    backgroundColor: AppColors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioButtonPressed: {
    opacity: 0.7,
  },
  stopButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: AppColors.dangerSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioError: {
    color: AppColors.danger,
    fontSize: 14,
    fontWeight: '700',
  },
  noAudioText: {
    color: AppColors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  pronunciationSection: {
    gap: 12,
  },
  pronunciationHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pronunciationTitle: {
    color: AppColors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  pronunciationCards: {
    gap: 10,
  },
  pronunciationCard: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 8,
    backgroundColor: AppColors.card,
    padding: 12,
  },
  pronunciationCardActive: {
    borderColor: AppColors.accent,
    backgroundColor: AppColors.accentSoft,
  },
  pronunciationPlayButton: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: AppColors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pronunciationTextGroup: {
    flex: 1,
    gap: 3,
  },
  pronunciationLabel: {
    color: AppColors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  pronunciationMeta: {
    color: AppColors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  playingNow: {
    color: AppColors.accent,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  cardStopButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: AppColors.dangerSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meaning: {
    gap: 12,
  },
  partOfSpeech: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    backgroundColor: AppColors.accentSoft,
    color: AppColors.accent,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  definitionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  definitionNumber: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: AppColors.primarySoft,
    color: AppColors.primary,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 26,
  },
  definitionTextGroup: {
    flex: 1,
    gap: 8,
  },
  definitionText: {
    color: AppColors.text,
    fontSize: 16,
    lineHeight: 24,
  },
  exampleText: {
    borderLeftWidth: 3,
    borderLeftColor: AppColors.accent,
    color: AppColors.textSecondary,
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 22,
    paddingLeft: 10,
  },
});
