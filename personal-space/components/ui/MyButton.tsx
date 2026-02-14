import React from "react";
import { Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { MyText } from "./MyText";

interface MyButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  loading?: boolean;
  disabled?: boolean;
}

export const MyButton: React.FC<MyButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  loading,
  disabled,
}) => {
  const { colors, theme } = useTheme();

  const getStyles = (pressed: boolean) => {
    let backgroundColor = colors.primary;
    let textColor = theme.isDark ? colors.background : colors.surface;

    if (variant === "secondary") backgroundColor = colors.accent;
    if (variant === "danger") backgroundColor = colors.danger;
    if (variant === "ghost") backgroundColor = "transparent";

    return {
      backgroundColor: pressed ? colors.press : backgroundColor,
      opacity: disabled || loading ? 0.6 : 1,
      textColor:
        variant === "secondary" || variant === "ghost"
          ? colors.text
          : textColor,
    };
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: getStyles(pressed).backgroundColor,
          opacity: getStyles(pressed).opacity,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.text} />
      ) : (
        <MyText weight="semi" style={{ color: getStyles(false).textColor }}>
          {title}
        </MyText>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
});
