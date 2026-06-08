import { DictionaryEntry } from '@/types/dictionary';

export function normalizeAudioUrl(audioUrl?: string): string | null {
  if (!audioUrl) {
    return null;
  }

  const trimmedUrl = audioUrl.trim();
  if (!trimmedUrl) {
    return null;
  }

  if (trimmedUrl.startsWith('//')) {
    return `https:${trimmedUrl}`;
  }

  return trimmedUrl.startsWith('http') ? trimmedUrl : null;
}

export function getFirstAudioUrl(entries: DictionaryEntry[]): string | null {
  for (const entry of entries) {
    for (const phonetic of entry.phonetics ?? []) {
      const audioUrl = normalizeAudioUrl(phonetic.audio);
      if (audioUrl) {
        return audioUrl;
      }
    }
  }

  return null;
}

export function getDisplayPhonetic(entry?: DictionaryEntry): string | null {
  if (!entry) {
    return null;
  }

  return entry.phonetic || entry.phonetics?.find((phonetic) => phonetic.text)?.text || null;
}
