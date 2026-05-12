import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
  runOnJS,
  type SharedValue,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { ThemedText } from "./themed-text";
import { IconSymbol } from "./ui/icon-symbol";
import { TaskItem } from "./TaskItem";
import { Colors } from "@/constants/theme";
import { Spacing, BorderRadius } from "@/constants/spacing";
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
  onAddToStopwatch?: (task: TaskWithSection) => void;
  onDragStart?: (taskId: string) => void;
  onDragMove?: (taskId: string, absoluteX: number, absoluteY: number) => void;
  onDragEnd?: (taskId: string, absoluteY: number) => void;
  dragTranslateX?: SharedValue<number>;
  dragTranslateY?: SharedValue<number>;
  isDraggingSV?: SharedValue<boolean>;
  onRandomTask?: () => void;
  sectionY?: number;
  sectionHeight?: number;
}

export const SectionContainer = React.memo(function SectionContainer({
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
  onAddToStopwatch,
  onDragStart,
  onDragMove,
  onDragEnd,
  dragTranslateX,
  dragTranslateY,
  isDraggingSV,
  onRandomTask,
  sectionY = 0,
  sectionHeight = 0,
}: SectionContainerProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = Colors[isDark ? "dark" : "light"];

  const completedCount = tasks.filter((t) => t.progress >= t.objective).length;
  const totalCount = tasks.length;
  const isReceivingDrop =
    movingTaskId !== null && tasks.every((t) => t.id !== movingTaskId);
  const isDragging = movingTaskId !== null;

  const containerStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(
      isReceivingDrop ? colors.tintLight : colors.surface,
      { duration: 200 },
    ),
    borderWidth: withTiming(isReceivingDrop ? 1 : 0, { duration: 200 }),
    borderColor: withTiming(isReceivingDrop ? colors.tint : "transparent", {
      duration: 200,
    }),
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        containerStyle,
        isDragging && styles.containerDragging,
      ]}
    >
      <TouchableOpacity
        style={[styles.header, { backgroundColor: colors.surface }]}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerContent}>
          <GestureDetector
            gesture={Gesture.LongPress()
              .minDuration(300)
              .onEnd(() => onRandomTask && runOnJS(onRandomTask)())}
          >
            <View>
              <ThemedText
                type="defaultSemiBold"
                style={{ color: colors.text }}
                numberOfLines={1}
              >
                {section.name}
              </ThemedText>
            </View>
          </GestureDetector>
          {totalCount > 0 && (
            <View
              style={[
                styles.countBadge,
                { backgroundColor: colors.borderLight },
              ]}
            >
              <ThemedText
                type="subtitle"
                style={[styles.count, { color: colors.textSecondary }]}
              >
                {completedCount > 0
                  ? `${completedCount}/${totalCount}`
                  : `${totalCount}`}
              </ThemedText>
            </View>
          )}
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: colors.borderLight },
            ]}
            onPress={(e) => {
              e.stopPropagation();
              onEditSection();
            }}
          >
            <IconSymbol size={16} name="pencil" color={colors.iconSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: colors.errorLight },
            ]}
            onPress={(e) => {
              e.stopPropagation();
              onDeleteSection();
            }}
          >
            <IconSymbol size={16} name="trash" color={colors.error} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.addButton,
              { backgroundColor: colors.tint },
            ]}
            onPress={(e) => {
              e.stopPropagation();
              onAddTask();
            }}
          >
            <IconSymbol size={16} name="plus" color="#fff" />
          </TouchableOpacity>
          {movingTaskId !== null && (
            <TouchableOpacity
              style={[
                styles.receiveButton,
                { backgroundColor: colors.tintLight },
              ]}
              onPress={(e) => {
                e.stopPropagation();
                onSectionPress();
              }}
            >
              <IconSymbol size={16} name="plus" color={colors.tint} />
            </TouchableOpacity>
          )}
          <IconSymbol
            size={18}
            name={isExpanded ? "chevron.down" : "chevron.right"}
            color={colors.iconSecondary}
          />
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.tasksContainer}>
          {tasks.length === 0 ? (
            <View style={styles.emptyState}>
              <ThemedText
                type="subtitle"
                style={[styles.emptyText, { color: colors.textSecondary }]}
              >
                No tasks yet
              </ThemedText>
              <TouchableOpacity onPress={onAddTask}>
                <ThemedText type="link" style={{ color: colors.tint }}>
                  Add a task
                </ThemedText>
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
                taskType={task.type}
                objective={task.objective}
                progress={task.progress}
                onPress={() => onTaskPress(task)}
                onLongPress={() => onTaskLongPress(task)}
                onToggleComplete={() => onToggleTaskComplete(task)}
                onAddToStopwatch={
                  task.type === "by time" && onAddToStopwatch
                    ? () => onAddToStopwatch(task)
                    : undefined
                }
                onDragStart={() => onDragStart?.(task.id)}
                onDragMove={
                  onDragMove
                    ? (absoluteX: number, absoluteY: number) =>
                        onDragMove(task.id, absoluteX, absoluteY)
                    : undefined
                }
                onDragEnd={(absoluteY) => onDragEnd?.(task.id, absoluteY)}
                dragTranslateX={dragTranslateX}
                dragTranslateY={dragTranslateY}
                isDraggingSV={isDraggingSV}
              />
            ))
          )}
        </View>
      )}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  containerDragging: {
    overflow: "visible",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
  },
  headerContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  countBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: BorderRadius.full,
  },
  count: {
    fontSize: 12,
    fontWeight: "500",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  actionButton: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  addButton: {
    marginRight: Spacing.xs,
  },
  receiveButton: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.xs,
  },
  tasksContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
  },
  emptyText: {
    marginBottom: Spacing.sm,
  },
});

