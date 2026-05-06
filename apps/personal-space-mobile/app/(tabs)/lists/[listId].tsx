import { useEffect, useState, useCallback } from "react";
import { StyleSheet, View, FlatList, TouchableOpacity, TextInput, Modal, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useCore } from "@/lib/core-context";
import { SectionCard } from "@/components/SectionCard";
import { IconSymbol } from "@/components/ui/icon-symbol";
import type { Section, List } from "personal-space-core";

export default function SectionsScreen() {
  const { listId } = useLocalSearchParams<{ listId: string }>();
  const { core, isLoading: isCoreLoading, error: coreError } = useCore();
  
  if (isCoreLoading) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }
  
  if (coreError || !core) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ThemedText type="defaultSemiBold">Failed to initialize</ThemedText>
        <ThemedText>{coreError?.message || "Unknown error"}</ThemedText>
      </ThemedView>
    );
  }
  
  const router = useRouter();
  const [list, setList] = useState<List | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");

  const loadData = useCallback(async () => {
    if (!listId) return;
    try {
      const [listData, sectionsData] = await Promise.all([
        core.listsService.getById(listId),
        core.sectionsService.getByListId(listId),
      ]);
      setList(listData);
      setSections(sectionsData);
    } catch (error) {
      console.error("Error loading sections:", error);
    } finally {
      setIsLoading(false);
    }
  }, [core, listId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateSection = async () => {
    if (!newSectionName.trim() || !listId) {
      Alert.alert("Error", "Please enter a section name");
      return;
    }
    try {
      await core.sectionsService.create({
        name: newSectionName.trim(),
        list_id: listId,
      });
      setShowCreateModal(false);
      setNewSectionName("");
      loadData();
    } catch (error) {
      console.error("Error creating section:", error);
      Alert.alert("Error", "Failed to create section");
    }
  };

  const renderItem = ({ item }: { item: Section }) => {
    return (
      <SectionCard
        name={item.name}
        onPress={() => router.push(`/lists/${listId}/${item.id}`)}
      />
    );
  };

  if (!list) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>List not found</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol size={24} name="chevron.right" color="#0a7ea4" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <ThemedText type="title">{list.name}</ThemedText>
        </View>
      </View>
      <FlatList
        data={sections}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <ThemedText type="subtitle">No sections yet</ThemedText>
              <ThemedText>Create your first section to organize tasks</ThemedText>
            </View>
          ) : null
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowCreateModal(true)}
      >
        <IconSymbol size={28} name="chevron.right" color="#fff" />
      </TouchableOpacity>

      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <ThemedView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <ThemedText type="link">Cancel</ThemedText>
            </TouchableOpacity>
            <ThemedText type="defaultSemiBold">New Section</ThemedText>
            <TouchableOpacity onPress={handleCreateSection}>
              <ThemedText type="link">Create</ThemedText>
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <ThemedText type="subtitle">Name</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Section name"
              value={newSectionName}
              onChangeText={setNewSectionName}
              autoFocus
            />
          </View>
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: 60,
  },
  backButton: { marginRight: 12 },
  headerContent: { flex: 1 },
  list: { padding: 16, paddingTop: 0 },
  emptyContainer: { alignItems: "center", paddingTop: 40 },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#0a7ea4",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  modalContent: { padding: 16 },
  input: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.2)",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 24,
    fontSize: 16,
  },
});