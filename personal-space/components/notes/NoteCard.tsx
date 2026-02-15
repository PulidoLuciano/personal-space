import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { useLocale } from "@/hooks/useLocale";
import { MyText } from "@/components/ui/MyText";
import { NoteEntity } from "@/core/entities/NoteEntity";

interface NoteCardProps {
  note: NoteEntity;
  projectColor?: string;
  onPress?: () => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  projectColor,
  onPress,
}) => {
  const { colors } = useTheme();
  const { t } = useLocale();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.hover,
        },
      ]}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.colorDot,
            { backgroundColor: projectColor || colors.primary },
          ]}
        />
        <MyText variant="body" weight="semi" numberOfLines={1} style={styles.title}>
          {note.title}
        </MyText>
      </View>

      {note.content && (
        <MyText
          variant="caption"
          color="textMuted"
          numberOfLines={2}
          style={styles.preview}
        >
          {note.excerpt}
        </MyText>
      )}

      <View style={styles.footer}>
        <Ionicons name="time-outline" size={12} color={colors.textMuted} />
        <MyText variant="caption" color="textMuted" style={styles.date}>
          {note.updatedAt ? formatDate(note.updatedAt) : ""}
        </MyText>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  title: {
    flex: 1,
  },
  preview: {
    marginBottom: 8,
    lineHeight: 18,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
  },
  date: {
    marginLeft: 4,
  },
});
