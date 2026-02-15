import React, { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Modal,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { useLocale } from "@/hooks/useLocale";
import { useProjects } from "@/hooks/useProjects";
import { MyText } from "./MyText";
import { MyInput } from "./MyInput";
import { ProjectEntity } from "@/core/entities/ProjectEntity";

interface ProjectSelectorProps {
  selectedProject: ProjectEntity | null;
  onSelect: (project: ProjectEntity) => void;
  visible: boolean;
  onClose: () => void;
}

export const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  selectedProject,
  onSelect,
  visible,
  onClose,
}) => {
  const { colors } = useTheme();
  const { t } = useLocale();
  const { projects, loading } = useProjects();
  const [search, setSearch] = useState("");

  const filteredProjects = useMemo(() => {
    if (!search.trim()) return projects;
    const lowerSearch = search.toLowerCase();
    return projects.filter((p) =>
      p.name.toLowerCase().includes(lowerSearch)
    );
  }, [projects, search]);

  const handleSelect = (project: ProjectEntity) => {
    onSelect(project);
    onClose();
    setSearch("");
  };

  const renderProject = ({ item }: { item: ProjectEntity }) => (
    <Pressable
      onPress={() => handleSelect(item)}
      style={[
        styles.projectItem,
        {
          backgroundColor: colors.surface,
          borderBottomColor: colors.hover,
        },
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: item.color + "20" },
        ]}
      >
        <Ionicons
          name={(item.icon as any) || "folder"}
          size={20}
          color={item.color}
        />
      </View>
      <MyText weight="semi" style={styles.projectName}>
        {item.name}
      </MyText>
    </Pressable>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.content, { backgroundColor: colors.background }]}>
          <View style={styles.header}>
            <MyText variant="h2" weight="bold">
              {t("create.select_project")}
            </MyText>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>

          <MyInput
            placeholder={t("create.search_project")}
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />

          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <FlatList
              data={filteredProjects}
              keyExtractor={(item) => item.id?.toString() || item.name}
              renderItem={renderProject}
              ListEmptyComponent={
                <MyText color="textMuted" style={styles.empty}>
                  {t("projects.empty_list")}
                </MyText>
              }
              contentContainerStyle={styles.list}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

interface ProjectSelectorTriggerProps {
  selectedProject: ProjectEntity | null;
  onPress: () => void;
}

export const ProjectSelectorTrigger: React.FC<ProjectSelectorTriggerProps> = ({
  selectedProject,
  onPress,
}) => {
  const { colors } = useTheme();
  const { t } = useLocale();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.trigger,
        {
          backgroundColor: colors.surface,
          borderColor: colors.hover,
        },
      ]}
    >
      {selectedProject ? (
        <>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: selectedProject.color + "20" },
            ]}
          >
            <Ionicons
              name={(selectedProject.icon as any) || "folder"}
              size={18}
              color={selectedProject.color}
            />
          </View>
          <MyText weight="semi" style={styles.selectedText}>
            {selectedProject.name}
          </MyText>
        </>
      ) : (
        <MyText color="textMuted">{t("create.select_project")}</MyText>
      )}
      <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  content: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "70%",
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  closeButton: {
    padding: 8,
  },
  searchInput: {
    marginBottom: 16,
  },
  list: {
    paddingBottom: 20,
  },
  projectItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  projectName: {
    flex: 1,
  },
  empty: {
    textAlign: "center",
    marginTop: 40,
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  selectedText: {
    flex: 1,
    marginLeft: 12,
  },
});
