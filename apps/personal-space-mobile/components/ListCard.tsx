import { StyleSheet, TouchableOpacity, View, Alert, Modal, useColorScheme } from "react-native";
import * as Haptics from "expo-haptics";
import { ThemedText } from "./themed-text";
import { IconSymbol } from "./ui/icon-symbol";
import { ProjectIcon } from "./ui/ProjectIcon";
import { Colors } from "@/constants/theme";
import { Spacing, BorderRadius } from "@/constants/spacing";

import React from "react";

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
  const colors = Colors[isDark ? "dark" : "light"];

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
        style={[
          styles.container, 
          { backgroundColor: colors.surface }
        ]} 
        onPress={onPress}
        onLongPress={handleLongPress}
        activeOpacity={0.7}
      >
        <View style={[styles.iconWrapper, { backgroundColor: color + '20' }]}>
          <View style={[styles.iconContainer, { backgroundColor: color }]}>
            <ProjectIcon name={icon} size={20} color="#fff" />
          </View>
        </View>
        <View style={styles.content}>
          <ThemedText type="defaultSemiBold" style={{ color: colors.text }} numberOfLines={1}>
            {name}
          </ThemedText>
          {taskCount !== undefined && (
            <ThemedText type="subtitle" style={[styles.count, { color: colors.textSecondary }]}>
              {taskCount} {taskCount === 1 ? "task" : "tasks"}
            </ThemedText>
          )}
        </View>
        <View style={[styles.chevron, { backgroundColor: colors.borderLight }]}>
          <IconSymbol size={16} name="chevron.right" color={colors.iconSecondary} />
        </View>
      </TouchableOpacity>

      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity 
          style={[styles.menuOverlay, { backgroundColor: colors.overlay }]} 
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={[styles.menuContainer, { backgroundColor: colors.surfaceElevated }]}>
            <ThemedText type="defaultSemiBold" style={[styles.menuTitle, { color: colors.text }]}>
              {name}
            </ThemedText>
            <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />
            <TouchableOpacity style={styles.menuItem} onPress={handleEdit}>
              <IconSymbol size={18} name="pencil" color={colors.icon} />
              <ThemedText style={[styles.menuText, { color: colors.text }]}>Edit</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleArchive}>
              <IconSymbol size={18} name="archive" color={colors.icon} />
              <ThemedText style={[styles.menuText, { color: colors.text }]}>Archive</ThemedText>
            </TouchableOpacity>
            <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />
            <TouchableOpacity style={[styles.menuItem, styles.menuItemDelete]} onPress={handleDelete}>
              <IconSymbol size={18} name="trash" color={colors.error} />
              <ThemedText style={[styles.menuText, { color: colors.error }]}>Delete</ThemedText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  iconWrapper: {
    borderRadius: BorderRadius.md,
    padding: Spacing.xxs,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  count: {
    fontSize: 13,
    marginTop: 2,
  },
  chevron: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  menuOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xxl,
  },
  menuContainer: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    width: "100%",
    maxWidth: 320,
  },
  menuTitle: {
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  menuDivider: {
    height: 1,
    marginVertical: Spacing.sm,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  menuItemDelete: {
    marginTop: Spacing.xs,
  },
  menuText: {
    marginLeft: Spacing.md,
    fontSize: 16,
  },
});