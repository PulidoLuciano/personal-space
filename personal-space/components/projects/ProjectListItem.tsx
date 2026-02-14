import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { MyText } from "../ui/MyText";
import { useTheme } from "../../hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { ProjectEntity } from "@/core/entities/ProjectEntity";

interface Props {
  project: ProjectEntity;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const ProjectListItem: React.FC<Props> = ({
  project,
  onPress,
  onEdit,
  onDelete,
}) => {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.hover },
        pressed && { backgroundColor: colors.press },
      ]}
    >
      <View style={styles.leftSection}>
        {/* El icono lleva el color del proyecto */}
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: project.color + "20" },
          ]}
        >
          <Ionicons
            name={(project.icon as any) || "folder"}
            size={22}
            color={project.color}
          />
        </View>
        <MyText weight="semi" style={styles.name}>
          {project.name}
        </MyText>
      </View>

      <View style={styles.actions}>
        <Pressable onPress={onEdit} style={styles.actionButton}>
          <Ionicons name="pencil-outline" size={20} color={colors.textMuted} />
        </Pressable>
        <Pressable onPress={onDelete} style={styles.actionButton}>
          <Ionicons name="trash-outline" size={20} color={colors.danger} />
        </Pressable>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  leftSection: { flexDirection: "row", alignItems: "center", flex: 1 },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  name: { fontSize: 16, flex: 1 },
  actions: { flexDirection: "row", alignItems: "center" },
  actionButton: { padding: 8, marginLeft: 4 },
});
