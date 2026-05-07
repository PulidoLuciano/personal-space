import { useColorScheme } from "react-native";
import { TextInput, type TextInputProps, StyleSheet, View } from "react-native";
import { Colors } from "@/constants/theme";
import { Spacing, BorderRadius } from "@/constants/spacing";

type ThemedTextInputProps = TextInputProps;

export function ThemedTextInput({
  style,
  ...props
}: ThemedTextInputProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <View style={[styles.wrapper]}>
      <TextInput
        style={[
          styles.input,
          { 
            color: colors.text, 
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
          style,
        ]}
        placeholderTextColor={colors.textTertiary}
        {...props}
      />
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
    fontSize: 16,
    lineHeight: 22,
  },
});