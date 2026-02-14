import React from "react";
import {
  FlatList,
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { NodusLayout } from "@/components/ui/NodusLayout";
import { MyText } from "@/components/ui/MyText";
import { ProjectListItem } from "@/components/projects/ProjectListItem";
import { useProjects } from "@/hooks/useProjects";
import { useTheme } from "@/hooks/useTheme";
import { useLocale } from "@/hooks/useLocale";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ProjectEntity } from "@/core/entities/ProjectEntity";

export default function ProjectsScreen() {
  const { projects, loading, refresh, deleteProject, updateProject } =
    useProjects();
  const { colors } = useTheme();
  const { t } = useLocale();
  const router = useRouter();

  const handleCreate = () => {
    router.push("/modal/create-project");
  };

  const handleDelete = (project: ProjectEntity) => {
    Alert.alert(
      t("projects.delete_title") || "Eliminar Proyecto",
      `${t("projects.delete_confirm") || "¿Estás seguro de eliminar"} "${project.name}"? ${t("projects.delete_warning") || "Esta acción es irreversible."}`,
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: () => deleteProject(project.id!),
        },
      ],
    );
  };

  const handleEdit = (project: ProjectEntity) => {
    router.push({
      pathname: "/modal/create-project",
      params: { id: project.id },
    });
  };

  return (
    <NodusLayout>
      <View style={styles.header}>
        <MyText variant="h1" weight="bold">
          {t("tabs.projects")}
        </MyText>

        {/* Botón de creación*/}
        <TouchableOpacity
          onPress={handleCreate}
          style={[styles.addButton, { backgroundColor: colors.accent }]}
        >
          <Ionicons name="add" size={20} color={colors.primary} />
          <MyText
            variant="small"
            weight="semi"
            color="primary"
            style={{ marginLeft: 4 }}
          >
            {t("projects.add_project") || "Nuevo"}
          </MyText>
        </TouchableOpacity>
      </View>

      <FlatList
        data={projects}
        keyExtractor={(item) => item.id?.toString() || item.name}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <ProjectListItem
            project={item}
            onPress={() => {
              if (item.id) {
                router.push({
                  pathname: "/[projectId]",
                  params: { projectId: item.id.toString() },
                } as any);
              }
            }}
            onEdit={() => handleEdit(item)}
            onDelete={() => handleDelete(item)}
          />
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <MyText color="textMuted">
                {t("projects.empty_list") || "No hay proyectos aún"}
              </MyText>
            </View>
          ) : null
        }
        onRefresh={refresh}
        refreshing={loading}
      />
    </NodusLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  listContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 100 },
  empty: { marginTop: 100, alignItems: "center" },
});
