import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Markdown from "react-native-markdown-display";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { CoreGate } from "@/components/CoreGate";
import { useCore } from "@/lib/core-context";
import { IconSymbol, IconSymbolName } from "@/components/ui/icon-symbol";
import { Spacing, BorderRadius, FontSize } from "@/constants/spacing";
import { Colors } from "@/constants/theme";
import { TaskForm } from "@/components/TaskForm";
import { MarkdownEditor } from "@/components/MarkdownEditor";
import { GlobalStopwatchSheet } from "@/components/GlobalStopwatchSheet";
import { showErrorAlert } from "@/lib/errors";
import {
  formatRecurrency,
  formatSeconds,
  formatDueRule,
  formatDate,
  formatDateTime,
  formatDuration,
} from "@/lib/formatters";
import type { Task, TaskOccurrenceDetail } from "personal-space-core";

interface TaskExecution {
  id: string;
  updated_at: Date;
  is_deleted: boolean;
  ocurrence_date: Date | null;
  start_time: Date;
  end_time: Date | null;
  task_id: string;
}

interface DetailItemProps {
  icon: IconSymbolName;
  label: string;
  value: string;
  colors: typeof Colors.light;
}

function DetailItem({ icon, label, value, colors }: DetailItemProps) {
  return (
    <View style={styles.detailItem}>
      <View style={[styles.detailIcon, { backgroundColor: colors.tintLight }]}>
        <IconSymbol size={16} name={icon} color={colors.tint} />
      </View>
      <View style={styles.detailContent}>
        <ThemedText
          type="default"
          style={[styles.detailLabel, { color: colors.textSecondary }]}
        >
          {label}
        </ThemedText>
        <ThemedText type="defaultSemiBold" style={{ color: colors.text }}>
          {value}
        </ThemedText>
      </View>
    </View>
  );
}

interface ExecutionItemProps {
  execution: TaskExecution;
  colors: typeof Colors.light;
  onDelete: (id: string) => void;
  onUpdate: (execution: TaskExecution) => void;
}

function ExecutionItem({
  execution,
  colors,
  onDelete,
  onUpdate,
}: ExecutionItemProps) {
  return (
    <View
      style={[
        styles.executionCard,
        { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
      ]}
    >
      <View style={styles.executionHeader}>
        <View style={styles.executionTime}>
          <ThemedText type="defaultSemiBold">
            {execution.start_time
              ? formatDateTime(new Date(execution.start_time))
              : "In progress"}
          </ThemedText>
          {execution.end_time && (
            <>
              <ThemedText
                type="default"
                style={{ color: colors.textSecondary }}
              >
                {" "}
                -{" "}
              </ThemedText>
              <ThemedText type="defaultSemiBold">
                {formatDateTime(new Date(execution.end_time))}
              </ThemedText>
            </>
          )}
        </View>
        <View style={styles.executionActions}>
          <TouchableOpacity
            onPress={() => onUpdate(execution)}
            style={[
              styles.executionActionBtn,
              { backgroundColor: colors.tintLight },
            ]}
          >
            <IconSymbol size={14} name="pencil" color={colors.tint} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onDelete(execution.id)}
            style={[
              styles.executionActionBtn,
              { backgroundColor: colors.errorLight },
            ]}
          >
            <IconSymbol size={14} name="trash" color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
      {execution.end_time && execution.start_time && (
        <View
          style={[
            styles.executionDuration,
            { backgroundColor: colors.successLight },
          ]}
        >
          <ThemedText type="default" style={{ color: colors.success }}>
            Duration:{" "}
            {formatDuration(
              new Date(execution.start_time),
              new Date(execution.end_time),
            )}
          </ThemedText>
        </View>
      )}
    </View>
  );
}

