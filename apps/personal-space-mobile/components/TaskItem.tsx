import { StyleSheet, TouchableOpacity, View, useColorScheme } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  type SharedValue,
} from "react-native-reanimated";
import React from "react";
import { ThemedText } from "./themed-text";
import { Colors } from "@/constants/theme";
import { Spacing, BorderRadius } from "@/constants/spacing";
import { IconSymbol } from "./ui/icon-symbol";

interface TaskItemProps {
  name: string;
  dueDate?: Date | null;
  occurrenceDate?: string | null;
  isCompleted: boolean;
  isMoving?: boolean;
  taskType?: "by time" | "by executions" | "note";
  objective?: number;
  progress?: number;
  onPress: () => void;
  onLongPress: () => void;
  onToggleComplete: () => void;
  onAddToStopwatch?: () => void;
  onDragStart?: () => void;
  onDragMove?: (absoluteX: number, absoluteY: number) => void;
  onDragEnd?: (translationY: number) => void;
  dragTranslateX?: SharedValue<number>;
  dragTranslateY?: SharedValue<number>;
  isDraggingSV?: SharedValue<boolean>;
}

export const TaskItem = React.memo(function TaskItem({
  name,
  dueDate,
  occurrenceDate,
  isCompleted,
  isMoving = false,
  taskType = "note",
  objective = 0,
  progress = 0,
  onPress,
  onLongPress,
  onToggleComplete,
  onAddToStopwatch,
  onDragStart,
  onDragMove,
  onDragEnd,
  dragTranslateX,
  dragTranslateY,
  isDraggingSV,
}: TaskItemProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = Colors[isDark ? "dark" : "light"];

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const zIndex = useSharedValue(0);
  const isDragging = useSharedValue(false);

  const triggerDragStart = () => {
    onDragStart?.();
  };

  const triggerDragMove = (absoluteX: number, absoluteY: number) => {
    onDragMove?.(absoluteX, absoluteY);
  };

  const triggerDragEnd = (translationY: number) => {
    onDragEnd?.(translationY);
  };

  const longPressGesture = Gesture.LongPress()
    .minDuration(300)
    .onStart(() => {
      isDragging.value = true;
      scale.value = withSpring(1.05);
      zIndex.value = 100;
      if (isDraggingSV) isDraggingSV.value = true;
      runOnJS(triggerDragStart)();
    });

  const panGesture = Gesture.Pan()
    .manualActivation(true)
    .onTouchesMove((_, state) => {
      if (isDragging.value) {
        state.activate();
      } else {
        state.fail();
      }
    })
    .onUpdate((event) => {
      if (isDragging.value) {
        translateX.value = event.translationX;
        translateY.value = event.translationY;
        if (dragTranslateX) dragTranslateX.value = event.absoluteX;
        if (dragTranslateY) dragTranslateY.value = event.absoluteY;
        if (onDragMove) {
          runOnJS(triggerDragMove)(event.absoluteX, event.absoluteY);
        }
      }
    })
    .onEnd((event) => {
      if (isDragging.value) {
        const targetY = event.absoluteY;
        runOnJS(triggerDragEnd)(targetY);
      }
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      scale.value = withSpring(1);
      zIndex.value = 0;
      isDragging.value = false;
      if (isDraggingSV) isDraggingSV.value = false;
    });

  const composedGesture = Gesture.Simultaneous(longPressGesture, panGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    zIndex: zIndex.value,
    shadowOpacity: isDragging.value ? 0.3 : 0.05,
    opacity: isDragging.value ? 0 : 1,
  }));

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

  const formatOccurrenceLabel = (dateStr: string): string => {
    const date = new Date(dateStr + "T00:00:00");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.getTime() === today.getTime()) return "Today";
    if (date.getTime() === yesterday.getTime()) return "Yesterday";
    return `${months[date.getMonth()]} ${date.getDate()}`;
  };

  const dueDateText = dueDate ? formatDueDate(dueDate) : null;
  const isOverdue = dueDateText === "Overdue";

  const formatTimeProgress = (seconds: number, objective: number): string => {
    if (taskType === "note") return "";
    
    if (taskType === "by time") {
      const progressSeconds = Math.min(seconds, objective);
      const hours = Math.floor(progressSeconds / 3600);
      const minutes = Math.floor((progressSeconds % 3600) / 60);
      const secs = Math.floor(progressSeconds % 60);
      
      const formatObjective = (obj: number) => {
        const h = Math.floor(obj / 3600);
        const m = Math.floor((obj % 3600) / 60);
        if (h > 0) return ` / ${h}h ${m}m`;
        if (m > 0) return ` / ${m}m`;
        return ` / ${obj}s`;
      };
      
      let progressStr: string;
      if (hours > 0) {
        progressStr = `${hours}h ${minutes}m`;
      } else if (minutes > 0) {
        progressStr = `${minutes}m ${secs}s`;
      } else {
        progressStr = `${secs}s`;
      }
      
      return `${progressStr}${formatObjective(objective)}`;
    }
    
    return `${Math.floor(seconds)}/${objective}`;
  };

  const formattedProgress = formatTimeProgress(progress, objective);

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View
        style={[
          styles.container, 
          { backgroundColor: colors.surface },
          isMoving && { borderColor: colors.tint, borderWidth: 1.5 },
          animatedStyle,
        ]}
      >
        <TouchableOpacity
          style={styles.touchableInside}
          onPress={onPress}
          activeOpacity={1}
        >
      {taskType === "by time" && onAddToStopwatch ? (
        <TouchableOpacity
          style={[styles.timerButton, { backgroundColor: colors.tintLight }]}
          onPress={onAddToStopwatch}
          activeOpacity={0.7}
        >
          <IconSymbol size={14} name="timer" color={colors.tint} />
        </TouchableOpacity>
      ) : taskType === "note" ? (
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
          {!!occurrenceDate && (
            <View style={[styles.occurrenceBadge, { backgroundColor: colors.tintLight }]}>
              <ThemedText type="subtitle" style={[styles.occurrenceText, { color: colors.tint }]}>
                {formatOccurrenceLabel(occurrenceDate)}
              </ThemedText>
            </View>
          )}
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
      </Animated.View>
    </GestureDetector>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  touchableInside: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
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
  timerButton: {
    width: 22,
    height: 22,
    borderRadius: BorderRadius.full,
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
  occurrenceBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  occurrenceText: {
    fontSize: 12,
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