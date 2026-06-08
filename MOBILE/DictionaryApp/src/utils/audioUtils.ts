import { DictionaryEntry } from '@/types/dictionary';

export type PronunciationOption = {
  id: string;
  label: string;
  audioUrl: string;
  phoneticText?: string;
};

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
  return getPronunciationOptions(entries)[0]?.audioUrl ?? null;
}

export function getDisplayPhonetic(entry?: DictionaryEntry): string | null {
  if (!entry) {
    return null;
  }

  return entry.phonetic || entry.phonetics?.find((phonetic) => phonetic.text)?.text || null;
}

function inferRegionLabel(audioUrl: string): { label: string; priority: number } | null {
  const lowerUrl = audioUrl.toLowerCase();

  if (/(^|[-_/])(uk|gb|british)([-_.:/]|$)/.test(lowerUrl)) {
    return { label: 'UK Pronunciation', priority: 1 };
  }

  if (/(^|[-_/])(us|usa|american)([-_.:/]|$)/.test(lowerUrl)) {
    return { label: 'US Pronunciation', priority: 2 };
  }

  if (/(^|[-_/])(au|australian)([-_.:/]|$)/.test(lowerUrl)) {
    return { label: 'Australian Pronunciation', priority: 3 };
  }

  return null;
}

export function getPronunciationOptions(entries: DictionaryEntry[]): PronunciationOption[] {
  const seenAudioUrls = new Set<string>();
  const options: (PronunciationOption & { originalIndex: number; priority: number })[] = [];

  for (const entry of entries) {
    for (const phonetic of entry.phonetics ?? []) {
      const audioUrl = normalizeAudioUrl(phonetic.audio);
      if (!audioUrl) {
        continue;
      }

      const dedupeKey = audioUrl.toLowerCase();
      if (seenAudioUrls.has(dedupeKey)) {
        continue;
      }

      seenAudioUrls.add(dedupeKey);
      const inferredRegion = inferRegionLabel(audioUrl);
      const label = inferredRegion?.label ?? 'Alternative';
      const matchingLabelCount = options.filter((option) => option.label === label).length;

      options.push({
        id: `${entry.word ?? 'word'}-${options.length}-${dedupeKey}`,
        label:
          matchingLabelCount > 0 && label !== 'Alternative'
            ? `${label} ${matchingLabelCount + 1}`
            : label,
        audioUrl,
        phoneticText: phonetic.text,
        originalIndex: options.length,
        priority: inferredRegion?.priority ?? 99,
      });
    }
  }

  return options
    .sort((first, second) => first.priority - second.priority || first.originalIndex - second.originalIndex)
    .map(({ originalIndex: _originalIndex, priority: _priority, ...option }) => option);
}
