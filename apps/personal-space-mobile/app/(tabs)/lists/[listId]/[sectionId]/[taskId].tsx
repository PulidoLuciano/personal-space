import { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useCore } from "@/lib/core-context";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Spacing, BorderRadius } from "@/constants/spacing";
import type { Task, TaskWithProgress } from "personal-space-core";

interface TaskExecution {
  id: string;
  created_at: Date;
  updated_at: Date;
  is_deleted: boolean;
  ocurrence_date: Date | null;
  start_time: Date;
  end_time: Date | null;
  task_id: string;
}

export default function TaskDetailsScreen() {
  const { sectionId, taskId, occurrenceDate } = useLocalSearchParams<{
    listId: string;
    sectionId: string;
    taskId: string;
    occurrenceDate?: string;
  }>();
  const { core, isLoading: isCoreLoading, error: coreError } = useCore();
  const router = useRouter();

  const [task, setTask] = useState<TaskWithProgress | null>(null);
  const [fullTask, setFullTask] = useState<Task | null>(null);
  const [executions, setExecutions] = useState<TaskExecution[]>([]);
  const [, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!taskId || !core || !sectionId) return;
    try {
      const [taskWithProgress, fullTaskData] = await Promise.all([
        core.tasksService.getTasksBySection(sectionId, false),
        core.tasksService.getById(taskId),
      ]);
      
      const taskData = taskWithProgress.find((t) => t.id === taskId);
      setTask(taskData ?? null);
      setFullTask(fullTaskData);

      const occDate = occurrenceDate ? new Date(occurrenceDate) : taskData?.occurrence_date ?? null;
      if (occDate) {
        const executionsData = await core.tasksService.getExecutionsByTaskAndDate(
          taskId,
          occDate,
        ) as TaskExecution[];
        setExecutions(executionsData);
      }
    } catch (error) {
      console.error("Error loading task:", error);
    } finally {
      setIsLoading(false);
    }
  }, [core, taskId, sectionId, occurrenceDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleComplete = async () => {
    if (!task || !core) return;
    const isCompleted = task.progress >= task.objective;

    try {
      if (isCompleted) {
        await core.tasksService.startExecution(
          task.id,
          task.occurrence_date,
          true,
        );
      } else {
        const taskExecutions = await core.tasksService.getExecutionsByTaskAndDate(
          task.id,
          task.occurrence_date,
        );
        const incompleteExecution = taskExecutions.find((e) => !e.end_time);
        if (incompleteExecution) {
          await core.tasksService.stopExecution(incompleteExecution.id);
        }
      }
      loadData();
    } catch (error) {
      console.error("Error toggling task:", error);
      Alert.alert("Error", "Failed to update task");
    }
  };

  const handleDeleteTask = () => {
    if (!fullTask) return;
    Alert.alert(
      "Delete Task",
      `Are you sure you want to delete "${fullTask.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!core) return;
            try {
              await core.tasksService.delete(fullTask.id);
              router.back();
            } catch (error) {
              console.error("Error deleting task:", error);
              Alert.alert("Error", "Failed to delete task");
            }
          },
        },
      ],
    );
  };

  if (isCoreLoading) {
    return (
      <ThemedView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  if (coreError || !core) {
    return (
      <ThemedView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ThemedText type="defaultSemiBold">Failed to initialize</ThemedText>
        <ThemedText>{coreError?.message || "Unknown error"}</ThemedText>
      </ThemedView>
    );
  }

  if (!task) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Task not found</ThemedText>
      </ThemedView>
    );
  }

  const isCompleted = task.progress >= task.objective;

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <IconSymbol size={20} name="chevron.right" color="#2563eb" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <ThemedText type="title">{task.name}</ThemedText>
        </View>
        <TouchableOpacity onPress={handleDeleteTask} style={styles.deleteButton}>
          <IconSymbol size={18} name="trash" color="#dc2626" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <ThemedText type="subtitle">Progress</ThemedText>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(
                      (task.progress / task.objective) * 100,
                      100,
                    )}%`,
                  },
                ]}
              />
            </View>
            <ThemedText>
              {task.progress} / {task.objective}
            </ThemedText>
          </View>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              isCompleted && styles.toggleButtonCompleted,
            ]}
            onPress={handleToggleComplete}
          >
            <ThemedText
              type="defaultSemiBold"
              style={{ color: isCompleted ? "#16a34a" : "#fff" }}
            >
              {isCompleted ? "Completed" : "Mark Complete"}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {fullTask?.body && (
          <View style={styles.section}>
            <ThemedText type="subtitle">Description</ThemedText>
            <ThemedText style={styles.bodyText}>{fullTask.body}</ThemedText>
          </View>
        )}

        {fullTask?.location && (
          <View style={styles.section}>
            <ThemedText type="subtitle">Location</ThemedText>
            <ThemedText style={styles.bodyText}>{fullTask.location}</ThemedText>
          </View>
        )}

        {fullTask?.due_rule && (
          <View style={styles.section}>
            <ThemedText type="subtitle">Due Rule</ThemedText>
            <ThemedText style={styles.bodyText}>{fullTask.due_rule}</ThemedText>
          </View>
        )}

        {task.type && (
          <View style={styles.section}>
            <ThemedText type="subtitle">Type</ThemedText>
            <ThemedText style={styles.bodyText}>{task.type}</ThemedText>
          </View>
        )}

        {fullTask?.recurrency && (
          <View style={styles.section}>
            <ThemedText type="subtitle">Recurrency</ThemedText>
            <ThemedText style={styles.bodyText}>{fullTask.recurrency}</ThemedText>
          </View>
        )}

        <View style={styles.section}>
          <ThemedText type="subtitle">History</ThemedText>
          {executions.length === 0 ? (
            <ThemedText style={styles.bodyText}>No executions yet</ThemedText>
          ) : (
            executions.map((execution) => (
              <View key={execution.id} style={styles.executionItem}>
                <ThemedText type="default">
                  {execution.start_time
                    ? new Date(execution.start_time).toLocaleString()
                    : "In progress"}
                </ThemedText>
                {execution.end_time && (
                  <ThemedText type="default">
                    - {new Date(execution.end_time).toLocaleString()}
                  </ThemedText>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    paddingTop: 60,
  },
  backButton: {
    marginRight: Spacing.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerContent: { flex: 1 },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: { flex: 1, padding: Spacing.lg },
  section: {
    marginBottom: Spacing.xl,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.sm,
    gap: Spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#2563eb",
  },
  toggleButton: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: "#2563eb",
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  toggleButtonCompleted: {
    backgroundColor: "rgba(22, 163, 74, 0.1)",
  },
  bodyText: {
    marginTop: Spacing.xs,
  },
  executionItem: {
    marginTop: Spacing.xs,
  },
});