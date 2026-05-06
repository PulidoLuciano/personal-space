import { useEffect, useState, useCallback } from "react";
import { StyleSheet, View, FlatList, TouchableOpacity, TextInput, Modal, Alert, ScrollView, useColorScheme } from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useCore } from "@/lib/core-context";
import { ListCard } from "@/components/ListCard";
import { ProjectIcon } from "@/components/ui/ProjectIcon";
import { IconSymbol } from "@/components/ui/icon-symbol";
import type { List } from "personal-space-core";

const PAGE_SIZE = 50;

const ICON_ORDER = [
  "circle",
  "star", "sun", "earth", "sprout", "leaf",
  "backpack", "footprints", "dumbbell", "heart",
  "pill", "syringe", "test-tube-diagonal",
  "book", "library-big", "notepad-text", "brain", "graduation-cap", "languages",
  "megaphone", "presentation",
  "mic-vocal", "music", "headphones",
  "camera", "clapperboard", "gamepad-2",
  "chess-knight", "puzzle",
  "palette", "paintbrush",
  "shovel", "wrench",
  "car", "motorbike", "bike", "truck", "plane",
  "sailboat", "fish",
  "apple", "hamburger", "beer", "coffee", "chef-hat",
  "award", "trophy",
  "badge-dollar-sign", "shopping-cart", "briefcase-business",
  "chart-no-axes-combined", "laptop-minimal", "code-xml",
  "scale",
  "lightbulb",
  "balloon", "baby",
  "cat", "dog", "paw-print",
];

const COLOR_ORDER = [
  "#1565C0", "#1976D2", "#0D47A1", "#1A237E",
  "#388E3C", "#4CAF50", "#2E7D32", "#1B5E20",
  "#D32F2F", "#F44336", "#C62828", "#B71C1C",
  "#C2185B", "#E91E63", "#AD1457", "#880E4F",
  "#F57C00", "#FF9800", "#EF6C00", "#E65100", "#FF8F00", "#FFA000", "#FF6F00",
  "#5D4037", "#795548", "#4E342E", "#3E2723",
  "#7B1FA2", "#9C27B0", "#6A1B9A", "#4A148C",
  "#FF5733", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF",
  "#00000000", "#777777",
];

