import { Pressable, Text, View } from 'react-native';

type ErrorMessageProps = {
  message: string;
  onRetry?: () => void;
};

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <View className="gap-2 rounded-lg border border-red-200 bg-red-50 p-5 shadow-sm">
      <Text className="text-base font-extrabold text-red-700">We could not find that yet</Text>
      <Text className="text-[15px] leading-6 text-text">{message}</Text>
      {onRetry ? (
        <Pressable
          accessibilityRole="button"
          className="self-start rounded-lg bg-red-700 px-4 py-2.5 active:opacity-75"
          onPress={onRetry}>
          <Text className="font-extrabold text-white">Retry</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
