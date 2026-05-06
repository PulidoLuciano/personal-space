import { useEffect, useState, useCallback } from "react";
import { StyleSheet, View, FlatList, TouchableOpacity, TextInput, Modal, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useCore } from "@/lib/core-context";
import { TaskItem } from "@/components/TaskItem";
import { IconSymbol } from "@/components/ui/icon-symbol";
import type { Section } from "personal-space-core";
import type { TaskWithProgress } from "personal-space-core";

export default function TasksScreen() {
  const { listId, sectionId } = useLocalSearchParams<{ listId: string; sectionId: string }>();
  const core = useCore();
  const router = useRouter();
  const [section, setSection] = useState<Section | null>(null);
  const [tasks, setTasks] = useState<TaskWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskBody, setNewTaskBody] = useState("");
  const [newTaskDue, setNewTaskDue] = useState("");

  const loadData = useCallback(async () => {
    if (!sectionId) return;
    try {
      const [sectionData, tasksData] = await Promise.all([
        core.sectionsService.getById(sectionId),
        core.tasksService.getTasksBySection(sectionId),
      ]);
      setSection(sectionData);
      setTasks(tasksData);
    } catch (error) {
      console.error("Error loading tasks:", error);
    } finally {
      setIsLoading(false);
    }
  }, [core, sectionId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateTask = async () => {
    if (!newTaskName.trim() || !sectionId) {
      Alert.alert("Error", "Please enter a task name");
      return;
    }
    try {
      await core.tasksService.create({
        name: newTaskName.trim(),
        body: newTaskBody.trim() || null,
        due_rule: newTaskDue.trim() || null,
        section_id: sectionId,
      });
      setShowCreateModal(false);
      setNewTaskName("");
      setNewTaskBody("");
      setNewTaskDue("");
      loadData();
    } catch (error) {
      console.error("Error creating task:", error);
      Alert.alert("Error", "Failed to create task");
    }
  };

  const handleToggleComplete = async (task: TaskWithProgress) => {
    try {
      const executions = await core.tasksService.getExecutionsByTaskAndDate(task.id, task.occurrence_date || undefined);
      if (executions && executions.length > 0 && !executions[0].end_time) {
        await core.tasksService.stopExecution(executions[0].id);
      } else {
        await core.tasksService.startExecution(task.id, task.occurrence_date || undefined);
      }
      loadData();
    } catch (error) {
      console.error("Error toggling task:", error);
    }
  };

  const renderItem = ({ item }: { item: TaskWithProgress }) => {
    const isCompleted = item.progress >= item.objective;
    return (
      <TaskItem
        name={item.name}
        body={null}
        dueDate={item.due_date}
        isCompleted={isCompleted}
        onPress={() => {}}
        onToggleComplete={() => handleToggleComplete(item)}
      />
    );
  };

  if (!section) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Section not found</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol size={24} name="chevron.right" color="#0a7ea4" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <ThemedText type="title">{section.name}</ThemedText>
        </View>
      </View>
      <FlatList
        data={tasks}
        renderItem={renderItem}
        keyExtractor={(item) => item.id + (item.occurrence_date?.toISOString() || "")}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <ThemedText type="subtitle">No tasks yet</ThemedText>
              <ThemedText>Create your first task</ThemedText>
            </View>
          ) : null
        }
      />
      <TouchableOpacity style={styles.fab} onPress={() => setShowCreateModal(true)}>
        <IconSymbol size={28} name="chevron.right" color="#fff" />
      </TouchableOpacity>

      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <ThemedView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
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
            <ThemedText type="subtitle">Notes (optional)</ThemedText>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add notes..."
              value={newTaskBody}
              onChangeText={setNewTaskBody}
              multiline
            />
            <ThemedText type="subtitle">Due (optional)</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="+1d 09:00:00"
              value={newTaskDue}
              onChangeText={setNewTaskDue}
            />
          </View>
        </ThemedView>
      </Modal>
    </ThemedView>
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
  list: { padding: 16, paddingTop: 0 },
  emptyContainer: { alignItems: "center", paddingTop: 40 },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#0a7ea4",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
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
  textArea: { height: 100, textAlignVertical: "top" },
});