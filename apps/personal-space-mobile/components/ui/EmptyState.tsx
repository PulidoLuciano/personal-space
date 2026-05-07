import { StyleSheet, View, useColorScheme } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "./icon-symbol";
import { Colors } from "@/constants/theme";
import { Spacing } from "@/constants/spacing";

export interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = Colors[isDark ? "dark" : "light"];

  return (
    <View style={styles.container}>
      <View style={[styles.iconWrapper, { backgroundColor: colors.borderLight }]}>
        <IconSymbol size={32} name="list.bullet" color={colors.textTertiary} />
      </View>
      <ThemedText type="defaultSemiBold" style={[styles.title, { color: colors.textSecondary }]}>
        {title}
      </ThemedText>
      {description && (
        <ThemedText type="subtitle" style={[styles.description, { color: colors.textTertiary }]}>
          {description}
        </ThemedText>
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
  },
});