function TaskDetailsScreenContent() {
  const { sectionId, taskId, occurrenceDate } = useLocalSearchParams<{
    listId: string;
    sectionId: string;
    taskId: string;
    occurrenceDate?: string;
  }>();
  const { core } = useCore();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = Colors[isDark ? "dark" : "light"];

  const [task, setTask] = useState<TaskOccurrenceDetail | null>(null);
  const [fullTask, setFullTask] = useState<Task | null>(null);
  const [executions, setExecutions] = useState<TaskExecution[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"description" | "history">(
    "description",
  );
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMarkdownEditor, setShowMarkdownEditor] = useState(false);
  const [editingExecution, setEditingExecution] =
    useState<TaskExecution | null>(null);
  const [showStopwatchSheet, setShowStopwatchSheet] = useState(false);
  const [editStartTime, setEditStartTime] = useState<Date | null>(null);
  const [editEndTime, setEditEndTime] = useState<Date | null>(null);
  const [startSeconds, setStartSeconds] = useState("0");
  const [endSeconds, setEndSeconds] = useState("0");
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const handleOpenLocation = (location: string) => {
    const encodedLocation = encodeURIComponent(location);
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
    Linking.openURL(googleMapsUrl).catch((err) =>
      console.error("Failed to open Google Maps:", err),
    );
  };

  const occDate = occurrenceDate ? new Date(occurrenceDate) : null;

  const loadData = useCallback(async () => {
    if (!taskId || !core || !sectionId) return;
    try {
      const [taskDetail, fullTaskData] = await Promise.all([
        core.tasksService.getTaskOccurrence(taskId, occDate),
        core.tasksService.getById(taskId),
      ]);

      setTask(taskDetail);
      setFullTask(fullTaskData);

      const execs = await core.tasksService.getExecutionsByTaskAndDate(
        taskId,
        occDate,
      );
      setExecutions(execs as TaskExecution[]);
    } catch (error) {
      console.error("Error loading task:", error);
    } finally {
      setPageLoading(false);
    }
  }, [core, taskId, sectionId, occDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleComplete = async () => {
    if (!task || !core) return;
    const isCompleted = task.progress >= task.objective;
    try {
      if (isCompleted) {
        const taskExecutions =
          await core.tasksService.getExecutionsByTaskAndDate(
            task.id,
            task.occurrence_date,
          );
        const lastExecution = taskExecutions[taskExecutions.length - 1];
        if (lastExecution) {
          await core.tasksService.deleteExecution(lastExecution.id);
        }
      } else {
        await core.tasksService.startExecution(
          task.id,
          task.occurrence_date,
          true,
        );
      }
      loadData();
    } catch (error) {
      console.error("Error toggling task:", error);
      showErrorAlert(error, "Failed to update task");
    }
  };

  const handleInstantExecution = async () => {
    if (!task || !core) return;
    try {
      await core.tasksService.startExecution(
        task.id,
        task.occurrence_date,
        true,
      );
      loadData();
    } catch (error) {
      console.error("Error executing task:", error);
      showErrorAlert(error, "Failed to execute task");
    }
  };

  const handleDeleteExecution = (executionId: string) => {
    Alert.alert(
      "Delete Execution",
      "Are you sure you want to delete this execution?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!core) return;
            try {
              await core.tasksService.deleteExecution(executionId);
              loadData();
            } catch (error) {
              console.error("Error deleting execution:", error);
              showErrorAlert(error, "Failed to delete execution");
            }
          },
        },
      ],
    );
  };

  const handleUpdateExecution = (execution: TaskExecution) => {
    setEditingExecution(execution);
    const startTime = new Date(execution.start_time);
    const endTime = execution.end_time
      ? new Date(execution.end_time)
      : new Date();
    setEditStartTime(startTime);
    setEditEndTime(endTime);
    setStartSeconds(startTime.getSeconds().toString());
    setEndSeconds(endTime.getSeconds().toString());
  };

  const handleSaveExecution = async () => {
    if (!core || !editingExecution || !editEndTime || !editStartTime) return;
    try {
      const startWithSeconds = new Date(editStartTime);
      startWithSeconds.setSeconds(parseInt(startSeconds, 10) || 0);
      const endWithSeconds = new Date(editEndTime);
      endWithSeconds.setSeconds(parseInt(endSeconds, 10) || 0);
      await core.tasksService.updateExecution(editingExecution.id, {
        start_time: startWithSeconds,
        end_time: endWithSeconds,
      });
      setEditingExecution(null);
      loadData();
    } catch (error) {
      console.error("Error updating execution:", error);
      showErrorAlert(error, "Failed to update execution");
    }
  };

  const handleDeleteTask = () => {
    if (!fullTask) return;
    const isRecurrent = !!fullTask.recurrency;
    if (isRecurrent && occDate) {
      Alert.alert(
        "Delete Occurrences",
        "Which occurrences should be deleted?",
        [
          {
            text: "This Only",
            style: "destructive",
            onPress: async () => {
              if (!core) return;
              try {
                await core.tasksService.delete(fullTask.id, occDate, "current");
                router.back();
              } catch (error) {
                console.error("Error deleting task:", error);
                showErrorAlert(error, "Failed to delete task");
              }
            },
          },
          {
            text: "This & Following",
            style: "destructive",
            onPress: async () => {
              if (!core) return;
              try {
                await core.tasksService.delete(
                  fullTask.id,
                  occDate,
                  "following",
                );
                router.back();
              } catch (error) {
                console.error("Error deleting task:", error);
                showErrorAlert(error, "Failed to delete task");
              }
            },
          },
          {
            text: "All",
            style: "destructive",
            onPress: async () => {
              if (!core) return;
              try {
                await core.tasksService.delete(fullTask.id);
                router.back();
              } catch (error) {
                console.error("Error deleting task:", error);
                showErrorAlert(error, "Failed to delete task");
              }
            },
          },
          { text: "Cancel", style: "cancel" },
        ],
      );
    } else {
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
                showErrorAlert(error, "Failed to delete task");
              }
            },
          },
        ],
      );
    }
  };

  const handleEditSubmit = async (data: {
    name: string;
    location: string | null;
    due_rule: string | null;
    type: "by time" | "by executions" | "note";
    objective: number;
    recurrency: string | null;
    section_id: string;
  }) => {
    if (!core || !task || !fullTask) return;
    try {
      const isRecurrent = !!fullTask.recurrency;
      if (isRecurrent && occDate) {
        Alert.alert(
          "Apply Changes To",
          "Which occurrences should this update apply to?",
          [
            {
              text: "This Only",
              onPress: async () => {
                console.log(occDate);
                await core.tasksService.update(
                  task.id,
                  data,
                  occDate,
                  "current",
                );
                setShowEditModal(false);
                loadData();
              },
            },
            {
              text: "This & Following",
              onPress: async () => {
                await core.tasksService.update(
                  task.id,
                  data,
                  occDate,
                  "following",
                );
                setShowEditModal(false);
                loadData();
              },
            },
            {
              text: "All",
              onPress: async () => {
                await core.tasksService.update(task.id, data);
                setShowEditModal(false);
                loadData();
              },
            },
            { text: "Cancel", style: "cancel" },
          ],
        );
      } else {
        await core.tasksService.update(task.id, data);
        setShowEditModal(false);
        loadData();
      }
    } catch (error) {
      console.error("Error updating task:", error);
      showErrorAlert(error, "Failed to update task");
    }
  };

  const handleSaveDescription = async (markdown: string) => {
    if (!core || !task) return;
    try {
      await core.tasksService.update(task.id, { body: markdown || null });
      setShowMarkdownEditor(false);
      loadData();
    } catch (error) {
      console.error("Error saving description:", error);
      showErrorAlert(error, "Failed to save description");
    }
  };

  if (pageLoading) {
    return (
      <ThemedView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ThemedText>Loading...</ThemedText>
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
    <ThemedView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View
        style={[
          styles.header,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerButton}
        >
          <IconSymbol size={20} name="chevron.right" color={colors.tint} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <ThemedText type="title" style={{ color: colors.text }}>
            {task.name}
          </ThemedText>
        </View>
        <TouchableOpacity
          onPress={() => setShowEditModal(true)}
          style={styles.headerButton}
        >
          <IconSymbol size={18} name="pencil" color={colors.tint} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleDeleteTask}
          style={styles.headerButton}
        >
          <IconSymbol size={18} name="trash" color={colors.error} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContent}>
        {task.location ||
        fullTask?.due_rule ||
        fullTask?.recurrency ||
        task.occurrence_date ? (
          <View
            style={[
              styles.detailsCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            {task.location && (
              <TouchableOpacity
                onPress={() => handleOpenLocation(task.location!)}
              >
                <DetailItem
                  icon="mappin"
                  label="Location"
                  value={task.location}
                  colors={colors}
                />
              </TouchableOpacity>
            )}
            {fullTask?.due_rule && (
              <DetailItem
                icon="calendar"
                label="Due"
                value={formatDueRule(fullTask.due_rule)}
                colors={colors}
              />
            )}
            {fullTask?.recurrency && (
              <DetailItem
                icon="repeat"
                label="Repeats"
                value={formatRecurrency(fullTask.recurrency)}
                colors={colors}
              />
            )}
            {task.occurrence_date && (
              <DetailItem
                icon="clock"
                label="Created at"
                value={formatDate(task.occurrence_date)}
                colors={colors}
              />
            )}
          </View>
        ) : null}

        {task.type !== "note" && (
          <View style={styles.progressSection}>
            {task.type === "by executions" && (
              <>
                <View style={styles.progressHeader}>
                  <ThemedText
                    type="defaultSemiBold"
                    style={{ color: colors.text }}
                  >
                    Progress
                  </ThemedText>
                  <ThemedText
                    type="default"
                    style={{ color: colors.textSecondary }}
                  >
                    {task.progress} / {task.objective}
                  </ThemedText>
                </View>
                <View
                  style={[
                    styles.progressBar,
                    { backgroundColor: colors.borderLight },
                  ]}
                >
                  <View
                    style={[
                      styles.progressFill,
                      {
                        backgroundColor: isCompleted
                          ? colors.success
                          : colors.tint,
                        width: `${Math.min((task.progress / task.objective) * 100, 100)}%`,
                      },
                    ]}
                  />
                </View>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor: isCompleted
                        ? colors.successLight
                        : colors.tint,
                    },
                  ]}
                  onPress={handleToggleComplete}
                >
                  <ThemedText
                    type="defaultSemiBold"
                    style={{ color: isCompleted ? colors.success : "#fff" }}
                  >
                    {isCompleted ? "Completed" : "Mark Complete"}
                  </ThemedText>
                </TouchableOpacity>
              </>
            )}

            {task.type === "by time" && (
              <>
                <View style={styles.progressHeader}>
                  <ThemedText
                    type="defaultSemiBold"
                    style={{ color: colors.text }}
                  >
                    Time
                  </ThemedText>
                  <ThemedText
                    type="default"
                    style={{ color: colors.textSecondary }}
                  >
                    {formatSeconds(task.progress)} /{" "}
                    {formatSeconds(task.objective)}
                  </ThemedText>
                </View>
                <View
                  style={[
                    styles.progressBar,
                    { backgroundColor: colors.borderLight },
                  ]}
                >
                  <View
                    style={[
                      styles.progressFill,
                      {
                        backgroundColor: isCompleted
                          ? colors.success
                          : colors.tint,
                        width: `${Math.min((task.progress / task.objective) * 100, 100)}%`,
                      },
                    ]}
                  />
                </View>
                <View style={styles.timeRemainingRow}>
                  <ThemedText
                    type="default"
                    style={{ color: colors.textSecondary }}
                  >
                    Remaining:{" "}
                    {formatSeconds(Math.max(task.objective - task.progress, 0))}
                  </ThemedText>
                </View>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor: colors.tintLight,
                      marginTop: Spacing.sm,
                    },
                  ]}
                  onPress={() => setShowStopwatchSheet(true)}
                >
                  <IconSymbol size={16} name="timer" color={colors.tint} />
                  <ThemedText
                    type="defaultSemiBold"
                    style={{ color: colors.tint, marginLeft: Spacing.xs }}
                  >
                    Start Stopwatch
                  </ThemedText>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        <View
          style={[
            styles.tabContainer,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View
            style={[styles.tabBar, { backgroundColor: colors.borderLight }]}
          >
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "description" && [
                  styles.tabActive,
                  { backgroundColor: colors.surface },
                ],
              ]}
              onPress={() => setActiveTab("description")}
            >
              <ThemedText
                type="defaultSemiBold"
                style={{
                  color:
                    activeTab === "description"
                      ? colors.tint
                      : colors.textSecondary,
                }}
              >
                Description
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "history" && [
                  styles.tabActive,
                  { backgroundColor: colors.surface },
                ],
              ]}
              onPress={() => setActiveTab("history")}
            >
              <ThemedText
                type="defaultSemiBold"
                style={{
                  color:
                    activeTab === "history"
                      ? colors.tint
                      : colors.textSecondary,
                }}
              >
                History
              </ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.tabContent}>
            {activeTab === "description" && (
              <View style={styles.descriptionSection}>
                {task.body ? (
                  <>
                    <View style={styles.descriptionActions}>
                      <TouchableOpacity
                        style={[
                          styles.descriptionEditBtn,
                          { backgroundColor: colors.tintLight },
                        ]}
                        onPress={() => setShowMarkdownEditor(true)}
                      >
                        <IconSymbol
                          size={14}
                          name="pencil"
                          color={colors.tint}
                        />
                        <ThemedText
                          type="defaultSemiBold"
                          style={{ color: colors.tint, marginLeft: Spacing.xs }}
                        >
                          Edit
                        </ThemedText>
                      </TouchableOpacity>
                    </View>
                    <Markdown
                      style={{
                        body: { color: colors.text, lineHeight: 24 },
                        heading1: {
                          color: colors.text,
                          borderBottomColor: colors.border,
                          borderBottomWidth: 1,
                          paddingBottom: Spacing.sm,
                          marginTop: Spacing.xl,
                          marginBottom: Spacing.sm,
                          lineHeight: 40,
                        },
                        heading2: {
                          color: colors.text,
                          borderBottomColor: colors.border,
                          borderBottomWidth: 1,
                          paddingBottom: Spacing.sm,
                          marginTop: Spacing.lg,
                          marginBottom: Spacing.sm,
                          lineHeight: 34,
                        },
                        heading3: {
                          color: colors.text,
                          marginTop: Spacing.lg,
                          marginBottom: Spacing.xs,
                          lineHeight: 30,
                        },
                        heading4: {
                          color: colors.text,
                          marginTop: Spacing.md,
                          marginBottom: Spacing.xs,
                          lineHeight: 26,
                        },
                        heading5: {
                          color: colors.text,
                          marginTop: Spacing.md,
                          marginBottom: Spacing.xs,
                          lineHeight: 24,
                        },
                        heading6: {
                          color: colors.text,
                          marginTop: Spacing.md,
                          marginBottom: Spacing.xs,
                          lineHeight: 24,
                        },
                        paragraph: {
                          marginTop: 0,
                          marginBottom: Spacing.sm,
                        },
                        link: { color: colors.tint },
                        blockquote: {
                          backgroundColor: colors.borderLight,
                          borderLeftColor: colors.tint,
                          borderLeftWidth: 4,
                          paddingVertical: Spacing.sm,
                          paddingHorizontal: Spacing.md,
                          marginVertical: Spacing.sm,
                          borderRadius: 4,
                        },
                        code_inline: {
                          backgroundColor: colors.borderLight,
                          color: colors.text,
                          paddingHorizontal: Spacing.xs,
                          borderRadius: 4,
                        },
                        code_block: {
                          backgroundColor: colors.borderLight,
                          color: colors.text,
                          padding: Spacing.md,
                          marginVertical: Spacing.sm,
                          borderRadius: 8,
                        },
                        fence: {
                          backgroundColor: colors.borderLight,
                          color: colors.text,
                          padding: Spacing.md,
                          marginVertical: Spacing.sm,
                          borderRadius: 8,
                        },
                        list_item: {
                          marginBottom: Spacing.xs,
                        },
                        ordered_list_icon: {
                          marginRight: Spacing.sm,
                        },
                        list_unordered_item_icon: {
                          marginRight: Spacing.sm,
                        },
                        table: {
                          borderColor: colors.border,
                          borderWidth: 1,
                          marginVertical: Spacing.sm,
                          borderRadius: 8,
                        },
                        th: {
                          borderColor: colors.border,
                          borderWidth: 1,
                          padding: Spacing.sm,
                          backgroundColor: colors.borderLight,
                        },
                        td: {
                          borderColor: colors.border,
                          borderWidth: 1,
                          padding: Spacing.sm,
                        },
                        hr: {
                          backgroundColor: colors.border,
                          marginVertical: Spacing.md,
                          height: 1,
                        },
                        image: {},
                      }}
                    >
                      {task.body}
                    </Markdown>
                  </>
                ) : (
                  <View
                    style={[
                      styles.emptyState,
                      { backgroundColor: colors.borderLight },
                    ]}
                  >
                    <ThemedText
                      type="default"
                      style={{
                        color: colors.textSecondary,
                        marginBottom: Spacing.md,
                      }}
                    >
                      No description
                    </ThemedText>
                    <TouchableOpacity
                      style={[
                        styles.descriptionEditBtn,
                        { backgroundColor: colors.tintLight },
                      ]}
                      onPress={() => setShowMarkdownEditor(true)}
                    >
                      <IconSymbol size={14} name="pencil" color={colors.tint} />
                      <ThemedText
                        type="defaultSemiBold"
                        style={{ color: colors.tint, marginLeft: Spacing.xs }}
                      >
                        Add description
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {activeTab === "history" && (
              <View style={styles.historySection}>
                {executions.length === 0 ? (
                  <View
                    style={[
                      styles.emptyState,
                      { backgroundColor: colors.borderLight },
                    ]}
                  >
                    <ThemedText
                      type="default"
                      style={{ color: colors.textSecondary }}
                    >
                      No executions yet
                    </ThemedText>
                  </View>
                ) : (
                  <>
                    <View
                      style={[
                        styles.totalTimeRow,
                        { backgroundColor: colors.successLight },
                      ]}
                    >
                      <ThemedText
                        type="defaultSemiBold"
                        style={{ color: colors.success }}
                      >
                        Total:{" "}
                        {formatSeconds(
                          executions.reduce((acc, ex) => {
                            if (ex.start_time && ex.end_time) {
                              return (
                                acc +
                                (new Date(ex.end_time).getTime() -
                                  new Date(ex.start_time).getTime()) /
                                  1000
                              );
                            }
                            return acc;
                          }, 0),
                        )}
                      </ThemedText>
                    </View>
                    {executions.map((execution) => (
                      <ExecutionItem
                        key={execution.id}
                        execution={execution}
                        colors={colors}
                        onDelete={handleDeleteExecution}
                        onUpdate={handleUpdateExecution}
                      />
                    ))}
                  </>
                )}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditModal(false)}
      >
        <ThemedView
          style={[
            styles.modalContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <TaskForm
            sectionId={sectionId ?? ""}
            initialData={{
              name: task.name,
              location: task.location,
              due_rule: fullTask?.due_rule ?? null,
              type: task.type,
              objective: task.objective,
              recurrency: fullTask?.recurrency ?? null,
            }}
            onSubmit={handleEditSubmit}
            onCancel={() => setShowEditModal(false)}
          />
        </ThemedView>
      </Modal>

      <Modal
        visible={!!editingExecution}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setEditingExecution(null);
          setShowStartDatePicker(false);
          setShowStartTimePicker(false);
          setShowEndDatePicker(false);
          setShowEndTimePicker(false);
        }}
      >
        <ThemedView
          style={[
            styles.modalContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <View style={styles.executionEditHeader}>
            <TouchableOpacity
              onPress={() => {
                setEditingExecution(null);
                setShowStartDatePicker(false);
                setShowStartTimePicker(false);
                setShowEndDatePicker(false);
                setShowEndTimePicker(false);
              }}
              style={styles.headerButton}
            >
              <IconSymbol size={20} name="chevron.right" color={colors.tint} />
            </TouchableOpacity>
            <ThemedText
              type="title"
              style={{
                color: colors.text,
                flex: 1,
                textAlign: "center",
                marginRight: 36,
              }}
            >
              Edit Execution
            </ThemedText>
          </View>

          <View style={styles.executionEditContent}>
            <View style={styles.field}>
              <ThemedText type="subtitle">Start Time</ThemedText>
              <View style={styles.dateTimeRow}>
                <TouchableOpacity
                  style={[
                    styles.dateButton,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.surface,
                    },
                  ]}
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <ThemedText type="default">
                    {editStartTime
                      ? editStartTime.toLocaleDateString()
                      : "Set date"}
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.dateButton,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.surface,
                    },
                  ]}
                  onPress={() => setShowStartTimePicker(true)}
                >
                  <ThemedText type="default">
                    {editStartTime
                      ? editStartTime.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Set time"}
                  </ThemedText>
                </TouchableOpacity>
                <TextInput
                  style={[
                    styles.secondsInput,
                    {
                      color: colors.text,
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                  placeholder="sec"
                  placeholderTextColor={colors.textTertiary}
                  value={startSeconds}
                  onChangeText={(text) =>
                    setStartSeconds(text.replace(/[^0-9]/g, ""))
                  }
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <View style={styles.field}>
              <ThemedText type="subtitle">End Time</ThemedText>
              <View style={styles.dateTimeRow}>
                <TouchableOpacity
                  style={[
                    styles.dateButton,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.surface,
                    },
                  ]}
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <ThemedText type="default">
                    {editEndTime
                      ? editEndTime.toLocaleDateString()
                      : "Set date"}
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.dateButton,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.surface,
                    },
                  ]}
                  onPress={() => setShowEndTimePicker(true)}
                >
                  <ThemedText type="default">
                    {editEndTime
                      ? editEndTime.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Set time"}
                  </ThemedText>
                </TouchableOpacity>
                <TextInput
                  style={[
                    styles.secondsInput,
                    {
                      color: colors.text,
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                  placeholder="sec"
                  placeholderTextColor={colors.textTertiary}
                  value={endSeconds}
                  onChangeText={(text) =>
                    setEndSeconds(text.replace(/[^0-9]/g, ""))
                  }
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <View style={styles.executionEditButtons}>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.cancelButton,
                  { borderColor: colors.border },
                ]}
                onPress={() => {
                  setEditingExecution(null);
                  setShowStartDatePicker(false);
                  setShowStartTimePicker(false);
                  setShowEndDatePicker(false);
                  setShowEndTimePicker(false);
                }}
              >
                <ThemedText
                  type="defaultSemiBold"
                  style={{ color: colors.text }}
                >
                  Cancel
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  !editEndTime && styles.buttonDisabled,
                  {
                    backgroundColor: editEndTime
                      ? colors.tint
                      : colors.borderLight,
                  },
                ]}
                onPress={handleSaveExecution}
                disabled={!editEndTime}
              >
                <ThemedText
                  type="defaultSemiBold"
                  style={{ color: editEndTime ? "#fff" : colors.textTertiary }}
                >
                  Save
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {showStartDatePicker && editStartTime && (
            <DateTimePicker
              value={editStartTime}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_, date) => {
                if (date) {
                  const newStart = new Date(date);
                  newStart.setHours(
                    editStartTime.getHours(),
                    editStartTime.getMinutes(),
                  );
                  setEditStartTime(newStart);
                }
                setShowStartDatePicker(Platform.OS === "ios");
                if (Platform.OS !== "ios") {
                  setShowStartDatePicker(false);
                }
              }}
            />
          )}

          {showStartTimePicker && editStartTime && (
            <DateTimePicker
              value={editStartTime}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_, date) => {
                if (date) {
                  const newStart = new Date(editStartTime);
                  newStart.setHours(date.getHours(), date.getMinutes());
                  setEditStartTime(newStart);
                }
                setShowStartTimePicker(Platform.OS === "ios");
                if (Platform.OS !== "ios") {
                  setShowStartTimePicker(false);
                }
              }}
            />
          )}

          {showEndDatePicker && editEndTime && (
            <DateTimePicker
              value={editEndTime}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_, date) => {
                if (date) {
                  const newEnd = new Date(date);
                  newEnd.setHours(
                    editEndTime.getHours(),
                    editEndTime.getMinutes(),
                  );
                  setEditEndTime(newEnd);
                }
                setShowEndDatePicker(Platform.OS === "ios");
                if (Platform.OS !== "ios") {
                  setShowEndDatePicker(false);
                }
              }}
            />
          )}

          {showEndTimePicker && editEndTime && (
            <DateTimePicker
              value={editEndTime}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_, date) => {
                if (date) {
                  const newEnd = new Date(editEndTime);
                  newEnd.setHours(date.getHours(), date.getMinutes());
                  setEditEndTime(newEnd);
                }
                setShowEndTimePicker(Platform.OS === "ios");
                if (Platform.OS !== "ios") {
                  setShowEndTimePicker(false);
                }
              }}
            />
          )}
        </ThemedView>
      </Modal>

      <GlobalStopwatchSheet
        visible={showStopwatchSheet}
        onClose={() => setShowStopwatchSheet(false)}
        initialTaskId={task.id}
      />

      <MarkdownEditor
        visible={showMarkdownEditor}
        initialValue={task.body ?? ""}
        onSave={handleSaveDescription}
        onCancel={() => setShowMarkdownEditor(false)}
      />
    </ThemedView>
  );
}

