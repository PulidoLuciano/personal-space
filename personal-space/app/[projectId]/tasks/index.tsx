import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, ScrollView, Pressable, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { useLocale } from "@/hooks/useLocale";
import { useCurrentProject } from "@/components/providers/ProjectContext";
import { MyText } from "@/components/ui/MyText";
import { useHabits } from "@/hooks/useHabits";
import { useProjectTasks } from "@/hooks/useProjectTasks";
import { useTaskExecutions } from "@/hooks/useTaskExecutions";
import { useTasks } from "@/hooks/useTasks";
import { HabitEntity } from "@/core/entities/HabitEntity";
import { Ionicons } from "@expo/vector-icons";
import { taskExecutionEvents, TASK_EXECUTION_CHANGED } from "@/utils/events/TaskExecutionEvents";
import { habitEvents, HABIT_CHANGED } from "@/utils/events/HabitEvents";
import { RRule } from "rrule";

const getNextOccurrence = (recurrenceRule: string, beginAt?: string, t?: (key: string) => string): string | null => {
  if (!recurrenceRule) return null;
  
  try {
    const rule = RRule.fromString(recurrenceRule);
    const startDate = beginAt ? new Date(beginAt) : new Date();
    const next = rule.after(startDate, true);
    
    if (!next) return null;
    
    const now = new Date();
    const diffMs = next.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return t ? t("habit.today") : "Today";
    if (diffDays === 1) return t ? t("habit.tomorrow") : "Tomorrow";
    if (diffDays < 7) return `${diffDays} ${t ? t("habit.days") : "days"}`;
    
    return next.toLocaleDateString();
  } catch (e) {
    return null;
  }
};

