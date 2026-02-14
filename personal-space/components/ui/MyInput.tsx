import React, { useState } from "react";
import { TextInput, View, StyleSheet, TextInputProps } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { MyText } from "./MyText";

interface NodusInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const MyInput: React.FC<NodusInputProps> = ({
  label,
  error,
  style,
  ...props
}) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && (
        <MyText variant="small" color="textMuted" style={styles.label}>
          {label}
        </MyText>
      )}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.surface,
            color: colors.text,
            borderColor: error
              ? colors.danger
              : isFocused
                ? colors.secondary
                : colors.hover,
          },
          style,
        ]}
        placeholderTextColor={colors.textMuted}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
      {error && (
        <MyText variant="small" color="danger" style={styles.error}>
          {error}
        </MyText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { marginBottom: 6, marginLeft: 4, textTransform: "uppercase" },
  input: {
    height: 50,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  error: { marginTop: 4, marginLeft: 4 },
});
