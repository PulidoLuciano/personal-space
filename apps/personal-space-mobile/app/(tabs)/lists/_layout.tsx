import { Stack } from "expo-router";
import { ThemedView } from "@/components/themed-view";

export default function ListsStackLayout() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="[listId]" />
      </Stack>
    </ThemedView>
  );
}