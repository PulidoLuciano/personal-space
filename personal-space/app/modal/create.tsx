import React, { useState, useMemo } from "react";
import { View, StyleSheet, Pressable, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { NodusLayout } from "@/components/ui/NodusLayout";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useProjects } from "@/hooks/useProjects";
import { useLocale } from "@/hooks/useLocale";
import { MyText } from "@/components/ui/MyText";
import {
  ProjectSelector,
  ProjectSelectorTrigger,
} from "@/components/ui/ProjectSelector";
import { TypeSelector, ElementType } from "@/components/ui/TypeSelector";
import { TypeSelectorTaskHabit, TaskHabitType } from "@/components/ui/TypeSelectorTaskHabit";
import { ProjectEntity } from "@/core/entities/ProjectEntity";
import { NoteForm } from "@/components/forms/NoteForm";
import { FinanceForm } from "@/components/forms/FinanceForm";
import { TaskForm } from "@/components/forms/TaskForm";
import { HabitForm } from "@/components/forms/HabitForm";

export default function CreateModal() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useLocale();
  const { projects } = useProjects();
  const { projectId, noteId, taskId, eventId, habitId, financeId } = useLocalSearchParams<{
    projectId?: string;
    noteId?: string;
    taskId?: string;
    eventId?: string;
    habitId?: string;
    financeId?: string;
  }>();

  const [selectorVisible, setSelectorVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectEntity | null>(
    null
  );
  const [selectedType, setSelectedType] = useState<ElementType>(noteId ? "note" : (financeId ? "finance" : (habitId ? "task" : "event")));
  const [taskHabitType, setTaskHabitType] = useState<TaskHabitType>(habitId ? "habit" : "task");

  const initialProject = useMemo(() => {
    if (!projectId) return null;
    return projects.find((p) => p.id?.toString() === projectId);
  }, [projects, projectId]);

  React.useEffect(() => {
    if (initialProject) {
      setSelectedProject(initialProject);
    }
  }, [initialProject]);

  const accentColor = selectedProject?.color;
  const isEditing = !!noteId || !!financeId || !!taskId || !!habitId;
  const isEditingTask = !!taskId;
  const isEditingHabit = !!habitId;
  const isAssociated = !!taskId || !!eventId || !!habitId;
  const showNoteForm = selectedType === "note" && selectedProject;
  const showFinanceForm = selectedType === "finance" && (selectedProject || isAssociated || financeId);
  const showTaskForm = (selectedType === "task" || isEditingTask) && selectedProject && taskHabitType === "task";
  const showHabitForm = (selectedType === "task" || isEditingHabit) && selectedProject && taskHabitType === "habit";

  const handleSave = () => {
    router.back();
  };

  const handleCancel = () => {
    setSelectedType("event");
  };

  return (
    <NodusLayout useSafeArea={true}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <MyText variant="h2" weight="bold">
            {isEditingHabit
              ? t("create.habit")
              : isEditingTask
              ? t("create.task")
              : isEditing
              ? selectedType === "note"
                ? t("create.note")
                : t("create.finance")
              : showNoteForm
              ? t("create.note")
              : showFinanceForm
              ? t("create.finance")
              : showTaskForm
              ? t("create.task")
              : showHabitForm
              ? t("create.habit")
              : t("common.save")}
          </MyText>

          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.closeButton,
              { backgroundColor: pressed ? colors.press : "transparent" },
            ]}
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </Pressable>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
          {!isEditing && !isAssociated && (
            <>
              <View style={styles.section}>
                <ProjectSelectorTrigger
                  selectedProject={selectedProject}
                  onPress={() => setSelectorVisible(true)}
                />
              </View>

              <View style={styles.section}>
                <TypeSelector
                  selectedType={selectedType}
                  onSelect={setSelectedType}
                  accentColor={accentColor}
                />
              </View>

              {selectedType === "task" && (
                <View style={styles.section}>
                  <TypeSelectorTaskHabit
                    selectedType={taskHabitType}
                    onSelect={setTaskHabitType}
                    accentColor={accentColor}
                  />
                </View>
              )}
            </>
          )}

          {showNoteForm && !financeId ? (
            <View style={styles.formContainer}>
              <NoteForm
                projectId={selectedProject?.id || parseInt(projectId!)}
                noteId={noteId ? parseInt(noteId) : undefined}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            </View>
          ) : showFinanceForm || financeId ? (
            <View style={styles.formContainer}>
              <FinanceForm
                projectId={selectedProject?.id || parseInt(projectId!)}
                taskId={taskId ? parseInt(taskId) : undefined}
                eventId={eventId ? parseInt(eventId) : undefined}
                habitId={habitId ? parseInt(habitId) : undefined}
                financeId={financeId ? parseInt(financeId) : undefined}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            </View>
          ) : showTaskForm || isEditingTask ? (
            <View style={styles.formContainer}>
              <TaskForm
                projectId={selectedProject?.id || parseInt(projectId!)}
                taskId={taskId ? parseInt(taskId) : undefined}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            </View>
) : showHabitForm ? (
            <View style={styles.formContainer}>
              <HabitForm
                projectId={selectedProject?.id || parseInt(projectId!)}
                habitId={habitId ? parseInt(habitId) : undefined}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            </View>
          ) : (
            <View style={styles.formPlaceholder}>
              <MyText variant="h2" weight="semi" color="textMuted">
                {t(`create.form_${selectedType}`)}
              </MyText>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {!isEditing && !isAssociated && (
        <ProjectSelector
          selectedProject={selectedProject}
          onSelect={setSelectedProject}
          visible={selectorVisible}
          onClose={() => setSelectorVisible(false)}
        />
      )}
    </NodusLayout>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 16,
  },
  formContainer: {
    flex: 1,
  },
  formPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
