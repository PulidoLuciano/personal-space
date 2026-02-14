import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { NodusLayout } from "@/components/ui/NodusLayout";
import { MyText } from "@/components/ui/MyText";
import { MyInput } from "@/components/ui/MyInput";
import { MyButton } from "@/components/ui/MyButton";
import { useTheme } from "@/hooks/useTheme";
import { useLocale } from "@/hooks/useLocale";
import { useProjects } from "@/hooks/useProjects";
import { Ionicons } from "@expo/vector-icons";

// Colores sugeridos basados en una paleta moderna
const PROJECT_COLORS = [
  "#6366f1",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#ef4444",
  "#06b6d4",
];

const ICONS = [
  "folder",
  "code",
  "book",
  "cart",
  "fitness",
  "briefcase",
  "game-controller",
  "color-palette",
];

export default function CreateProjectModal() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isEditing = !!id;

  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useLocale();
  const { createProject, projects, updateProject } = useProjects();
  const projectToEdit = projects.find((p) => p.id === Number(id));

  useEffect(() => {
    setName(projectToEdit?.name || "");
    setSelectedColor(projectToEdit?.color || PROJECT_COLORS[0]);
    setSelectedIcon(projectToEdit?.icon || ICONS[0]);
  }, [projectToEdit, id]);

  const [name, setName] = useState(projectToEdit?.name || "");
  const [selectedColor, setSelectedColor] = useState(
    projectToEdit?.color || PROJECT_COLORS[0],
  );
  const [selectedIcon, setSelectedIcon] = useState(
    projectToEdit?.icon || ICONS[0],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(
        t("common.error"),
        t("projects.name_required") || "El nombre es obligatorio",
      );
      return;
    }

    try {
      setIsSubmitting(true);
      if (isEditing) {
        await updateProject(Number(id), {
          name: name.trim(),
          color: selectedColor,
          icon: selectedIcon,
        });
      } else {
        await createProject({
          name: name.trim(),
          color: selectedColor,
          icon: selectedIcon,
        });
      }
      router.back();
    } catch (error) {
      Alert.alert("Error", t("common.error_save"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <NodusLayout useSafeArea>
      <View style={styles.header}>
        <MyText variant="h2" weight="bold">
          {!isEditing ? t("projects.new_project") : t("projects.edit_project")}
        </MyText>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <MyInput
          label={t("projects.label_name") || "Nombre del Proyecto"}
          placeholder={
            t("projects.placeholder_name") || "Ej: TrashUp, Facultad..."
          }
          value={name}
          onChangeText={setName}
          autoFocus
        />

        <MyText variant="small" color="textMuted" style={styles.sectionTitle}>
          {t("projects.label_color") || "COLOR"}
        </MyText>
        <View style={styles.colorGrid}>
          {PROJECT_COLORS.map((color) => (
            <TouchableOpacity
              key={color}
              onPress={() => setSelectedColor(color)}
              style={[
                styles.colorCircle,
                { backgroundColor: color },
                selectedColor === color && {
                  borderColor: colors.text,
                  borderWidth: 3,
                },
              ]}
            />
          ))}
        </View>

        <MyText variant="small" color="textMuted" style={styles.sectionTitle}>
          {t("projects.label_icon") || "ICONO"}
        </MyText>
        <View style={styles.iconGrid}>
          {ICONS.map((icon) => (
            <TouchableOpacity
              key={icon}
              onPress={() => setSelectedIcon(icon)}
              style={[
                styles.iconItem,
                { backgroundColor: colors.surface },
                selectedIcon === icon && {
                  borderColor: selectedColor,
                  borderWidth: 2,
                },
              ]}
            >
              <Ionicons
                name={icon as any}
                size={24}
                color={selectedIcon === icon ? selectedColor : colors.textMuted}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <MyButton
          title={isEditing ? t("common.update") : t("common.save")}
          onPress={handleSave}
          loading={isSubmitting}
        />
      </View>
    </NodusLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  closeBtn: { padding: 5 },
  content: { padding: 20 },
  sectionTitle: { marginBottom: 12, marginTop: 10, letterSpacing: 1 },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 10,
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 30,
  },
  iconItem: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
});
