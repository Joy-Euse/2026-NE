export type WordValidationResult = {
  valid: boolean;
  message: string;
};

const validWordPattern = /^[A-Za-z]+(?:[-'][A-Za-z]+)*$/;
const lettersPattern = /[A-Za-z]/;
const numbersOnlyPattern = /^\d+$/;
const symbolsOnlyPattern = /^[^A-Za-z0-9]+$/;

export function validateWord(word: string): WordValidationResult {
  const trimmedWord = word.trim();

  if (!trimmedWord) {
    return {
      valid: false,
      message: 'Please enter a word to search.',
    };
  }

  if (numbersOnlyPattern.test(trimmedWord)) {
    return {
      valid: false,
      message: 'Dictionary searches work best with words rather than numbers.',
    };
  }

  if (symbolsOnlyPattern.test(trimmedWord)) {
    return {
      valid: false,
      message: 'Please enter a valid English word.',
    };
  }

  if (!lettersPattern.test(trimmedWord) || !validWordPattern.test(trimmedWord)) {
    return {
      valid: false,
      message: "That doesn't look like a valid English word. Please try again.",
    };
  }

  return {
    valid: true,
    message: '',
  };
}
