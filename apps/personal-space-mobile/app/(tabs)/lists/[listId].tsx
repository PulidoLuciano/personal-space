import { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
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
  const [newTaskName, setNewTaskName] = useState("");
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

  const handleCreateTask = async () => {
    if (!newTaskName.trim() || !selectedSectionId || !core) {
      Alert.alert("Error", "Please enter a task name");
      return;
    }
    try {
      await core.tasksService.create({
        name: newTaskName.trim(),
        body: null,
        location: null,
        due_rule: null,
        type: "by executions",
        objective: 1,
        recurrency: null,
        section_id: selectedSectionId,
      });
      setShowCreateTaskModal(false);
      setNewTaskName("");
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
            <IconSymbol size={24} name="chevron.right" color="#0a7ea4" />
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
                size={20}
                name={list.show_completed ? "eye" : "eye.slash"}
                color={list.show_completed ? "#0a7ea4" : "#999"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setShowCreateSectionModal(true)}
            >
              <ThemedText type="link">Create</ThemedText>
              <IconSymbol size={20} name="plus" color="#0a7ea4" style={{ marginLeft: 4 }} />
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
            <View style={styles.emptyContainer}>
              <ThemedText type="subtitle">No sections yet</ThemedText>
              <ThemedText>Create your first section to organize tasks</ThemedText>
            </View>
          )}
        </ScrollView>

        <Modal
          visible={showCreateSectionModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowCreateSectionModal(false)}
        >
          <ThemedView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowCreateSectionModal(false)}>
                <ThemedText type="link">Cancel</ThemedText>
              </TouchableOpacity>
              <ThemedText type="defaultSemiBold">New Section</ThemedText>
              <TouchableOpacity onPress={handleCreateSection}>
                <ThemedText type="link">Create</ThemedText>
              </TouchableOpacity>
            </View>
            <View style={styles.modalContent}>
              <ThemedText type="subtitle">Name</ThemedText>
              <TextInput
                style={styles.input}
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
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowEditSectionModal(false)}>
                <ThemedText type="link">Cancel</ThemedText>
              </TouchableOpacity>
              <ThemedText type="defaultSemiBold">Edit Section</ThemedText>
              <TouchableOpacity onPress={handleEditSection}>
                <ThemedText type="link">Save</ThemedText>
              </TouchableOpacity>
            </View>
            <View style={styles.modalContent}>
              <ThemedText type="subtitle">Name</ThemedText>
              <TextInput
                style={styles.input}
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
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowCreateTaskModal(false)}>
                <ThemedText type="link">Cancel</ThemedText>
              </TouchableOpacity>
              <ThemedText type="defaultSemiBold">New Task</ThemedText>
              <TouchableOpacity onPress={handleCreateTask}>
                <ThemedText type="link">Create</ThemedText>
              </TouchableOpacity>
            </View>
            <View style={styles.modalContent}>
              <ThemedText type="subtitle">Name</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Task name"
                value={newTaskName}
                onChangeText={setNewTaskName}
                autoFocus
              />
            </View>
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
    padding: 16,
    paddingTop: 60,
  },
  backButton: { marginRight: 12 },
  headerContent: { flex: 1 },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  headerButton: {
    padding: 8,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  content: { flex: 1 },
  contentContainer: { padding: 16, paddingTop: 0 },
  emptyContainer: { alignItems: "center", paddingTop: 40 },
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  modalContent: { padding: 16 },
  input: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.2)",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 24,
    fontSize: 16,
  },
});