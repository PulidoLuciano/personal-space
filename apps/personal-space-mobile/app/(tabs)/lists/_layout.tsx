import { Stack } from "expo-router";
import { useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { ThemedView } from "@/components/themed-view";
import { GlobalStopwatchSheet } from "@/components/GlobalStopwatchSheet";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Spacing } from "@/constants/spacing";

export default function ListsStackLayout() {
  const [showStopwatchSheet, setShowStopwatchSheet] = useState(false);

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="[listId]" />
      </Stack>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowStopwatchSheet(true)}
        activeOpacity={0.8}
      >
        <IconSymbol size={24} name="timer" color="#fff" />
      </TouchableOpacity>
      <GlobalStopwatchSheet
        visible={showStopwatchSheet}
        onClose={() => setShowStopwatchSheet(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: Spacing.lg,
    bottom: Spacing.xl,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});