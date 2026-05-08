import { useState, useCallback, useMemo } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  TextInput,
  useColorScheme,
} from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { CoreGate } from "@/components/CoreGate";
import { useCore } from "@/lib/core-context";
import { SectionContainer } from "@/components/SectionContainer";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ModalHeader } from "@/components/ui/ModalHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ThemedTextInput } from "@/components/ui/ThemedTextInput";
import { TaskForm } from "@/components/TaskForm";
import { GlobalStopwatchSheet } from "@/components/GlobalStopwatchSheet";
import { showErrorAlert } from "@/lib/errors";
import { Spacing, BorderRadius } from "@/constants/spacing";
import { Colors } from "@/constants/theme";
import type { Section, List, TaskWithProgress } from "personal-space-core";

interface TaskWithSection extends TaskWithProgress {
  section_id: string;
}

interface SectionWithTasks {
  section: Section;
  tasks: TaskWithSection[];
}

function SectionsScreenContent() {
  const { listId } = useLocalSearchParams<{ listId: string }>();
  const { core } = useCore();
  const router = useRouter();

  const [list, setList] = useState<List | null>(null);
  const [sectionsWithTasks, setSectionsWithTasks] = useState<
    SectionWithTasks[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateSectionModal, setShowCreateSectionModal] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    null,
  );
  const [movingTaskId, setMovingTaskId] = useState<string | null>(null);
  const [showEditSectionModal, setShowEditSectionModal] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editSectionName, setEditSectionName] = useState("");
  const [showStopwatchSheet, setShowStopwatchSheet] = useState(false);
  const [stopwatchInitialTask, setStopwatchInitialTask] =
    useState<TaskWithSection | null>(null);
  const [sectionPositions, setSectionPositions] = useState<
    Record<string, { y: number; height: number }>
  >({});
  const [searchQuery, setSearchQuery] = useState("");
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = Colors[isDark ? "dark" : "light"];

  const loadData = useCallback(async () => {
    if (!listId || !core) return;
    try {
      const [listData, sectionsData] = await Promise.all([
        core.listsService.getById(listId),
        core.sectionsService.getByListId(listId),
      ]);
      setList(listData);

      const sectionsWithTasksData = await Promise.all(
        sectionsData.map(async (section) => {
          const tasks = await core.tasksService.getTasksBySection(
            section.id,
            !listData.show_completed,
          );
          console.log(tasks);
          const tasksWithSection: TaskWithSection[] = tasks.map((task) => ({
            ...task,
            section_id: section.id,
          }));
          return { section, tasks: tasksWithSection };
        }),
      );
      setSectionsWithTasks(sectionsWithTasksData);
    } catch (error) {
      console.error("Error loading sections:", error);
    } finally {
      setIsLoading(false);
    }
  }, [core, listId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const handleToggleShowCompleted = async () => {
    if (!listId || !list || !core) return;
    try {
      await core.listsService.toggleShowCompleted(listId);
      setList({ ...list, show_completed: !list.show_completed });
      loadData();
    } catch (error) {
      console.error("Error toggling show completed:", error);
      showErrorAlert(error, "Failed to update settings");
    }
  };

  const handleCreateSection = async () => {
    if (!newSectionName.trim() || !listId || !core) {
      Alert.alert("Error", "Please enter a section name");
      return;
    }
    try {
      await core.sectionsService.create({
        name: newSectionName.trim(),
        list_id: listId,
      });
      setShowCreateSectionModal(false);
      setNewSectionName("");
      loadData();
    } catch (error) {
      console.error("Error creating section:", error);
      showErrorAlert(error, "Failed to create section");
    }
  };

  const handleCreateTask = async (taskData: {
    name: string;
    location: string | null;
    due_rule: string | null;
    type: "by time" | "by executions" | "note";
    objective: number;
    recurrency: string | null;
    section_id: string;
  }) => {
    if (!selectedSectionId || !core) {
      Alert.alert("Error", "Please select a section");
      return;
    }
    try {
      await core.tasksService.create({ ...taskData, body: null });
      setShowCreateTaskModal(false);
      setSelectedSectionId(null);
      loadData();
    } catch (error) {
      console.error("Error creating task:", error);
      showErrorAlert(error, "Failed to create task");
    }
  };

  const handleToggleTaskComplete = async (task: TaskWithSection) => {
    if (!core) return;
    const isCompleted = task.progress >= task.objective;

    if (task.type === "by executions") {
      const newSectionsWithTasks = sectionsWithTasks.map((swt) => ({
        ...swt,
        tasks: swt.tasks.map((t) =>
          t.id === task.id
            ? { ...t, progress: isCompleted ? t.progress - 1 : t.progress + 1 }
            : t,
        ),
      }));
      setSectionsWithTasks(newSectionsWithTasks);

      try {
        if (isCompleted) {
          const executions = await core.tasksService.getExecutionsByTaskAndDate(
            task.id,
            task.occurrence_date,
          );
          const lastExecution = executions[executions.length - 1];
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
        loadData();
      }
      return;
    }

    const newSectionsWithTasks = sectionsWithTasks.map((swt) => ({
      ...swt,
      tasks: swt.tasks.map((t) =>
        t.id === task.id
          ? { ...t, progress: isCompleted ? 0 : t.objective }
          : t,
      ),
    }));
    setSectionsWithTasks(newSectionsWithTasks);

    try {
      if (isCompleted) {
        await core.tasksService.startExecution(
          task.id,
          task.occurrence_date,
          true,
        );
      } else {
        const executions = await core.tasksService.getExecutionsByTaskAndDate(
          task.id,
          task.occurrence_date,
        );
        const incompleteExecution = executions.find((e) => !e.end_time);
        if (incompleteExecution) {
          await core.tasksService.stopExecution(incompleteExecution.id);
        }
      }
      loadData();
    } catch (error) {
      console.error("Error toggling task:", error);
      loadData();
    }
  };

  const handleTaskLongPress = (task: TaskWithSection) => {
    setMovingTaskId(task.id);
  };

  const handleDragStart = (taskId: string) => {
    setMovingTaskId(taskId);
  };

  const handleDragEnd = async (taskId: string, absoluteY: number) => {
    if (!core) return;

    const taskToMove = sectionsWithTasks
      .flatMap((swt) => swt.tasks)
      .find((t) => t.id === taskId);
    if (!taskToMove) {
      setMovingTaskId(null);
      return;
    }

    let targetSectionId: string | null = null;
    for (const [sectionId, pos] of Object.entries(sectionPositions)) {
      if (absoluteY >= pos.y && absoluteY <= pos.y + pos.height) {
        targetSectionId = sectionId;
        break;
      }
    }

    if (!targetSectionId) {
      setMovingTaskId(null);
      return;
    }

    if (taskToMove.section_id === targetSectionId) {
      setMovingTaskId(null);
      return;
    }

    const newSectionsWithTasks = sectionsWithTasks.map((swt) => ({
      ...swt,
      tasks:
        swt.section.id === targetSectionId
          ? [...swt.tasks, { ...taskToMove, section_id: targetSectionId }]
          : swt.tasks.filter((t) => t.id !== taskId),
    }));
    setSectionsWithTasks(newSectionsWithTasks);
    setMovingTaskId(null);

    try {
      await core.tasksService.update(taskId, {
        section_id: targetSectionId,
      });
    } catch (error) {
      console.error("Error moving task:", error);
      loadData();
    }
  };

  const handleSectionLayout = (
    sectionId: string,
    y: number,
    height: number,
  ) => {
    setSectionPositions((prev) => ({
      ...prev,
      [sectionId]: { y, height },
    }));
  };

  const handleSectionDrop = async (targetSectionId: string) => {
    if (!movingTaskId || !core) return;

    const taskToMove = sectionsWithTasks
      .flatMap((swt) => swt.tasks)
      .find((t) => t.id === movingTaskId);
    if (!taskToMove) {
      setMovingTaskId(null);
      return;
    }

    if (taskToMove.section_id === targetSectionId) {
      setMovingTaskId(null);
      return;
    }

    const newSectionsWithTasks = sectionsWithTasks.map((swt) => ({
      ...swt,
      tasks:
        swt.section.id === targetSectionId
          ? [...swt.tasks, { ...taskToMove, section_id: targetSectionId }]
          : swt.tasks.filter((t) => t.id !== movingTaskId),
    }));
    setSectionsWithTasks(newSectionsWithTasks);
    setMovingTaskId(null);

    try {
      await core.tasksService.update(movingTaskId, {
        section_id: targetSectionId,
      });
    } catch (error) {
      console.error("Error moving task:", error);
      loadData();
    }
  };

  const openCreateTaskModal = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    setShowCreateTaskModal(true);
  };

  const openEditSectionModal = (sectionId: string, sectionName: string) => {
    setEditingSectionId(sectionId);
    setEditSectionName(sectionName);
    setShowEditSectionModal(true);
  };

  const handleEditSection = async () => {
    if (!editSectionName.trim() || !editingSectionId || !core) {
      Alert.alert("Error", "Please enter a section name");
      return;
    }
    try {
      await core.sectionsService.update(editingSectionId, {
        name: editSectionName.trim(),
      });
      setShowEditSectionModal(false);
      setEditSectionName("");
      setEditingSectionId(null);
      loadData();
    } catch (error) {
      console.error("Error editing section:", error);
      showErrorAlert(error, "Failed to edit section");
    }
  };

  const handleDeleteSection = (sectionId: string, sectionName: string) => {
    Alert.alert(
      "Delete Section",
      `Are you sure you want to delete "${sectionName}"? This will also delete all tasks in this section.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!core) return;
            try {
              await core.sectionsService.delete(sectionId);
              loadData();
            } catch (error) {
              console.error("Error deleting section:", error);
              showErrorAlert(error, "Failed to delete section");
            }
          },
        },
      ],
    );
  };

  const handleAddToStopwatch = (task: TaskWithSection) => {
    setStopwatchInitialTask(task);
    setShowStopwatchSheet(true);
  };

  const filteredSectionsWithTasks = useMemo(() => {
    if (!searchQuery.trim()) return sectionsWithTasks;

    const query = searchQuery.toLowerCase();
    return sectionsWithTasks
      .map((swt) => ({
        ...swt,
        tasks: swt.tasks.filter(
          (task) =>
            task.name.toLowerCase().includes(query) ||
            (task.body && task.body.toLowerCase().includes(query)),
        ),
      }))
      .filter(
        (swt) =>
          swt.tasks.length > 0 ||
          swt.section.name.toLowerCase().includes(query),
      );
  }, [sectionsWithTasks, searchQuery]);

  const handleRandomTask = (sectionId: string) => {
    const section = sectionsWithTasks.find(
      (swt) => swt.section.id === sectionId,
    );
    if (!section || section.tasks.length === 0) return;

    const randomIndex = Math.floor(Math.random() * section.tasks.length);
    const randomTask = section.tasks[randomIndex];

    Alert.alert("Random Task", randomTask.name, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Go to task",
        onPress: () => {
          const params = randomTask.occurrence_date
            ? `?occurrenceDate=${randomTask.occurrence_date.toISOString()}`
            : "";
          router.push(
            `/lists/${listId}/${sectionId}/${randomTask.id}${params}`,
          );
        },
      },
    ]);
  };

  if (!list) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>List not found</ThemedText>
      </ThemedView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <IconSymbol size={20} name="chevron.right" color="#2563eb" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <ThemedText type="title">{list.name}</ThemedText>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              onPress={handleToggleShowCompleted}
              style={styles.headerButton}
            >
              <IconSymbol
                size={18}
                name={list.show_completed ? "eye" : "eye.slash"}
                color={list.show_completed ? "#2563eb" : "#999"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setShowCreateSectionModal(true)}
            >
              <ThemedText
                type="defaultSemiBold"
                style={{ color: "#fff", fontSize: 14 }}
              >
                Add
              </ThemedText>
              <IconSymbol
                size={16}
                name="plus"
                color="#fff"
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor: colors.surface,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.searchInputContainer,
              { backgroundColor: colors.borderLight },
            ]}
          >
            <IconSymbol
              size={18}
              name="magnifyingglass"
              color={colors.textSecondary}
            />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search tasks..."
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              clearButtonMode="while-editing"
            />
          </View>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
        >
          {filteredSectionsWithTasks.map((swt) => (
            <View key={swt.section.id}>
              <SectionContainer
                section={swt.section}
                tasks={swt.tasks}
                movingTaskId={movingTaskId}
                onAddTask={() => openCreateTaskModal(swt.section.id)}
                onEditSection={() =>
                  openEditSectionModal(swt.section.id, swt.section.name)
                }
                onDeleteSection={() =>
                  handleDeleteSection(swt.section.id, swt.section.name)
                }
                onTaskPress={(task) => {
                  const params = task.occurrence_date
                    ? `?occurrenceDate=${task.occurrence_date.toISOString()}`
                    : "";
                  router.push(
                    `/lists/${listId}/${swt.section.id}/${task.id}${params}`,
                  );
                }}
                onToggleTaskComplete={handleToggleTaskComplete}
                onTaskLongPress={handleTaskLongPress}
                onSectionPress={() => {}}
                onAddToStopwatch={handleAddToStopwatch}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onLayout={handleSectionLayout}
                onRandomTask={() => handleRandomTask(swt.section.id)}
              />
            </View>
          ))}
          {filteredSectionsWithTasks.length === 0 && !isLoading && (
            <EmptyState
              title={searchQuery ? "No matching tasks" : "No sections yet"}
              description={
                searchQuery
                  ? "Try a different search term"
                  : "Create your first section to organize tasks"
              }
            />
          )}
        </ScrollView>

        <Modal
          visible={showCreateSectionModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowCreateSectionModal(false)}
        >
          <ThemedView style={styles.modalContainer}>
            <ModalHeader
              title="New Section"
              onLeftPress={() => setShowCreateSectionModal(false)}
              rightLabel="Create"
              onRightPress={handleCreateSection}
            />
            <View style={styles.modalContent}>
              <ThemedText type="subtitle">Name</ThemedText>
              <ThemedTextInput
                placeholder="Section name"
                value={newSectionName}
                onChangeText={setNewSectionName}
                autoFocus
              />
            </View>
          </ThemedView>
        </Modal>

        <Modal
          visible={showEditSectionModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowEditSectionModal(false)}
        >
          <ThemedView style={styles.modalContainer}>
            <ModalHeader
              title="Edit Section"
              onLeftPress={() => setShowEditSectionModal(false)}
              rightLabel="Save"
              onRightPress={handleEditSection}
            />
            <View style={styles.modalContent}>
              <ThemedText type="subtitle">Name</ThemedText>
              <ThemedTextInput
                placeholder="Section name"
                value={editSectionName}
                onChangeText={setEditSectionName}
                autoFocus
              />
            </View>
          </ThemedView>
        </Modal>

        <Modal
          visible={showCreateTaskModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowCreateTaskModal(false)}
        >
          <ThemedView style={styles.modalContainer}>
            <TaskForm
              sectionId={selectedSectionId ?? ""}
              onSubmit={handleCreateTask}
              onCancel={() => {
                setShowCreateTaskModal(false);
                setSelectedSectionId(null);
              }}
            />
          </ThemedView>
        </Modal>

        <GlobalStopwatchSheet
          visible={showStopwatchSheet}
          onClose={() => {
            setShowStopwatchSheet(false);
            setStopwatchInitialTask(null);
          }}
          initialTaskId={stopwatchInitialTask?.id ?? null}
        />
      </ThemedView>
    </GestureHandlerRootView>
  );
}

export default function SectionsScreen() {
  return (
    <CoreGate>
      <SectionsScreenContent />
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
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: "#2563eb",
    borderRadius: BorderRadius.md,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Spacing.xs,
  },
  content: { flex: 1 },
  contentContainer: { padding: Spacing.lg, paddingTop: 0 },
  emptyContainer: { alignItems: "center", paddingTop: Spacing.xl * 2 },
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  modalContent: { padding: Spacing.lg },
  input: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.2)",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
    fontSize: 16,
  },
});
