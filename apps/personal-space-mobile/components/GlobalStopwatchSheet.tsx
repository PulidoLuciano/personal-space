import { useState, useEffect, useCallback, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
  TextInput,
  FlatList,
  Dimensions,
} from "react-native";
import { Colors } from "@/constants/theme";
import { Spacing, BorderRadius } from "@/constants/spacing";
import { ThemedText } from "./themed-text";
import { IconSymbol } from "./ui/icon-symbol";
import { useCore } from "@/lib/core-context";
import type { TaskWithListInfo } from "personal-space-core";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface RunningExecution {
  executionId: string;
  taskId: string;
  taskName: string;
  taskType: "by time" | "by executions" | "note";
  taskObjective: number;
  startTime: Date;
}

interface GlobalStopwatchSheetProps {
  visible: boolean;
  onClose: () => void;
}

const getTaskTypeIcon = (type: "by time" | "by executions" | "note") => {
  switch (type) {
    case "by time":
      return "timer";
    case "by executions":
      return "arrow.2.circlepath";
    case "note":
      return "note.text";
  }
};

const getTaskTypeLabel = (type: "by time" | "by executions" | "note") => {
  switch (type) {
    case "by time":
      return "Time";
    case "by executions":
      return "Count";
    case "note":
      return "Note";
  }
};

