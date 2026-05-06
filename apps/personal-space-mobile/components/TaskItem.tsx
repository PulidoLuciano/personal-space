import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Spacing, BorderRadius } from "@/constants/spacing";

interface TaskItemProps {
  name: string;
  dueDate?: Date | null;
  isCompleted: boolean;
  isMoving?: boolean;
  onPress: () => void;
  onLongPress: () => void;
  onToggleComplete: () => void;
}

export function TaskItem({
  name,
  dueDate,
  isCompleted,
  isMoving = false,
  onPress,
  onLongPress,
  onToggleComplete,
}: TaskItemProps) {
  const tintColor = useThemeColor({}, "tint");
  const mutedColor = useThemeColor({ light: "#999", dark: "#666" }, "text");
  const backgroundLight = useThemeColor({ light: "rgba(0,0,0,0.05)", dark: "rgba(255,255,255,0.1)" }, "background");

  const formatDueDate = (dueDate: Date | null) => {
    if (!dueDate) return null;
    const now = new Date();
    const diff = dueDate.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return "Overdue";
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    if (days < 7) return `${days} days`;
    return dueDate.toLocaleDateString();
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: backgroundLight }, isMoving && styles.movingContainer]}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={500}
    >
      <TouchableOpacity
        style={[
          styles.checkbox,
          { borderColor: mutedColor },
          isCompleted && { backgroundColor: "#4CAF50", borderColor: "#4CAF50" }
        ]}
        onPress={onToggleComplete}
      >
        {isCompleted && <View style={styles.checkmark} />}
      </TouchableOpacity>
      <View style={styles.content}>
        <ThemedText
          type="default"
          numberOfLines={1}
          style={isCompleted ? styles.completedText : undefined}
        >
          {name}
        </ThemedText>
        {dueDate && (
          <ThemedText type="subtitle" style={[styles.dueDate, { color: mutedColor }]}>
            {formatDueDate(dueDate)}
          </ThemedText>
        )}
      </View>
      {isMoving && <View style={[styles.movingIndicator, { backgroundColor: tintColor }]} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  movingContainer: {
    borderWidth: 1,
    borderColor: "#0a7ea4",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  checkmark: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
  },
  completedText: {
    textDecorationLine: "line-through",
    opacity: 0.5,
  },
  dueDate: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  movingIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});