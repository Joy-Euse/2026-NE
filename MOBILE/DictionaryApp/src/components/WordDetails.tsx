import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DictionaryEntry } from '@/types/dictionary';
import { getDisplayPhonetic, getFirstAudioUrl } from '@/utils/audioUtils';

type WordDetailsProps = {
  entries: DictionaryEntry[];
};

export function WordDetails({ entries }: WordDetailsProps) {
  const firstEntry = entries[0];
  const audioUrl = getFirstAudioUrl(entries);
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

  const togglePronunciation = () => {
    try {
      setManualAudioError({ message: '', url: audioUrl });
      if (isAudioPlaying) {
        player.pause();
        return;
      }

      player.play();
    } catch {
      setManualAudioError({
        message: 'Pronunciation audio is unavailable right now.',
        url: audioUrl,
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

        {audioUrl ? (
          <View style={styles.audioControls}>
            <Pressable
              accessibilityLabel={isAudioPlaying ? 'Pause pronunciation' : 'Play pronunciation'}
              accessibilityRole="button"
              disabled={isAudioLoading}
              onPress={togglePronunciation}
              style={({ pressed }) => [
                styles.audioButton,
                (pressed || isAudioLoading) && styles.audioButtonPressed,
              ]}>
              <Ionicons
                color="#2457d6"
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
                <Ionicons color="#9f1d12" name="stop" size={18} />
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>

      {audioError ? <Text style={styles.audioError}>{audioError}</Text> : null}

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
    backgroundColor: '#ffffff',
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
    color: '#121826',
    fontSize: 34,
    fontWeight: '900',
    textTransform: 'capitalize',
  },
  phonetic: {
    color: '#2457d6',
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
    backgroundColor: '#ecf4ff',
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
    backgroundColor: '#fff4f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioError: {
    color: '#9f1d12',
    fontSize: 14,
    fontWeight: '700',
  },
  meaning: {
    gap: 12,
  },
  partOfSpeech: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    backgroundColor: '#e8f7ef',
    color: '#116b45',
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
    backgroundColor: '#edf1f7',
    color: '#4f5f76',
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
    color: '#202938',
    fontSize: 16,
    lineHeight: 24,
  },
  exampleText: {
    borderLeftWidth: 3,
    borderLeftColor: '#c9d8ff',
    color: '#4f5f76',
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 22,
    paddingLeft: 10,
  },
});