export default function TasksScreen() {
  const router = useRouter();
  const { projectId } = useCurrentProject();
  const { colors } = useTheme();
  const { t } = useLocale();
  const projectIdNum = projectId ? parseInt(projectId) : 0;
  
  const { getHabitsByProject, deleteHabit } = useHabits();
  const { tasks, loading: loadingTasks, refresh: refreshTasks } = useProjectTasks(projectIdNum);
  const { getTaskProgress } = useTaskExecutions();
  const { deleteTask } = useTasks();

  const [habits, setHabits] = useState<HabitEntity[]>([]);
  const [taskProgress, setTaskProgress] = useState<Record<number, { progress: number; goal: number; isComplete: boolean; completitionBy: number }>>({});
  const [loadingHabits, setLoadingHabits] = useState(true);
  const [showCompleted, setShowCompleted] = useState(true);

  const filteredTasks = useCallback(() => {
    let filtered = [...tasks];
    
    if (!showCompleted) {
      filtered = filtered.filter(task => {
        const progress = taskProgress[task.id!];
        return !progress?.isComplete;
      });
    }
    
    filtered.sort((a, b) => {
      if (a.dueDate && b.dueDate) {
        const dateA = new Date(a.dueDate).getTime();
        const dateB = new Date(b.dueDate).getTime();
        if (dateA !== dateB) return dateA - dateB;
      }
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;
      
      const createdA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const createdB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return createdB - createdA;
    });
    
    return filtered;
  }, [tasks, taskProgress, showCompleted]);

  const loadHabits = useCallback(async () => {
    if (!projectId) return;
    setLoadingHabits(true);
    try {
      const habitsData = await getHabitsByProject(projectIdNum);
      setHabits(habitsData);
    } catch (error) {
      console.error("Error loading habits:", error);
    } finally {
      setLoadingHabits(false);
    }
  }, [projectId, getHabitsByProject, projectIdNum]);

  const loadProgress = useCallback(async () => {
    const progressPromises = tasks.map(async (task) => {
      if (task.completitionBy && task.countGoal) {
        const progress = await getTaskProgress(task.id!, task.completitionBy, task.countGoal);
        return {
          taskId: task.id!,
          progress: task.completitionBy === 1 ? progress.completedCount : progress.totalMinutes,
          goal: task.countGoal,
          isComplete: progress.isComplete,
          completitionBy: task.completitionBy,
        };
      }
      return null;
    });

    const progressResults = await Promise.all(progressPromises);
    const progressMap: Record<number, { progress: number; goal: number; isComplete: boolean; completitionBy: number }> = {};
    progressResults.filter(Boolean).forEach((p) => {
      if (p) progressMap[p.taskId] = p;
    });
    setTaskProgress(progressMap);
  }, [tasks, getTaskProgress]);

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  useEffect(() => {
    if (!loadingTasks && tasks.length > 0) {
      loadProgress();
    }
  }, [loadingTasks, tasks, loadProgress]);

  useEffect(() => {
    const handleExecutionChanged = () => {
      loadProgress();
    };
    taskExecutionEvents.on(TASK_EXECUTION_CHANGED, handleExecutionChanged);
    return () => {
      taskExecutionEvents.off(TASK_EXECUTION_CHANGED, handleExecutionChanged);
    };
  }, [loadProgress]);

  useEffect(() => {
    const handleHabitChanged = () => {
      loadHabits();
    };
    habitEvents.on(HABIT_CHANGED, handleHabitChanged);
    return () => {
      habitEvents.off(HABIT_CHANGED, handleHabitChanged);
    };
  }, [loadHabits]);

  const handleDeleteHabit = (habit: HabitEntity) => {
    Alert.alert(
      t("habits.delete_habit"),
      t("habits.delete_confirm"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteHabit(habit.id!);
              loadHabits();
            } catch (err) {
              Alert.alert(t("common.error"), t("common.error_save"));
            }
          },
        },
      ]
    );
  };

  const handleEditHabit = (habit: HabitEntity) => {
    const params = new URLSearchParams();
    params.set("projectId", projectId || "");
    params.set("habitId", habit.id?.toString() || "");
    router.push(`/modal/create?${params.toString()}`);
  };

  const handleDeleteTask = (task: any) => {
    Alert.alert(
      t("task.delete_task"),
      t("task.delete_confirm"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTask(task.id!);
              refreshTasks();
            } catch (err) {
              Alert.alert(t("common.error"), t("common.error_save"));
            }
          },
        },
      ]
    );
  };

  const handleEditTask = (task: any) => {
    const params = new URLSearchParams();
    params.set("projectId", projectId || "");
    params.set("taskId", task.id?.toString() || "");
    router.push(`/modal/create?${params.toString()}`);
  };

  const handleTaskPress = (task: any) => {
    if (task.id && projectId) {
      router.push({
        pathname: "/[projectId]/tasks/[taskId]",
        params: { projectId, taskId: task.id.toString() },
      } as any);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    
    const days = Math.floor(minutes / (60 * 24));
    const hours = Math.floor((minutes % (60 * 24)) / 60);
    const mins = minutes % 60;
    
    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (mins > 0) parts.push(`${mins} min`);
    
    return parts.join(" ");
  };

  const loading = loadingHabits || loadingTasks;

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.section}>
        <MyText variant="h2" weight="semi" style={styles.sectionTitle}>
          {t("habits.section_title")}
        </MyText>

        {habits.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <MyText variant="body" color="textMuted">
              {t("habits.no_habits")}
            </MyText>
          </View>
        ) : (
          habits.map((habit) => (
            <View key={habit.id} style={[styles.card, { backgroundColor: colors.surface }]}>
              <View style={styles.cardHeader}>
                <View style={styles.cardInfo}>
                  <MyText variant="body" weight="semi">
                    {habit.title}
                  </MyText>
                  <MyText variant="caption" color="textMuted">
                    {habit.isStrict ? t("habit.is_strict_label") : ""} 
                    {getNextOccurrence(habit.recurrenceRule, habit.beginAt, (k) => t(k as any)) || "-"}
                  </MyText>
                </View>
                <View style={styles.cardActions}>
                  <Pressable
                    onPress={() => handleEditHabit(habit)}
                    style={[styles.actionButton, { backgroundColor: colors.hover }]}
                  >
                    <Ionicons name="pencil" size={16} color={colors.text} />
                  </Pressable>
                  <Pressable
                    onPress={() => handleDeleteHabit(habit)}
                    style={[styles.actionButton, { backgroundColor: "#EF444420" }]}
                  >
                    <Ionicons name="trash" size={16} color="#EF4444" />
                  </Pressable>
                </View>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MyText variant="h2" weight="semi" style={styles.sectionTitle}>
            {t("task.section_title")}
          </MyText>
          <Pressable
            onPress={() => setShowCompleted(!showCompleted)}
            style={[styles.filterButton, { backgroundColor: showCompleted ? colors.primary + "20" : colors.hover }]}
          >
            <Ionicons name={showCompleted ? "checkmark-circle" : "ellipse-outline"} size={18} color={showCompleted ? colors.primary : colors.textMuted} />
            <MyText variant="caption" style={{ color: showCompleted ? colors.primary : colors.textMuted, marginLeft: 4 }}>
              {t("task.complete")}
            </MyText>
          </Pressable>
        </View>

        {filteredTasks().length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <MyText variant="body" color="textMuted">
              {t("task.no_executions")}
            </MyText>
          </View>
        ) : (
          filteredTasks().map((task) => {
            const progress = taskProgress[task.id!];
            return (
              <Pressable
                key={task.id}
                onPress={() => handleTaskPress(task)}
                style={[styles.card, { backgroundColor: colors.surface }]}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardInfo}>
                    <MyText variant="body" weight="semi">
                      {task.title}
                    </MyText>
                    <MyText variant="caption" color="textMuted">
                      {task.dueDate ? formatDate(task.dueDate) : "-"}
                    </MyText>
                  </View>
                  <View style={styles.cardActions}>
                    <Pressable
                      onPress={() => handleEditTask(task)}
                      style={[styles.actionButton, { backgroundColor: colors.hover }]}
                    >
                      <Ionicons name="pencil" size={16} color={colors.text} />
                    </Pressable>
                    <Pressable
                      onPress={() => handleDeleteTask(task)}
                      style={[styles.actionButton, { backgroundColor: "#EF444420" }]}
                    >
                      <Ionicons name="trash" size={16} color="#EF4444" />
                    </Pressable>
                  </View>
                </View>
                {progress && (
                  <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { backgroundColor: colors.hover }]}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            backgroundColor: progress.isComplete ? "#22C55E" : colors.primary,
                            width: `${Math.min((progress.progress / progress.goal) * 100, 100)}%`,
                          },
                        ]}
                      />
                    </View>
                    <MyText variant="caption" color={progress.isComplete ? "success" : "textMuted"}>
                      {progress.completitionBy === 1
                        ? `${progress.progress}/${progress.goal} ${t("task.executions_count")}`
                        : `${formatDuration(progress.progress)}/${formatDuration(progress.goal)}`}
                      {progress.isComplete && ` - ${t("task.complete")}`}
                    </MyText>
                  </View>
                )}
              </Pressable>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  emptyState: {
    padding: 24,
    alignItems: "center",
    borderRadius: 12,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardInfo: {
    flex: 1,
  },
  cardActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
  },
  progressContainer: {
    marginTop: 12,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
});
