import { StyleSheet, TouchableOpacity, View, useColorScheme } from "react-native";
import { ThemedText } from "./themed-text";
import { Colors } from "@/constants/theme";
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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = Colors[isDark ? "dark" : "light"];

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

  const dueDateText = dueDate ? formatDueDate(dueDate) : null;
  const isOverdue = dueDateText === "Overdue";

  return (
    <TouchableOpacity
      style={[
        styles.container, 
        { backgroundColor: colors.surface },
        isMoving && { borderColor: colors.tint, borderWidth: 1.5 }
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={500}
      activeOpacity={0.7}
    >
      <TouchableOpacity
        style={[
          styles.checkbox,
          { 
            borderColor: isCompleted ? colors.success : colors.border,
            backgroundColor: isCompleted ? colors.success : 'transparent'
          }
        ]}
        onPress={onToggleComplete}
        activeOpacity={0.7}
      >
        {isCompleted && (
          <View style={styles.checkmark}>
            <View style={[styles.checkmarkStem, { backgroundColor: '#fff' }]} />
            <View style={[styles.checkmarkKick, { backgroundColor: '#fff' }]} />
          </View>
        )}
      </TouchableOpacity>
      <View style={styles.content}>
        <ThemedText
          type="default"
          numberOfLines={1}
          style={[
            styles.taskName,
            { color: colors.text },
            isCompleted && styles.completedText
          ]}
        >
          {name}
        </ThemedText>
        {dueDateText && (
          <View style={styles.dueDateContainer}>
            <View style={[
              styles.dueDateBadge, 
              { 
                backgroundColor: isOverdue ? colors.errorLight : colors.borderLight 
              }
            ]}>
              <ThemedText 
                type="subtitle" 
                style={[
                  styles.dueDateText, 
                  { 
                    color: isOverdue ? colors.error : colors.textSecondary 
                  }
                ]}
              >
                {dueDateText}
              </ThemedText>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  checkmark: {
    width: 10,
    height: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmarkStem: {
    position: "absolute",
    width: 2,
    height: 8,
    borderRadius: 1,
    transform: [{ rotate: "45deg" }],
    left: 4,
    top: 1,
  },
  checkmarkKick: {
    position: "absolute",
    width: 2,
    height: 5,
    borderRadius: 1,
    transform: [{ rotate: "-45deg" }],
    left: 1,
    top: 4,
  },
  content: {
    flex: 1,
  },
  taskName: {
    fontSize: 15,
  },
  completedText: {
    textDecorationLine: "line-through",
    opacity: 0.5,
  },
  dueDateContainer: {
    marginTop: Spacing.xs,
  },
  dueDateBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: BorderRadius.xs,
  },
  dueDateText: {
    fontSize: 12,
  },
});