export default function TaskDetailsScreen() {
  return (
    <CoreGate>
      <TaskDetailsScreenContent />
    </CoreGate>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    paddingTop: 60,
    borderBottomWidth: 1,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerContent: { flex: 1, marginHorizontal: Spacing.md },
  scrollContent: { flex: 1 },
  detailsCard: {
    margin: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.md,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: FontSize.xs,
    lineHeight: 14,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 0,
  },
  progressSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: Spacing.md,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  actionButton: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  timeRemainingRow: {
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  totalTimeRow: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    alignSelf: "flex-start",
    marginBottom: Spacing.md,
  },
  tabContainer: {
    margin: Spacing.lg,
    marginTop: 0,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  tabBar: {
    flexDirection: "row",
    margin: Spacing.sm,
    borderRadius: BorderRadius.md,
    padding: Spacing.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: "center",
    borderRadius: BorderRadius.sm,
  },
  tabActive: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabContent: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
  },
  descriptionSection: {},
  descriptionActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: Spacing.md,
  },
  descriptionEditBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  historySection: {
    gap: Spacing.md,
  },
  executionCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  executionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  executionTime: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  executionActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  executionActionBtn: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  executionDuration: {
    marginTop: Spacing.sm,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.xs,
    alignSelf: "flex-start",
  },
  emptyState: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
  },
  editExecutionOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  editExecutionModal: {
    width: "85%",
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  editExecutionSave: {
    width: "100%",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    marginTop: Spacing.md,
  },
  editExecutionCancel: {
    width: "100%",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    marginTop: Spacing.sm,
    borderWidth: 1,
  },
  executionEditHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  executionEditContent: {
    padding: Spacing.lg,
  },
  field: {
    marginBottom: Spacing.xl,
  },
  dateTimeRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  dateButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: "center",
  },
  secondsInput: {
    width: 60,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: "center",
    fontSize: FontSize.md,
  },
  executionEditButtons: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    borderWidth: 1,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
