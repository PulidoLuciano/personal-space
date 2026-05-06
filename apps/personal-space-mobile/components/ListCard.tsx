import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./themed-text";
import { IconSymbol } from "./ui/icon-symbol";
import { ProjectIcon } from "./ui/ProjectIcon";

interface ListCardProps {
  name: string;
  color: string;
  icon: string;
  taskCount?: number;
  onPress: () => void;
}

export function ListCard({ name, color, icon, taskCount, onPress }: ListCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <ProjectIcon name={icon} size={24} color="#fff" />
      </View>
      <View style={styles.content}>
        <ThemedText type="default" numberOfLines={1}>{name}</ThemedText>
        {taskCount !== undefined && (
          <ThemedText type="subtitle" style={styles.count}>
            {taskCount} {taskCount === 1 ? "task" : "tasks"}
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
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
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