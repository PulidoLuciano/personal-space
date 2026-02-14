import React from "react";
import { Text, TextProps, StyleSheet } from "react-native";
import { useTheme } from "@/hooks/useTheme";

interface MyTextProps extends TextProps {
  variant?: "h1" | "h2" | "body" | "caption" | "small";
  weight?: "normal" | "bold" | "semi";
  color?: "text" | "textMuted" | "primary" | "danger" | "success";
}

export const MyText: React.FC<MyTextProps> = ({
  variant = "body",
  weight = "normal",
  color = "text",
  style,
  children,
  ...props
}) => {
  const { colors } = useTheme();

  const getFontWeight = () => {
    if (weight === "bold") return "700";
    if (weight === "semi") return "600";
    return "400";
  };

  const styles = StyleSheet.create({
    text: {
      color: colors[color],
      fontWeight: getFontWeight(),
      fontSize:
        variant === "h1"
          ? 28
          : variant === "h2"
            ? 22
            : variant === "caption"
              ? 14
              : variant === "small"
                ? 12
                : 16,
    },
  });

  return (
    <Text style={[styles.text, style]} {...props}>
      {children}
    </Text>
  );
};
