import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./themed-text";

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
      style={[styles.container, isMoving && styles.movingContainer]}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={500}
    >
      <TouchableOpacity
        style={[styles.checkbox, isCompleted && styles.checkboxCompleted]}
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
          <ThemedText type="subtitle" style={styles.dueDate}>
            {formatDueDate(dueDate)}
          </ThemedText>
        )}
      </View>
      {isMoving && <View style={styles.movingIndicator} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.05)",
    marginBottom: 8,
  },
  movingContainer: {
    backgroundColor: "rgba(10, 126, 164, 0.15)",
    borderWidth: 1,
    borderColor: "#0a7ea4",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#999",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  checkboxCompleted: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
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
    color: "#666",
  },
  movingIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#0a7ea4",
  },
});