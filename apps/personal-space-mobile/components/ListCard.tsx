import { StyleSheet, TouchableOpacity, View, Alert, Modal, useColorScheme } from "react-native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { ThemedText } from "./themed-text";
import { IconSymbol } from "./ui/icon-symbol";
import { ProjectIcon } from "./ui/ProjectIcon";

interface ListCardProps {
  id: string;
  name: string;
  color: string;
  icon: string;
  taskCount?: number;
  onPress: () => void;
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

export function ListCard({ 
  id, 
  name, 
  color, 
  icon, 
  taskCount, 
  onPress, 
  onEdit, 
  onArchive, 
  onDelete 
}: ListCardProps) {
  const [showMenu, setShowMenu] = React.useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowMenu(true);
  };

  const handleEdit = () => {
    setShowMenu(false);
    onEdit();
  };

  const handleArchive = () => {
    setShowMenu(false);
    onArchive();
  };

  const handleDelete = () => {
    setShowMenu(false);
    Alert.alert(
      "Delete List",
      `Are you sure you want to delete "${name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: onDelete },
      ]
    );
  };

  return (
    <>
      <TouchableOpacity 
        style={styles.container} 
        onPress={onPress}
        onLongPress={handleLongPress}
      >
        <View style={[styles.iconContainer, { backgroundColor: color }]}>
          <ProjectIcon name={icon} size={24} color="#fff" />
        </View>
        <View style={styles.content}>
          <ThemedText type="default" numberOfLines={1}>{name}</ThemedText>
          {taskCount !== undefined && (
            <ThemedText type="subtitle" style={styles.count}>
              {taskCount} {taskCount === 1 ? "task" : "tasks"}
            </ThemedText>
          )}
        </View>
        <IconSymbol size={20} name="chevron.right" color="#999" />
      </TouchableOpacity>

      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity 
          style={styles.menuOverlay} 
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={[styles.menuContainer, isDark && styles.menuContainerDark]}>
            <TouchableOpacity style={styles.menuItem} onPress={handleEdit}>
              <IconSymbol size={20} name="chevron.right" color={isDark ? "#fff" : "#333"} />
              <ThemedText style={[styles.menuText, isDark && styles.menuTextDark]}>Edit</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleArchive}>
              <IconSymbol size={20} name="chevron.right" color={isDark ? "#fff" : "#333"} />
              <ThemedText style={[styles.menuText, isDark && styles.menuTextDark]}>Archive</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuItem, styles.menuItemDelete]} onPress={handleDelete}>
              <IconSymbol size={20} name="chevron.right" color="#D32F2F" />
              <ThemedText style={[styles.menuText, styles.menuTextDelete, isDark && styles.menuTextDeleteDark]}>Delete</ThemedText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

import React from "react";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.05)",
    marginBottom: 8,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  count: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 8,
    width: 200,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
  },
  menuItemDelete: {
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  menuText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#333",
  },
  menuTextDelete: {
    color: "#D32F2F",
  },
  menuContainerDark: {
    backgroundColor: "#1a1a1a",
  },
  menuTextDark: {
    color: "#fff",
  },
  menuTextDeleteDark: {
    color: "#FF6B6B",
  },
});