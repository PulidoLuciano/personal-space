import { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useCore } from "@/lib/core-context";
import { SectionContainer } from "@/components/SectionContainer";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ModalHeader } from "@/components/ui/ModalHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ThemedTextInput } from "@/components/ui/ThemedTextInput";
import { TaskForm } from "@/components/TaskForm";
import { Spacing, BorderRadius } from "@/constants/spacing";
import type { Section, List, TaskWithProgress } from "personal-space-core";

interface TaskWithSection extends TaskWithProgress {
  section_id: string;
}

interface SectionWithTasks {
  section: Section;
  tasks: TaskWithSection[];
}

export default function SectionsScreen() {
  const { listId } = useLocalSearchParams<{ listId: string }>();
  const { core, isLoading: isCoreLoading, error: coreError } = useCore();
  const router = useRouter();
  
  const [list, setList] = useState<List | null>(null);
  const [sectionsWithTasks, setSectionsWithTasks] = useState<SectionWithTasks[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateSectionModal, setShowCreateSectionModal] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [movingTaskId, setMovingTaskId] = useState<string | null>(null);
  const [showEditSectionModal, setShowEditSectionModal] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editSectionName, setEditSectionName] = useState("");

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
            !listData.show_completed
          );
          const tasksWithSection: TaskWithSection[] = tasks.map((task) => ({
            ...task,
            section_id: section.id,
          }));
          return { section, tasks: tasksWithSection };
        })
      );
      setSectionsWithTasks(sectionsWithTasksData);
    } catch (error) {
      console.error("Error loading sections:", error);
    } finally {
      setIsLoading(false);
    }
  }, [core, listId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleShowCompleted = async () => {
    if (!listId || !list || !core) return;
    try {
      await core.listsService.toggleShowCompleted(listId);
      setList({ ...list, show_completed: !list.show_completed });
      loadData();
    } catch (error) {
      console.error("Error toggling show completed:", error);
      Alert.alert("Error", "Failed to update settings");
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
      Alert.alert("Error", "Failed to create section");
    }
  };

  const handleCreateTask = async (taskData: {
    name: string;
    body: string | null;
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
      await core.tasksService.create(taskData);
      setShowCreateTaskModal(false);
      setSelectedSectionId(null);
      loadData();
    } catch (error) {
      console.error("Error creating task:", error);
      Alert.alert("Error", "Failed to create task");
    }
  };

  const handleToggleTaskComplete = async (task: TaskWithSection) => {
    if (!core) return;
    const isCompleted = task.progress >= task.objective;
    const newSectionsWithTasks = sectionsWithTasks.map((swt) => ({
      ...swt,
      tasks: swt.tasks.map((t) =>
        t.id === task.id
          ? {
              ...t,
              progress: isCompleted ? 0 : t.objective,
            }
          : t
      ),
    }));
    setSectionsWithTasks(newSectionsWithTasks);

    try {
      if (isCompleted) {
        await core.tasksService.startExecution(task.id, task.occurrence_date, true);
      } else {
        const executions = await core.tasksService.getExecutionsByTaskAndDate(
          task.id,
          task.occurrence_date
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
      await core.tasksService.update(movingTaskId, { section_id: targetSectionId });
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
      Alert.alert("Error", "Failed to edit section");
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
              Alert.alert("Error", "Failed to delete section");
            }
          },
        },
      ]
    );
  };

  if (isCoreLoading) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  if (coreError || !core) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ThemedText type="defaultSemiBold">Failed to initialize</ThemedText>
        <ThemedText>{coreError?.message || "Unknown error"}</ThemedText>
      </ThemedView>
    );
  }

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
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
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
              <ThemedText type="defaultSemiBold" style={{ color: "#fff", fontSize: 14 }}>Add</ThemedText>
              <IconSymbol size={16} name="plus" color="#fff" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
        >
          {sectionsWithTasks.map((swt) => (
            <View key={swt.section.id}>
              <SectionContainer
                section={swt.section}
                tasks={swt.tasks}
                movingTaskId={movingTaskId}
                onAddTask={() => openCreateTaskModal(swt.section.id)}
                onEditSection={() => openEditSectionModal(swt.section.id, swt.section.name)}
                onDeleteSection={() => handleDeleteSection(swt.section.id, swt.section.name)}
                onTaskPress={(task) =>
                  router.push(`/lists/${listId}/${swt.section.id}`)
                }
                onToggleTaskComplete={handleToggleTaskComplete}
                onTaskLongPress={handleTaskLongPress}
                onSectionPress={() => handleSectionDrop(swt.section.id)}
              />
            </View>
          ))}
          {sectionsWithTasks.length === 0 && !isLoading && (
            <EmptyState
              title="No sections yet"
              description="Create your first section to organize tasks"
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
      </ThemedView>
    </GestureHandlerRootView>
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