export default function ListsScreen() {
  const core = useCore();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [lists, setLists] = useState<List[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [icons, setIcons] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [selectedColor, setSelectedColor] = useState("#1565C0");
  const [selectedIcon, setSelectedIcon] = useState("star");
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [archivedLists, setArchivedLists] = useState<List[]>([]);
  const [showArchivedModal, setShowArchivedModal] = useState(false);

  const isDark = colorScheme === "dark";
  const inputTextColor = isDark ? "#fff" : "#000";
  const inputBgColor = isDark ? "#1a1a1a" : "#fff";

  const loadLists = useCallback(async () => {
    try {
      const result = await core.listsService.getAllPaginated(1, PAGE_SIZE, undefined, false);
      setLists(result);
    } catch (error) {
      console.error("Error loading lists:", error);
    } finally {
      setIsLoading(false);
    }
  }, [core]);

  const loadArchivedLists = useCallback(async () => {
    try {
      const result = await core.listsService.getAllPaginated(1, PAGE_SIZE, undefined, true);
      setArchivedLists(result);
    } catch (error) {
      console.error("Error loading archived lists:", error);
    }
  }, [core]);

  const handleUnarchiveList = async (listId: string) => {
    try {
      await core.listsService.unarchive(listId);
      loadArchivedLists();
      loadLists();
    } catch (error) {
      console.error("Error unarchiving list:", error);
    }
  };

  const loadColorsAndIcons = useCallback(async () => {
    try {
      const [dbColors, dbIcons] = await Promise.all([
        core.getAllColors(),
        core.getAllIcons(),
      ]);
      const orderedColors = COLOR_ORDER.filter(color => dbColors.includes(color));
      setColors(orderedColors);
      const orderedIcons = ICON_ORDER.filter(icon => dbIcons.includes(icon));
      setIcons(orderedIcons);
      if (orderedColors.length > 0) setSelectedColor(orderedColors[0]);
      if (orderedIcons.length > 0) setSelectedIcon(orderedIcons[0]);
    } catch (error) {
      console.error("Error loading colors/icons:", error);
      setColors(COLOR_ORDER.slice(0, 10));
      setIcons(ICON_ORDER.slice(0, 5));
    }
  }, [core]);

  useEffect(() => {
    loadLists();
    loadColorsAndIcons();
  }, [loadLists, loadColorsAndIcons]);

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      Alert.alert("Error", "Please enter a list name");
      return;
    }
    try {
      if (editingListId) {
        await core.listsService.update(editingListId, {
          name: newListName.trim(),
          color_id: selectedColor,
          icon_id: selectedIcon,
        });
      } else {
        await core.listsService.create({
          name: newListName.trim(),
          color_id: selectedColor,
          icon_id: selectedIcon,
        });
      }
      setShowCreateModal(false);
      setNewListName("");
      setEditingListId(null);
      loadLists();
    } catch (error) {
      console.error("Error saving list:", error);
      Alert.alert("Error", "Failed to save list");
    }
  };

  const handleEditList = (list: List) => {
    setSelectedColor(list.color_id);
    setSelectedIcon(list.icon_id);
    setNewListName(list.name);
    setEditingListId(list.id);
    setShowCreateModal(true);
  };

  const handleArchiveList = async (listId: string) => {
    try {
      await core.listsService.archive(listId);
      loadLists();
    } catch (error) {
      console.error("Error archiving list:", error);
    }
  };

  const handleDeleteList = async (listId: string) => {
    try {
      await core.listsService.delete(listId);
      loadLists();
    } catch (error) {
      console.error("Error deleting list:", error);
      Alert.alert("Error", "Failed to delete list");
    }
  };

  const renderItem = ({ item }: { item: List }) => {
    if (item.id === "0") return null;
    return (
      <ListCard
        id={item.id}
        name={item.name}
        color={item.color_id}
        icon={item.icon_id}
        onPress={() => router.push(`/lists/${item.id}`)}
        onEdit={() => handleEditList(item)}
        onArchive={() => handleArchiveList(item.id)}
        onDelete={() => handleDeleteList(item.id)}
      />
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Lists</ThemedText>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.archiveButton}
            onPress={() => {
              loadArchivedLists();
              setShowArchivedModal(true);
            }}
          >
            <IconSymbol size={20} name="chevron.right" color={isDark ? "#fff" : "#666"} />
            <ThemedText type="link" style={[isDark && { color: "#fff" }]}>Archived</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}
          >
            <ThemedText type="link" style={[isDark && { color: "#fff" }]}>Create</ThemedText>
            <IconSymbol size={20} name="plus" color={isDark ? "#fff" : "#0a7ea4"} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={lists}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <ThemedText type="subtitle">No lists yet</ThemedText>
              <ThemedText>Create your first list to get started</ThemedText>
            </View>
          ) : null
        }
      />

      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
            setShowCreateModal(false);
            setEditingListId(null);
            setNewListName("");
          }}
      >
        <ThemedView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => {
              setShowCreateModal(false);
              setEditingListId(null);
              setNewListName("");
            }}>
              <ThemedText type="link">Cancel</ThemedText>
            </TouchableOpacity>
            <ThemedText type="defaultSemiBold">{editingListId ? "Edit List" : "New List"}</ThemedText>
            <TouchableOpacity onPress={handleCreateList}>
              <ThemedText type="link">{editingListId ? "Save" : "Create"}</ThemedText>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <ThemedText type="subtitle">Name</ThemedText>
            <TextInput
              style={[styles.input, { color: inputTextColor, backgroundColor: inputBgColor }]}
              placeholder="List name"
              placeholderTextColor="#999"
              value={newListName}
              onChangeText={setNewListName}
              autoFocus
            />
            <ThemedText type="subtitle">Icon</ThemedText>
            <View style={styles.iconPicker}>
              {icons.map((iconName) => (
                <TouchableOpacity
                  key={iconName}
                  style={[
                    styles.iconOption,
                    isDark && styles.iconOptionDark,
                    selectedIcon === iconName && styles.iconSelected,
                  ]}
                  onPress={() => setSelectedIcon(iconName)}
                >
                  <ProjectIcon
                    name={iconName}
                    size={28}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <ThemedText type="subtitle" style={styles.sectionLabel}>Color</ThemedText>
            <View style={styles.colorPicker}>
              {colors.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorSelected,
                  ]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </View>
          </ScrollView>
        </ThemedView>
      </Modal>

      <Modal
        visible={showArchivedModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowArchivedModal(false)}
      >
        <ThemedView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowArchivedModal(false)}>
              <ThemedText type="link">Close</ThemedText>
            </TouchableOpacity>
            <ThemedText type="defaultSemiBold">Archived Lists</ThemedText>
            <View style={{ width: 60 }} />
          </View>
          <ScrollView style={styles.modalContent}>
            {archivedLists.length === 0 ? (
              <View style={styles.emptyContainer}>
                <ThemedText type="subtitle">No archived lists</ThemedText>
              </View>
            ) : (
              archivedLists.map((list) => (
                <TouchableOpacity key={list.id} style={styles.archivedItem}>
                  <View style={[styles.iconContainer, { backgroundColor: list.color_id }]}>
                    <ProjectIcon name={list.icon_id} size={24} color="#fff" />
                  </View>
                  <ThemedText type="default" style={styles.archivedName}>{list.name}</ThemedText>
                  <TouchableOpacity
                    style={styles.unarchiveButton}
                    onPress={() => handleUnarchiveList(list.id)}
                  >
                    <ThemedText type="link">Unarchive</ThemedText>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 60,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  archiveButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  list: {
    padding: 16,
    paddingTop: 0,
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: 40,
  },
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  modalContent: {
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.2)",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 24,
    fontSize: 16,
  },
  sectionLabel: {
    marginTop: 16,
    marginBottom: 12,
  },
  iconPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconOptionDark: {
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  iconSelected: {
    backgroundColor: "#0a7ea4",
  },
  colorPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginBottom: 24,
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: "#fff",
  },
  archivedItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 8,
    marginBottom: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  archivedName: {
    flex: 1,
  },
  unarchiveButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
});