import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { NodusLayout } from "@/components/ui/NodusLayout";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useProjects } from "@/hooks/useProjects";
import { useMemo } from "react";

export default function CreateModal() {
  const router = useRouter();
  const { colors } = useTheme();
  const { projects } = useProjects();
  const { projectId } = useLocalSearchParams<{ projectId?: string }>();

  const selectedProject = useMemo(() => {
    if (!projectId) return null;
    return projects.find((p) => p.id?.toString() === projectId);
  }, [projects, projectId]);

  return (
    <NodusLayout useSafeArea={true}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Nuevo Elemento
        </Text>

        {/* Botón para cerrar el modal */}
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

      <View style={styles.content}>
        {/* Project ID from query param - for now just log/display */}
        <Text style={{ color: colors.textMuted, textAlign: "center" }}>
          {projectId
            ? `projectId: ${projectId}`
            : "No project selected - user must select a project first"}
        </Text>
        {selectedProject && (
          <Text style={{ color: selectedProject.color, marginTop: 10 }}>
            Selected Project: {selectedProject.name}
          </Text>
        )}
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
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});
