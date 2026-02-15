import { Tabs, useNavigation, useLocalSearchParams } from "expo-router";
import React from "react";
import { ActivityIndicator, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TabBar } from "@/components/ui/TabBar";
import { useTheme } from "@/hooks/useTheme";
import { ProjectProvider, useCurrentProject } from "@/components/providers/ProjectContext";

function ProjectContent() {
  const { currentProject, projectId } = useCurrentProject();
  const { colors } = useTheme();
  const navigation = useNavigation();

  if (!currentProject || !projectId) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Tabs
      tabBar={(props) => (
        <TabBar {...props} accentColor={currentProject.color} projectId={projectId} />
      )}
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: currentProject.color },
        headerTintColor: "#fff",
        headerTitle: currentProject.name,
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 10 }}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color }) => (
            <Ionicons size={28} name="calendar" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
          tabBarIcon: ({ color }) => (
            <Ionicons size={28} name="checkbox" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="finances"
        options={{
          title: "Finances",
          tabBarIcon: ({ color }) => (
            <Ionicons size={28} name="wallet" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: "Notes",
          tabBarIcon: ({ color }) => (
            <Ionicons size={28} name="document-text" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

export default function ProjectLayout() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { colors } = useTheme();

  if (!projectId) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ProjectProvider>
      <ProjectContent />
    </ProjectProvider>
  );
}
