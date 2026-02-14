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

export const PROJECT_COLORS = [
  // --- LOS NUEVOS: TIERRAS, MARRONES Y OCRES ---
  "#78350F", // Ámbar Extra Oscuro (Marrón café)
  "#92400E", // Marrón Madera
  "#B45309", // Ocre Quemado
  "#713F12", // Tierra de Sombra
  "#451A03", // Chocolate Profundo
  "#7C2D12", // Ladrillo Oscuro
  "#A16207", // Oro Viejo
  "#854D0E", // Oliva Café
  "#543618", // Tabaco
  "#271709", // Ébano

  // --- NEUTROS Y GRISES PROFESIONALES ---
  "#1F2937", // Gris Azulado (Slate)
  "#374151", // Carbón
  "#4B5563", // Gris Acero
  "#1E293B", // Oceánico Oscuro
  "#334155", // Pizarra
  "#0F172A", // Noche Rusa
  "#525252", // Gris Neutro
  "#262626", // Negro Humo
  "#404040", // Grafito
  "#171717", // Asfalto

  // --- VERDES BOSQUE Y OLIVA ---
  "#064E3B",
  "#065F46",
  "#022C22",
  "#365314",
  "#14532D",

  // --- AZULES REALES Y MARINOS ---
  "#1E3A8A",
  "#1E40AF",
  "#172554",
  "#0C4A6E",
  "#075985",

  // --- ROJOS VINO Y VIOLETAS ---
  "#7F1D1D",
  "#991B1B",
  "#4C1D95",
  "#581C87",
  "#701A75",
  "#4A044E",

  // --- LOS VIBRANTES (Para contraste) ---
  "#2563EB",
  "#3B82F6",
  "#06B6D4",
  "#059669",
  "#10B981",
  "#84CC16",
  "#EAB308",
  "#F59E0B",
  "#F97316",
  "#EA580C",
  "#EF4444",
  "#DC2626",
  "#EC4899",
  "#DB2777",
  "#8B5CF6",
  "#7C3AED",
  "#D946EF",
  "#A855F7",
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
  "gold",

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
