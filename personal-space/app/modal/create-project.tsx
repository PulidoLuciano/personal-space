import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { NodusLayout } from "@/components/ui/NodusLayout";
import { MyText } from "@/components/ui/MyText";
import { MyInput } from "@/components/ui/MyInput";
import { MyButton } from "@/components/ui/MyButton";
import { useTheme } from "@/hooks/useTheme";
import { useLocale } from "@/hooks/useLocale";
import { useProjects } from "@/hooks/useProjects";
import { Ionicons } from "@expo/vector-icons";

export const PROJECT_COLORS = [
  // AZUL
  "#2563EB",
  "#93C5FD",
  "#3B82F6",
  "#1E40AF",
  "#1E3A8A",
  // VERDE
  "#10B981",
  "#6EE7B7",
  "#059669",
  "#065F46",
  "#064E3B",
  // ROJO
  "#EF4444",
  "#FCA5A5",
  "#DC2626",
  "#991B1B",
  "#7F1D1D",
  // NARANJA
  "#F97316",
  "#FDBA74",
  "#EA580C",
  "#C2410C",
  "#7C2D12",
  // AMARILLO
  "#F59E0B",
  "#FCD34D",
  "#D97706",
  "#92400E",
  "#78350F",
  // MARRON
  "#B45309",
  "#D9C58B",
  "#713F12",
  "#451A03",
  "#271709",
  // PURPURA
  "#8B5CF6",
  "#C4B5FD",
  "#7C3AED",
  "#5B21B6",
  "#4C1D95",
  // ROSA
  "#EC4899",
  "#F9A8D4",
  "#DB2777",
  "#9D174D",
  "#831843",
];

export const ICONS = [
  // Gestión y Trabajo (Serios)
  "briefcase",
  "clipboard",
  "construct",
  "layers",
  "file-tray-full",
  "hammer",
  "build",
  "business",
  "receipt",
  "shield-checkmark",

  // Finanzas (Marrones/Verdes)
  "card",
  "cart",
  "cash",
  "stats-chart",
  "wallet",
  "pricetag",
  "pie-chart",
  "trending-up",
  "calculator",
  "balloon",

  // Hogar, Comida y Tierra (Marrones/Ocres)
  "home",
  "fast-food",
  "bulb",
  "bed",
  "umbrella",
  "restaurant",
  "cafe",
  "wine",
  "pizza",
  "beer",
  "leaf",
  "flower",
  "water",

  // Salud, Ocio y Deporte
  "fitness",
  "heart",
  "medical",
  "bicycle",
  "barbell",
  "bandage",
  "game-controller",
  "musical-notes",
  "camera",
  "airplane",
  "boat",
  "football",
  "trophy",
  "rocket",
  "flask",

  // Educación y Otros
  "calendar",
  "book",
  "code-slash",
  "notifications",
  "school",
  "library",
  "pencil",
  "attach",
  "infinite",
  "planet",
  "earth",
];

export default function CreateProjectModal() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isEditing = !!id;

  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useLocale();
  const { createProject, projects, updateProject } = useProjects();
  const projectToEdit = projects.find((p) => p.id === Number(id));

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
    },
  });

  const [selectedColor, setSelectedColor] = useState(
    projectToEdit?.color || PROJECT_COLORS[0],
  );
  const [selectedIcon, setSelectedIcon] = useState(
    projectToEdit?.icon || ICONS[0],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (projectToEdit) {
      reset({ name: projectToEdit.name });
      setSelectedColor(projectToEdit.color || PROJECT_COLORS[0]);
      setSelectedIcon(projectToEdit.icon || ICONS[0]);
    }
  }, [projectToEdit, id, reset]);

  const onSubmit = async (data: { name: string }) => {
    try {
      setIsSubmitting(true);
      if (isEditing) {
        await updateProject(Number(id), {
          name: data.name.trim(),
          color: selectedColor,
          icon: selectedIcon,
        });
      } else {
        await createProject({
          name: data.name.trim(),
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

  if (isEditing && !projectToEdit) {
    return null;
  }

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
        <Controller
          control={control}
          name="name"
          rules={{
            required: t("projects.name_required"),
            minLength: {
              value: 3,
              message: t("projects.name_min_length"),
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <MyInput
              label={t("projects.label_name") || "Nombre del Proyecto"}
              placeholder={
                t("projects.placeholder_name") || "Ej: TrashUp, Facultad..."
              }
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.name?.message}
              autoFocus
            />
          )}
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
          onPress={handleSubmit(onSubmit)}
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
    gap: 4,
    marginBottom: 25,
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 10,
    justifyContent: "center",
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 30,
    justifyContent: "center",
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
