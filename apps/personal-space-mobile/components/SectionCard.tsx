import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./themed-text";
import { IconSymbol } from "./ui/icon-symbol";

interface SectionCardProps {
  name: string;
  taskCount?: number;
  completedCount?: number;
  onPress: () => void;
}

export function SectionCard({ name, taskCount, completedCount, onPress }: SectionCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.content}>
        <ThemedText type="default" numberOfLines={1}>{name}</ThemedText>
        {taskCount !== undefined && (
          <ThemedText type="subtitle" style={styles.count}>
            {completedCount !== undefined && completedCount > 0
              ? `${completedCount}/${taskCount} completed`
              : `${taskCount} ${taskCount === 1 ? "task" : "tasks"}`}
          </ThemedText>
        )}
      </View>
      <IconSymbol size={20} name="chevron.right" color="#999" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.05)",
    marginBottom: 8,
  },
  content: {
    flex: 1,
  },
  count: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
});