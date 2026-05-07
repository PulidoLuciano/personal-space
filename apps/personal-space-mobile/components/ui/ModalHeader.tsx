import { StyleSheet, View, TouchableOpacity, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { Spacing, BorderRadius } from "@/constants/spacing";

export interface ModalHeaderProps {
  title: string;
  leftLabel?: string;
  onLeftPress?: () => void;
  rightLabel?: string;
  onRightPress?: () => void;
}

export function ModalHeader({
  title,
  leftLabel = "Cancel",
  onLeftPress,
  rightLabel,
  onRightPress,
}: ModalHeaderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = Colors[isDark ? "dark" : "light"];
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.sm, borderBottomColor: colors.border }]}>
      <TouchableOpacity 
        onPress={onLeftPress} 
        disabled={!onLeftPress}
        accessibilityRole="button"
        accessibilityLabel={leftLabel}
        accessibilityState={{ disabled: !onLeftPress }}
        style={[styles.button, !onLeftPress && styles.buttonDisabled]}
      >
        <ThemedText type="default" style={{ color: colors.textSecondary }}>{leftLabel}</ThemedText>
      </TouchableOpacity>
      <ThemedText
        type="defaultSemiBold"
        accessibilityRole="header"
        style={{ color: colors.text, fontSize: 17 }}
      >
        {title}
      </ThemedText>
      <TouchableOpacity 
        onPress={onRightPress} 
        disabled={!onRightPress}
        accessibilityRole="button"
        accessibilityLabel={rightLabel || ""}
        accessibilityState={{ disabled: !onRightPress }}
        style={[styles.button, styles.buttonPrimary, !onRightPress && styles.buttonDisabled]}
      >
        <ThemedText type="defaultSemiBold" style={{ color: rightLabel ? colors.tint : colors.iconSecondary }}>
          {rightLabel}
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  button: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    minWidth: 60,
  },
  buttonDisabled: {
    opacity: 0.3,
  },
  buttonPrimary: {
    alignItems: "flex-end",
  },
});