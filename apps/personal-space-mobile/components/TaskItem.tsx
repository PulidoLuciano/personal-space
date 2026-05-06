import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./themed-text";
import { IconSymbol } from "./ui/icon-symbol";

interface TaskItemProps {
  name: string;
  body?: string | null;
  dueDate?: Date | null;
  isCompleted: boolean;
  onPress: () => void;
  onToggleComplete: () => void;
}

export function TaskItem({
  name,
  body,
  dueDate,
  isCompleted,
  onPress,
  onToggleComplete,
}: TaskItemProps) {
  const formatDueDate = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return "Overdue";
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    if (days < 7) return `${days} days`;
    return date.toLocaleDateString();
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <TouchableOpacity
        style={[styles.checkbox, isCompleted && styles.checkboxCompleted]}
        onPress={onToggleComplete}
      >
        {isCompleted && <IconSymbol size={16} name="checkmark" color="#fff" />}
      </TouchableOpacity>
      <View style={styles.content}>
        <ThemedText
          type="default"
          numberOfLines={1}
          style={isCompleted ? styles.completedText : undefined}
        >
          {name}
        </ThemedText>
        {body && (
          <ThemedText type="subtitle" numberOfLines={1} style={styles.body}>
            {body}
          </ThemedText>
        )}
        {dueDate && (
          <ThemedText type="subtitle" style={styles.dueDate}>
            {formatDueDate(dueDate)}
          </ThemedText>
        )}
      </View>
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
  content: {
    flex: 1,
  },
  completedText: {
    textDecorationLine: "line-through",
    opacity: 0.5,
  },
  body: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  dueDate: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
    color: "#666",
  },
});