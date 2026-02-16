import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, ScrollView, Pressable, Alert, ActivityIndicator, Linking } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { useLocale } from "@/hooks/useLocale";
import { MyText } from "@/components/ui/MyText";
import { useTasks } from "@/hooks/useTasks";
import { useTaskExecutionsByTask } from "@/hooks/useTaskExecutionsByTask";
import { useTaskProgress } from "@/hooks/useTaskProgress";
import { useTaskExecutions } from "@/hooks/useTaskExecutions";
import { TaskExecutionEntity } from "@/core/entities/TaskExecutionEntity";
import { Ionicons } from "@expo/vector-icons";

export default function TaskDetailScreen() {
  const router = useRouter();
  const { taskId, projectId } = useLocalSearchParams<{ taskId: string; projectId: string }>();
  const { colors } = useTheme();
  const { t } = useLocale();
  const { getTaskById, deleteTask } = useTasks();
  const { startExecution, stopExecution, deleteExecution, getActiveExecution } = useTaskExecutions();
  
  const taskIdNum = taskId ? parseInt(taskId) : 0;

  const isPrimaryLight = colors.primary === "#FFFFFF" || colors.primary === "#FFF" || colors.primary.toLowerCase() === "#ffffff";
  const executionButtonTextColor = isPrimaryLight ? "#000000" : "#FFFFFF";
  
  const { executions, loading: loadingExecutions, refresh: refreshExecutions } = useTaskExecutionsByTask(taskIdNum);
  
  const [task, setTask] = useState<any>(null);
  const [activeExecution, setActiveExecution] = useState<TaskExecutionEntity | null>(null);
  const [loadingTask, setLoadingTask] = useState(true);

  const { progress, loading: loadingProgress } = useTaskProgress(
    taskIdNum,
    task?.completitionBy,
    task?.countGoal
  );

  const loadTask = useCallback(async () => {
    if (!taskId) return;
    setLoadingTask(true);
    try {
      const taskData = await getTaskById(taskIdNum);
      setTask(taskData);
      const active = await getActiveExecution(taskIdNum);
      setActiveExecution(active);
    } catch (error) {
      console.error("Error loading task:", error);
    } finally {
      setLoadingTask(false);
    }
  }, [taskId, getTaskById, taskIdNum, getActiveExecution]);

  useEffect(() => {
    loadTask();
  }, [loadTask]);

  const handleStartExecution = async () => {
    try {
      await startExecution(taskIdNum);
      refreshExecutions();
      const active = await getActiveExecution(taskIdNum);
      setActiveExecution(active);
    } catch (error) {
      Alert.alert(t("common.error"), t("common.error_save"));
    }
  };

  const handleStopExecution = async () => {
    if (!activeExecution?.id) return;
    try {
      await stopExecution(activeExecution.id);
      refreshExecutions();
      setActiveExecution(null);
    } catch (error) {
      Alert.alert(t("common.error"), t("common.error_save"));
    }
  };

  const handleDeleteExecution = (execution: TaskExecutionEntity) => {
    Alert.alert(
      t("task.delete_execution"),
      t("task.delete_confirm"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteExecution(execution.id!);
              refreshExecutions();
            } catch (err) {
              Alert.alert(t("common.error"), t("common.error_save"));
            }
          },
        },
      ]
    );
  };

  const handleDeleteTask = () => {
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
              await deleteTask(taskIdNum);
              router.back();
            } catch (err) {
              Alert.alert(t("common.error"), t("common.error_save"));
            }
          },
        },
      ]
    );
  };

  const handleEditTask = () => {
    const params = new URLSearchParams();
    params.set("projectId", projectId || "");
    params.set("taskId", taskId || "");
    router.push(`/modal/create?${params.toString()}`);
  };

  const handleOpenLocation = () => {
    if (!task.locationName) return;
    const encodedName = encodeURIComponent(task.locationName);
    const url = `https://www.google.com/maps/search/?api=1&query=${encodedName}`;
    Linking.openURL(url);
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  const formatDuration = (minutes: number | null) => {
    if (minutes === null) return "-";
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

  const loading = loadingTask || loadingExecutions || loadingProgress;

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!task) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: colors.background }]}>
        <MyText>Task not found</MyText>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={[styles.headerCard, { backgroundColor: colors.surface }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerInfo}>
            <MyText variant="h2" weight="bold">
              {task.title}
            </MyText>
            {task.dueDate && (
              <MyText variant="body" color="textMuted">
                {t("task.due_date_label")}: {new Date(task.dueDate).toLocaleDateString()}
              </MyText>
            )}
            {task.locationName && (
              <Pressable onPress={handleOpenLocation}>
                <MyText variant="caption" color="primary" style={{ textDecorationLine: "underline" }}>
                  {task.locationName}
                </MyText>
              </Pressable>
            )}
          </View>
          <View style={styles.headerActions}>
            <Pressable
              onPress={handleEditTask}
              style={[styles.actionButton, { backgroundColor: colors.hover }]}
            >
              <Ionicons name="pencil" size={18} color={colors.text} />
            </Pressable>
            <Pressable
              onPress={handleDeleteTask}
              style={[styles.actionButton, { backgroundColor: "#EF444420" }]}
            >
              <Ionicons name="trash" size={18} color="#EF4444" />
            </Pressable>
          </View>
        </View>

        {progress && (
          <View style={styles.progressSection}>
            <MyText variant="caption" weight="semi" style={styles.progressLabel}>
              {t("task.progress_label")}
            </MyText>
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
            <View style={styles.progressInfo}>
              <MyText variant="body" color={progress.isComplete ? "success" : "textMuted"}>
                {progress.completitionBy === 1
                  ? `${progress.progress}/${progress.goal} ${t("task.executions_count")}`
                  : `${formatDuration(progress.progress)}/${formatDuration(progress.goal)}`}
              </MyText>
              {progress.isComplete && (
                <View style={[styles.completeBadge, { backgroundColor: "#22C55E20" }]}>
                  <MyText variant="caption" weight="semi" style={{ color: "#22C55E" }}>
                    {t("task.complete")}
                  </MyText>
                </View>
              )}
            </View>
          </View>
        )}

        <Pressable
          onPress={activeExecution ? handleStopExecution : handleStartExecution}
          style={[
            styles.executionButton,
            { backgroundColor: activeExecution ? "#EF4444" : colors.primary },
          ]}
        >
          <Ionicons name={activeExecution ? "stop" : "play"} size={20} color={executionButtonTextColor} />
          <MyText variant="body" weight="semi" style={{ color: executionButtonTextColor, marginLeft: 8 }}>
            {activeExecution ? t("task.stop_execution") : t("task.start_execution")}
          </MyText>
        </Pressable>
      </View>

      <View style={styles.section}>
        <MyText variant="h2" weight="semi" style={styles.sectionTitle}>
          {t("task.executions_label")}
        </MyText>

        {executions.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <MyText variant="body" color="textMuted">
              {t("task.no_executions")}
            </MyText>
          </View>
        ) : (
          executions.map((execution) => (
            <View key={execution.id} style={[styles.executionCard, { backgroundColor: colors.surface }]}>
              <View style={styles.executionInfo}>
                <View style={styles.executionMain}>
                  <MyText variant="body" weight="semi">
                    {formatDateTime(execution.startTime)}
                  </MyText>
                  {execution.endTime && (
                    <MyText variant="caption" color="textMuted">
                      → {formatDateTime(execution.endTime)}
                    </MyText>
                  )}
                </View>
                <View style={styles.executionActions}>
                  <MyText variant="body" color={execution.endTime ? "success" : "textMuted"}>
                    {execution.endTime ? formatDuration(execution.durationMinutes) : t("task.incomplete")}
                  </MyText>
                  {execution.endTime && (
                    <Pressable
                      onPress={() => handleDeleteExecution(execution)}
                      style={[styles.smallActionButton, { backgroundColor: "#EF444420" }]}
                    >
                      <Ionicons name="trash" size={14} color="#EF4444" />
                    </Pressable>
                  )}
                </View>
              </View>
            </View>
          ))
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
  headerCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerInfo: {
    flex: 1,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 10,
    borderRadius: 8,
  },
  progressSection: {
    marginTop: 16,
    marginBottom: 16,
  },
  progressLabel: {
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  completeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  executionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  emptyState: {
    padding: 24,
    alignItems: "center",
    borderRadius: 12,
  },
  executionCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  executionInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  executionMain: {
    flex: 1,
  },
  executionActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  smallActionButton: {
    padding: 6,
    borderRadius: 6,
  },
});
