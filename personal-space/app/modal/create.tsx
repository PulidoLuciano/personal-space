import React, { useState, useMemo } from "react";
import { View, StyleSheet, Pressable } from "react-native";
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
import { ProjectEntity } from "@/core/entities/ProjectEntity";

export default function CreateModal() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useLocale();
  const { projects } = useProjects();
  const { projectId } = useLocalSearchParams<{ projectId?: string }>();

  const [selectorVisible, setSelectorVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectEntity | null>(
    null
  );
  const [selectedType, setSelectedType] = useState<ElementType>("event");

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

  return (
    <NodusLayout useSafeArea={true}>
      <View style={styles.header}>
        <MyText variant="h2" weight="bold">
          {t("common.save")}
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

      <View style={styles.content}>
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

        <View style={styles.formPlaceholder}>
          <MyText variant="h2" weight="semi" color="textMuted">
            {t(`create.form_${selectedType}`)}
          </MyText>
        </View>
      </View>

      <ProjectSelector
        selectedProject={selectedProject}
        onSelect={setSelectedProject}
        visible={selectorVisible}
        onClose={() => setSelectorVisible(false)}
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
    paddingVertical: 15,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  formPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
