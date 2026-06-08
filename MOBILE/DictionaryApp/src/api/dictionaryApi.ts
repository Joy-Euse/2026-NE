import axios from 'axios';

import { DictionaryEntry } from '@/types/dictionary';

const API_BASE_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en';

export async function fetchWord(word: string): Promise<DictionaryEntry[]> {
  const normalizedWord = encodeURIComponent(word.trim().toLowerCase());
  const response = await axios.get<DictionaryEntry[]>(`${API_BASE_URL}/${normalizedWord}`);

  if (!Array.isArray(response.data)) {
    throw new Error('Unexpected dictionary response.');
  }

  return response.data;
}
