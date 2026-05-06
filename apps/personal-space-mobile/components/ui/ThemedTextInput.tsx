import { useColorScheme } from "react-native";
import { TextInput, type TextInputProps, StyleSheet } from "react-native";
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
    <TextInput
      style={[
        styles.input,
        { color: colors.text, backgroundColor: colors.background },
        style,
      ]}
      placeholderTextColor="#999"
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.2)",
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
    fontSize: 16,
  },
});