export function GlobalStopwatchSheet({
  visible,
  onClose,
}: GlobalStopwatchSheetProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const { core } = useCore();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TaskWithListInfo[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<TaskWithListInfo[]>([]);
  const [runningExecutions, setRunningExecutions] = useState<RunningExecution[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (visible && core) {
      loadRunningExecutions();
    }
  }, [visible, core]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning]);

  const loadRunningExecutions = async () => {
    if (!core) return;
    try {
      const executions = await core.tasksService.getRunningExecutions();
      setRunningExecutions(
        executions.map((e) => ({
          executionId: e.id,
          taskId: e.task_id,
          taskName: e.taskName,
          taskType: e.taskType as "by time" | "by executions" | "note",
          taskObjective: e.taskObjective,
          startTime: new Date(e.start_time),
        }))
      );
      if (executions.length > 0) {
        const startTime = new Date(executions[0].start_time).getTime();
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
        setIsRunning(true);
      }
    } catch (error) {
      console.error("Error loading running executions:", error);
    }
  };

  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);
      if (!core || query.length < 2) {
        setSearchResults([]);
        return;
      }
      try {
        const results = await core.tasksService.searchTasksWithListInfo(query);
        setSearchResults(results);
      } catch (error) {
        console.error("Error searching tasks:", error);
      }
    },
    [core]
  );

  const handleSelectTask = (task: TaskWithListInfo) => {
    if (runningExecutions.some((e) => e.taskId === task.id)) {
      return;
    }
    if (!selectedTasks.some((t) => t.id === task.id)) {
      setSelectedTasks([...selectedTasks, task]);
    }
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleRemoveSelected = (taskId: string) => {
    setSelectedTasks(selectedTasks.filter((t) => t.id !== taskId));
  };

  const handleStartStopwatch = async () => {
    if (!core) return;

    if (isRunning) {
      const executionIds = runningExecutions.map((e) => e.executionId);
      await core.tasksService.stopMultipleExecutions(executionIds);
      setRunningExecutions([]);
      setIsRunning(false);
      setElapsedTime(0);
      return;
    }

    const taskIds = selectedTasks.map((t) => t.id);
    if (taskIds.length === 0) return;

    try {
      const results = await core.tasksService.startMultipleExecutions(taskIds);
      const newExecutions: RunningExecution[] = results.map((r) => {
        const task = selectedTasks.find((t) => t.id === r.taskId)!;
        return {
          executionId: r.executionId,
          taskId: r.taskId,
          taskName: task.name,
          taskType: task.type,
          taskObjective: task.objective,
          startTime: new Date(),
        };
      });
      setRunningExecutions(newExecutions);
      setSelectedTasks([]);
      setIsRunning(true);
      setElapsedTime(0);
    } catch (error) {
      console.error("Error starting executions:", error);
    }
  };

  const handleAddTaskWhileRunning = async () => {
    if (!core) return;

    if (isRunning) {
      const executionIds = runningExecutions.map((e) => e.executionId);
      await core.tasksService.stopMultipleExecutions(executionIds);
    }

    setRunningExecutions([]);
    setIsRunning(false);
    setElapsedTime(0);
  };

  const handleStopIndividual = async (executionId: string) => {
    if (!core) return;
    try {
      await core.tasksService.stopExecution(executionId);
      setRunningExecutions(runningExecutions.filter((e) => e.executionId !== executionId));
      if (runningExecutions.length === 1) {
        setIsRunning(false);
        setElapsedTime(0);
      }
    } catch (error) {
      console.error("Error stopping execution:", error);
    }
  };

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatExecutionTime = (startTime: Date): number => {
    return Math.floor((Date.now() - startTime.getTime()) / 1000);
  };

  if (!visible) return null;

  const showAddPrompt = isRunning && selectedTasks.length > 0;

  return (
    <View style={styles.overlay}>
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />
      <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <View style={styles.headerTitle}>
            <IconSymbol size={24} name="timer" color={colors.tint} />
            <ThemedText type="title" style={styles.headerTitleText}>Stopwatch</ThemedText>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <IconSymbol size={20} name="xmark" color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.timerContainer}>
          <Text style={[styles.timerText, { color: isRunning ? colors.tint : colors.text }]}>
            {formatTime(elapsedTime)}
          </Text>
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: isRunning
                  ? colors.error
                  : selectedTasks.length > 0
                  ? colors.success
                  : colors.borderLight,
              },
            ]}
            onPress={handleStartStopwatch}
            disabled={selectedTasks.length === 0 && !isRunning}
          >
            <IconSymbol
              size={24}
              name={isRunning ? "stop.fill" : "play.fill"}
              color={isRunning ? "#fff" : selectedTasks.length > 0 ? "#fff" : colors.textTertiary}
            />
            <Text
              style={[
                styles.actionButtonText,
                {
                  color:
                    isRunning
                      ? "#fff"
                      : selectedTasks.length > 0
                      ? "#fff"
                      : colors.textTertiary,
                },
              ]}
            >
              {isRunning ? "Stop All" : "Start"}
            </Text>
          </TouchableOpacity>
        </View>

        {showAddPrompt && (
          <TouchableOpacity
            style={[styles.addPrompt, { backgroundColor: colors.warningLight }]}
            onPress={handleAddTaskWhileRunning}
          >
            <IconSymbol size={16} name="exclamationmark.triangle" color={colors.warning} />
            <Text style={[styles.addPromptText, { color: colors.warning }]}>
              Stopwatch running. Tap to stop and add new task
            </Text>
          </TouchableOpacity>
        )}

        {isRunning && runningExecutions.length > 0 && (
          <View style={styles.runningSection}>
            <View style={styles.sectionHeader}>
              <IconSymbol size={18} name="waveform" color={colors.tint} />
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                Running Tasks
              </ThemedText>
              <View style={[styles.badge, { backgroundColor: colors.tintLight }]}>
                <ThemedText type="subtitle" style={{ color: colors.tint, fontSize: 12 }}>
                  {runningExecutions.length}
                </ThemedText>
              </View>
            </View>
            <FlatList
              data={runningExecutions}
              keyExtractor={(item) => item.executionId}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.runningItem,
                    { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
                  ]}
                >
                  <View style={[styles.runningIcon, { backgroundColor: colors.tintLight }]}>
                    <IconSymbol size={16} name={getTaskTypeIcon(item.taskType)} color={colors.tint} />
                  </View>
                  <View style={styles.runningItemInfo}>
                    <ThemedText type="defaultSemiBold" numberOfLines={1}>
                      {item.taskName}
                    </ThemedText>
                    <View style={styles.runningItemMeta}>
                      <ThemedText type="subtitle" style={{ color: colors.textSecondary, fontSize: 12 }}>
                        {item.taskType === "by time"
                          ? formatTime(formatExecutionTime(item.startTime))
                          : `${formatExecutionTime(item.startTime)}s`}
                      </ThemedText>
                      <View style={[styles.typeBadge, { backgroundColor: colors.borderLight }]}>
                        <ThemedText type="subtitle" style={{ color: colors.textTertiary, fontSize: 10 }}>
                          {getTaskTypeLabel(item.taskType)}
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[styles.stopButton, { backgroundColor: colors.errorLight }]}
                    onPress={() => handleStopIndividual(item.executionId)}
                  >
                    <IconSymbol size={14} name="stop.fill" color={colors.error} />
                  </TouchableOpacity>
                </View>
              )}
              style={styles.runningList}
              scrollEnabled={false}
            />
          </View>
        )}

        <View style={styles.searchSection}>
          <View style={styles.sectionHeader}>
            <IconSymbol size={18} name="plus.circle" color={colors.textSecondary} />
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Add Tasks
            </ThemedText>
          </View>
          
          <View style={[styles.searchInputContainer, { borderColor: colors.border }]}>
            <IconSymbol size={18} name="magnifyingglass" color={colors.textTertiary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search tasks by name..."
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={handleSearch}
              onFocus={() => {
                if (searchQuery.length >= 2 && searchResults.length === 0) {
                  handleSearch(searchQuery);
                }
              }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => { setSearchQuery(""); setSearchResults([]); }}>
                <IconSymbol size={16} name="xmark.circle.fill" color={colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>

          {searchResults.length > 0 && (
            <View style={[styles.searchResults, { borderColor: colors.border }]}>
              {searchResults.slice(0, 5).map((task) => (
                <TouchableOpacity
                  key={task.id}
                  style={[styles.searchResultItem, { borderBottomColor: colors.borderLight }]}
                  onPress={() => handleSelectTask(task)}
                >
                  <View style={[styles.listColorDot, { backgroundColor: task.list_color }]} />
                  <View style={styles.searchResultInfo}>
                    <ThemedText type="defaultSemiBold" numberOfLines={1} style={styles.taskTitle}>
                      {task.name}
                    </ThemedText>
                    <View style={styles.taskMeta}>
                      <ThemedText type="subtitle" style={styles.taskMetaText}>
                        {task.list_name}
                      </ThemedText>
                      <Text style={[styles.metaSeparator, { color: colors.textTertiary }]}>•</Text>
                      <ThemedText type="subtitle" style={styles.taskMetaText}>
                        {task.section_name}
                      </ThemedText>
                    </View>
                  </View>
                  <View style={[styles.typeIconSmall, { backgroundColor: colors.tintLight }]}>
                    <IconSymbol size={12} name={getTaskTypeIcon(task.type)} color={colors.tint} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {selectedTasks.length > 0 && (
            <View style={styles.selectedSection}>
              <View style={styles.sectionHeader}>
                <IconSymbol size={18} name="checkmark.circle" color={colors.success} />
                <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                  Selected ({selectedTasks.length})
                </ThemedText>
              </View>
              <View style={styles.selectedList}>
                {selectedTasks.map((task) => (
                  <View
                    key={task.id}
                    style={[
                      styles.selectedItem,
                      { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
                    ]}
                  >
                    <View style={styles.selectedItemInfo}>
                      <View style={[styles.listColorDot, { backgroundColor: task.list_color }]} />
                      <View style={styles.selectedItemContent}>
                        <ThemedText type="defaultSemiBold" numberOfLines={1} style={styles.taskTitle}>
                          {task.name}
                        </ThemedText>
                        <View style={styles.taskMeta}>
                          <ThemedText type="subtitle" style={styles.taskMetaText}>
                            {task.list_name}
                          </ThemedText>
                          <Text style={[styles.metaSeparator, { color: colors.textTertiary }]}>•</Text>
                          <ThemedText type="subtitle" style={styles.taskMetaText}>
                            {task.section_name}
                          </ThemedText>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={[styles.removeButton, { backgroundColor: colors.errorLight }]}
                      onPress={() => handleRemoveSelected(task.id)}
                    >
                      <IconSymbol size={14} name="xmark" color={colors.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    height: SCREEN_HEIGHT * 0.8,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#d1d5db",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  headerTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  headerTitleText: {
    fontSize: 22,
  },
  closeButton: {
    padding: Spacing.sm,
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: Spacing.xxl,
  },
  timerText: {
    fontSize: 56,
    fontWeight: "300",
    fontVariant: ["tabular-nums"],
    marginBottom: Spacing.lg,
    letterSpacing: 2,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
  },
  actionButtonText: {
    fontSize: 17,
    fontWeight: "600",
  },
  addPrompt: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  addPromptText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
  },
  searchSection: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    flex: 1,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  searchResults: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  listColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.md,
  },
  searchResultInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    marginBottom: 2,
  },
  taskMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  taskMetaText: {
    fontSize: 12,
    color: "#6b7280",
  },
  metaSeparator: {
    marginHorizontal: 6,
    fontSize: 10,
  },
  typeIconSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedSection: {
    marginTop: Spacing.lg,
  },
  selectedList: {
    gap: Spacing.sm,
  },
  selectedItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  selectedItemInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: Spacing.sm,
  },
  selectedItemContent: {
    flex: 1,
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  runningSection: {
    marginBottom: Spacing.lg,
  },
  runningList: {
    maxHeight: 180,
  },
  runningItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  runningIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  runningItemInfo: {
    flex: 1,
  },
  runningItemMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: Spacing.sm,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  stopButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});