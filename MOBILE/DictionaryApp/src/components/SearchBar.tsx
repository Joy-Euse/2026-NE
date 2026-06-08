import { Pressable, Text, TextInput, View } from 'react-native';

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
    <View className="gap-2">
      <View className="flex-row gap-2.5">
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          className={`min-h-[52px] flex-1 rounded-lg border bg-card px-4 text-base text-text ${
            errorMessage ? 'border-red-700 bg-red-50' : 'border-gray-200'
          }`}
          editable={!disabled}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          placeholder="Type a word to explore"
          placeholderTextColor="#6B7280"
          returnKeyType="search"
          value={value}
        />
        <Pressable
          accessibilityRole="button"
          className={`min-h-[52px] items-center justify-center rounded-lg bg-primary px-5 ${
            disabled ? 'opacity-70' : 'active:opacity-75'
          }`}
          disabled={disabled}
          onPress={onSubmit}>
          <Text className="text-base font-bold text-white">Explore</Text>
        </Pressable>
      </View>
      {errorMessage ? (
        <Text className="text-sm font-bold leading-5 text-red-700">{errorMessage}</Text>
      ) : null}
    </View>
  );
}
