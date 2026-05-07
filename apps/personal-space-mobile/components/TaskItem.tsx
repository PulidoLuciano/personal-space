import { StyleSheet, TouchableOpacity, View, useColorScheme } from "react-native";
import { ThemedText } from "./themed-text";
import { Colors } from "@/constants/theme";
import { Spacing, BorderRadius } from "@/constants/spacing";
import { IconSymbol } from "./ui/icon-symbol";

interface TaskItemProps {
  name: string;
  dueDate?: Date | null;
  isCompleted: boolean;
  isMoving?: boolean;
  taskType?: "by time" | "by executions" | "note";
  objective?: number;
  progress?: number;
  onPress: () => void;
  onLongPress: () => void;
  onToggleComplete: () => void;
}

export function TaskItem({
  name,
  dueDate,
  isCompleted,
  isMoving = false,
  taskType = "note",
  objective = 0,
  progress = 0,
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

  const formatTimeProgress = (seconds: number, objective: number): string => {
    if (taskType === "note") return "";
    
    if (taskType === "by time") {
      const totalSeconds = Math.min(seconds, objective);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const secs = Math.floor(totalSeconds % 60);
      
      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
      } else {
        return `${secs}s`;
      }
    }
    
    return `${Math.floor(seconds)}/${objective}`;
  };

  const formattedProgress = formatTimeProgress(progress, objective);

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
      {taskType === "note" ? (
        <View style={[styles.noteIcon, { backgroundColor: colors.borderLight }]}>
          <IconSymbol size={14} name="note.text" color={colors.textSecondary} />
        </View>
      ) : (
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
      )}
      <View style={styles.content}>
        <View style={styles.titleRow}>
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
          )}
        </View>
        {taskType !== "note" && objective > 0 && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: colors.borderLight }]}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    backgroundColor: isCompleted ? colors.success : colors.tint,
                    width: `${Math.min((progress / objective) * 100, 100)}%` 
                  }
                ]} 
              />
            </View>
            <ThemedText type="subtitle" style={[styles.progressText, { color: colors.textSecondary }]}>
              {formattedProgress}
            </ThemedText>
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
  noteIcon: {
    width: 22,
    height: 22,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  taskName: {
    flex: 1,
    fontSize: 15,
  },
  completedText: {
    textDecorationLine: "line-through",
    opacity: 0.5,
  },
  dueDateBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  dueDateText: {
    fontSize: 12,
  },
  progressContainer: {
    marginTop: Spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    minWidth: 35,
    textAlign: "right",
  },
});