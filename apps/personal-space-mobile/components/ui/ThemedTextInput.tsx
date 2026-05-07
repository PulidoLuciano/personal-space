import { useState } from "react";
import { useColorScheme } from "react-native";
import { TextInput, type TextInputProps, StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { Spacing, BorderRadius, FontSize } from "@/constants/spacing";

type ThemedTextInputProps = TextInputProps & {
  error?: string;
};

export function ThemedTextInput({
  style,
  error,
  editable = true,
  onFocus,
  onBlur,
  ...props
}: ThemedTextInputProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = Colors[isDark ? "dark" : "light"];
  const [isFocused, setIsFocused] = useState(false);

  const isDisabled = editable === false;

  return (
    <View style={styles.wrapper}>
      <TextInput
        style={[
          styles.input,
          {
            color: isDisabled ? colors.textTertiary : colors.text,
            backgroundColor: isDisabled ? colors.borderLight : colors.surface,
            borderColor: error
              ? colors.error
              : isFocused
                ? colors.tint
                : colors.border,
            opacity: isDisabled ? 0.7 : 1,
          },
          style,
        ]}
        placeholderTextColor={colors.textTertiary}
        editable={editable}
        onFocus={(e) => {
          setIsFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        {...props}
      />
      {!!error && (
        <ThemedText style={[styles.errorText, { color: colors.error }]}>
          {error}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.xl,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
    fontSize: FontSize.md,
    lineHeight: 22,
  },
  errorText: {
    fontSize: FontSize.sm,
    marginTop: Spacing.xs,
  },
});