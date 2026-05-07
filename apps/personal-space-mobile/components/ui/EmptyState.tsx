import { StyleSheet, View, TouchableOpacity, useColorScheme } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol, IconSymbolName } from "./icon-symbol";
import { Colors } from "@/constants/theme";
import { Spacing } from "@/constants/spacing";

export interface EmptyStateProps {
  title: string;
  description?: string;
  iconName?: IconSymbolName;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  description,
  iconName = "list.bullet",
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = Colors[isDark ? "dark" : "light"];

  return (
    <View style={styles.container} accessibilityLabel={`${title}${description ? `. ${description}` : ""}`}>
      <View style={[styles.iconWrapper, { backgroundColor: colors.tintLight }]}>
        <IconSymbol size={32} name={iconName} color={colors.tint} />
      </View>
      <ThemedText type="defaultSemiBold" style={[styles.title, { color: colors.textSecondary }]}>
        {title}
      </ThemedText>
      {description && (
        <ThemedText type="default" style={[styles.description, { color: colors.textTertiary }]}>
          {description}
        </ThemedText>
      )}
      {actionLabel && onAction && (
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.tint }]}
          onPress={onAction}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <ThemedText type="defaultSemiBold" style={styles.actionButtonText}>
            {actionLabel}
          </ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingTop: Spacing.xxxl,
    paddingHorizontal: Spacing.xxl,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 16,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    fontWeight: "400",
  },
  actionButton: {
    marginTop: Spacing.xl,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    borderRadius: 28,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 15,
  },
});