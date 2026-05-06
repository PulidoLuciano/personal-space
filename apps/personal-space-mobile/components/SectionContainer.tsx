import { useState } from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import { ThemedText } from "./themed-text";
import { IconSymbol } from "./ui/icon-symbol";
import { TaskItem } from "./TaskItem";
import type { Section, TaskWithProgress } from "personal-space-core";

interface TaskWithSection extends TaskWithProgress {
  section_id: string;
}

interface SectionContainerProps {
  section: Section;
  tasks: TaskWithSection[];
  movingTaskId: string | null;
  onAddTask: () => void;
  onEditSection: () => void;
  onDeleteSection: () => void;
  onTaskPress: (task: TaskWithSection) => void;
  onToggleTaskComplete: (task: TaskWithSection) => void;
  onTaskLongPress: (task: TaskWithSection) => void;
  onSectionPress: () => void;
}

export function SectionContainer({
  section,
  tasks,
  movingTaskId,
  onAddTask,
  onEditSection,
  onDeleteSection,
  onTaskPress,
  onToggleTaskComplete,
  onTaskLongPress,
  onSectionPress,
}: SectionContainerProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const completedCount = tasks.filter(t => t.progress >= t.objective).length;
  const totalCount = tasks.length;
  const isReceivingDrop = movingTaskId !== null && tasks.every(t => t.id !== movingTaskId);

  const containerStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(
      isReceivingDrop ? "rgba(10, 126, 164, 0.15)" : "rgba(0,0,0,0.05)",
      { duration: 200 }
    ),
    borderWidth: withTiming(isReceivingDrop ? 2 : 0, { duration: 200 }),
    borderColor: withTiming(isReceivingDrop ? "#0a7ea4" : "transparent", { duration: 200 }),
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerContent}>
          <ThemedText type="defaultSemiBold" numberOfLines={1}>{section.name}</ThemedText>
          {totalCount > 0 && (
            <ThemedText type="subtitle" style={styles.count}>
              {completedCount > 0
                ? `${completedCount}/${totalCount} completed`
                : `${totalCount} ${totalCount === 1 ? "task" : "tasks"}`}
            </ThemedText>
          )}
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              onEditSection();
            }}
          >
            <IconSymbol size={18} name="pencil" color="#666" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              onDeleteSection();
            }}
          >
            <IconSymbol size={18} name="trash" color="#d32f2f" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              onAddTask();
            }}
          >
            <IconSymbol size={20} name="plus" color="#0a7ea4" />
          </TouchableOpacity>
          {movingTaskId !== null && (
            <TouchableOpacity
              style={styles.receiveButton}
              onPress={(e) => {
                e.stopPropagation();
                onSectionPress();
              }}
            >
              <IconSymbol size={18} name="arrow.down.doc" color="#0a7ea4" />
            </TouchableOpacity>
          )}
          <IconSymbol
            size={20}
            name={isExpanded ? "chevron.down" : "chevron.right"}
            color="#999"
          />
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.tasksContainer}>
          {tasks.length === 0 ? (
            <View style={styles.emptyState}>
              <ThemedText type="subtitle" style={styles.emptyText}>No tasks yet</ThemedText>
              <TouchableOpacity onPress={onAddTask}>
                <ThemedText type="link">Add a task</ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            tasks.map((task) => (
              <TaskItem
                key={task.id}
                name={task.name}
                dueDate={task.due_date}
                isCompleted={task.progress >= task.objective}
                isMoving={task.id === movingTaskId}
                onPress={() => onTaskPress(task)}
                onLongPress={() => onTaskLongPress(task)}
                onToggleComplete={() => onToggleTaskComplete(task)}
              />
            ))
          )}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  headerContent: {
    flex: 1,
  },
  count: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 4,
    marginRight: 4,
  },
  receiveButton: {
    padding: 4,
    marginRight: 8,
  },
  tasksContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 16,
  },
  emptyText: {
    marginBottom: 8,
  },
});