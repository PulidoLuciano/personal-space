import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Markdown from "react-native-markdown-display";
import { useTheme } from "@/hooks/useTheme";
import { useNotes } from "@/hooks/useNotes";
import { useCurrentProject } from "@/components/providers/ProjectContext";
import { MyText } from "@/components/ui/MyText";
import { MyButton } from "@/components/ui/MyButton";
import { NoteEntity } from "@/core/entities/NoteEntity";
import { noteEvents, NOTE_CHANGED } from "@/utils/events/NoteEvents";

export default function NoteDetailScreen() {
  const { noteId } = useLocalSearchParams<{ noteId: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { getNoteById, deleteNote } = useNotes();
  const { currentProject } = useCurrentProject();

  const [note, setNote] = useState<NoteEntity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNote();
  }, [noteId]);

  useEffect(() => {
    if (!noteId) return;

    const handleNoteChanged = () => {
      loadNote();
    };

    noteEvents.on(NOTE_CHANGED, handleNoteChanged);

    return () => {
      noteEvents.off(NOTE_CHANGED, handleNoteChanged);
    };
  }, [noteId]);

  const loadNote = async () => {
    if (!noteId) return;
    try {
      const data = await getNoteById(parseInt(noteId));
      setNote(data);
    } catch (error) {
      console.error("Error loading note:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Eliminar Nota",
      "¿Estás seguro de eliminar esta nota?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            if (!noteId) return;
            try {
              await deleteNote(parseInt(noteId));
              noteEvents.emit(NOTE_CHANGED, { noteId: parseInt(noteId) });
              router.back();
            } catch (error) {
              Alert.alert("Error", "No se pudo eliminar la nota");
            }
          },
        },
      ],
    );
  };

  const handleEdit = () => {
    router.push({
      pathname: "/modal/create",
      params: { noteId, projectId: currentProject?.id?.toString() },
    } as any);
  };

  if (loading || !note) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const markdownStyles = {
    body: {
      color: colors.text,
      fontSize: 16,
      lineHeight: 24,
    },
    heading1: { color: colors.text, marginVertical: 8 },
    heading2: { color: colors.text, marginVertical: 6 },
    heading3: { color: colors.text, marginVertical: 4 },
    code_inline: {
      backgroundColor: colors.surface,
      color: colors.primary,
      paddingHorizontal: 4,
      borderRadius: 4,
    },
    code_block: {
      backgroundColor: colors.surface,
      padding: 12,
      borderRadius: 8,
    },
    fence: {
      backgroundColor: colors.surface,
      padding: 12,
      borderRadius: 8,
    },
    blockquote: {
      backgroundColor: colors.surface,
      borderLeftColor: colors.primary,
      borderLeftWidth: 4,
      paddingLeft: 12,
      marginVertical: 8,
    },
    link: {
      color: colors.primary,
    },
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <MyText variant="h1" weight="bold" style={styles.title}>
          {note.title}
        </MyText>

        {note.content ? (
          <Markdown style={markdownStyles}>{note.content}</Markdown>
        ) : (
          <MyText color="textMuted">Sin contenido</MyText>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.buttonWrapper}>
          <MyButton
            title="Eliminar"
            variant="ghost"
            onPress={handleDelete}
          />
        </View>
        <View style={styles.buttonWrapper}>
          <MyButton
            title="Editar"
            onPress={handleEdit}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    marginBottom: 16,
  },
  footer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  buttonWrapper: {
    flex: 1,
  },
});
