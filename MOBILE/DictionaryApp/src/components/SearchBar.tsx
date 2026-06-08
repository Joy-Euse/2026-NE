import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppColors } from '@/constants/appColors';

type SearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  errorMessage?: string;
};

export function SearchBar({
  value,
  onChangeText,
  onSubmit,
  disabled,
  errorMessage,
}: SearchBarProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          editable={!disabled}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          placeholder="Type a word to explore"
          placeholderTextColor={AppColors.textSecondary}
          returnKeyType="search"
          style={[styles.input, errorMessage && styles.inputError]}
          value={value}
        />
        <Pressable
          accessibilityRole="button"
          disabled={disabled}
          onPress={onSubmit}
          style={({ pressed }) => [
            styles.button,
            (pressed || disabled) && styles.buttonPressed,
          ]}>
          <Text style={styles.buttonText}>Explore</Text>
        </Pressable>
      </View>
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  container: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    flex: 1,
    minHeight: 52,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AppColors.border,
    backgroundColor: AppColors.card,
    paddingHorizontal: 16,
    color: AppColors.text,
    fontSize: 16,
  },
  inputError: {
    borderColor: AppColors.danger,
    backgroundColor: AppColors.dangerSoft,
  },
  button: {
    minHeight: 52,
    borderRadius: 8,
    backgroundColor: AppColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  buttonPressed: {
    opacity: 0.72,
  },
  buttonText: {
    color: AppColors.onPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    color: AppColors.danger,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
});
