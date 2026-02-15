import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { useLocale } from "@/hooks/useLocale";
import { useNotes } from "@/hooks/useNotes";
import { useCurrentProject } from "@/components/providers/ProjectContext";
import { SearchInput } from "@/components/ui/SearchInput";
import { NoteCard } from "@/components/notes/NoteCard";
import { MyText } from "@/components/ui/MyText";
import { NoteEntity } from "@/core/entities/NoteEntity";
import { noteEvents, NOTE_CHANGED } from "@/utils/events/NoteEvents";

const PAGE_SIZE = 15;

export default function NotesScreen() {
  const router = useRouter();
  const { currentProject, projectId } = useCurrentProject();
  const { colors } = useTheme();
  const { t } = useLocale();
  const { searchNotes } = useNotes();

  const [notes, setNotes] = useState<NoteEntity[]>([]);
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const notesLengthRef = useRef(0);

  const projectColor = currentProject?.color;

  const loadNotes = useCallback(
    async (pageNum: number, search: string, isRefresh = false) => {
      if (!projectId) return;

      try {
        if (pageNum === 1) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        const result = await searchNotes(
          parseInt(projectId),
          search,
          pageNum,
          PAGE_SIZE,
        );

        if (pageNum === 1) {
          setNotes(result.notes);
          notesLengthRef.current = result.notes.length;
        } else {
          setNotes((prev) => {
            notesLengthRef.current = prev.length + result.notes.length;
            return [...prev, ...result.notes];
          });
        }

        setHasMore(result.notes.length === PAGE_SIZE && notesLengthRef.current < result.total);
      } catch (error) {
        console.error("Error loading notes:", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [projectId, searchNotes],
  );

  useEffect(() => {
    if (!projectId) return;
    setPage(1);
    loadNotes(1, searchText, true);
  }, [searchText, projectId, loadNotes]);

  useEffect(() => {
    if (!projectId) return;

    const handleNoteChanged = () => {
      loadNotes(1, searchText, true);
    };

    noteEvents.on(NOTE_CHANGED, handleNoteChanged);

    return () => {
      noteEvents.off(NOTE_CHANGED, handleNoteChanged);
    };
  }, [projectId, searchText, loadNotes]);

  const handleLoadMore = async () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      await loadNotes(nextPage, searchText);
    }
  };

  const renderNote = ({ item }: { item: NoteEntity }) => (
    <NoteCard
      note={item}
      projectColor={projectColor}
      onPress={() => {
        if (item.id && projectId) {
          router.push({
            pathname: "/[projectId]/notes/[noteId]",
            params: { projectId, noteId: item.id.toString() },
          } as any);
        }
      }}
    />
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;

    if (searchText) {
      return (
        <View style={styles.empty}>
          <MyText color="textMuted">{t("notes.no_results")}</MyText>
        </View>
      );
    }

    return (
      <View style={styles.empty}>
        <MyText color="textMuted">{t("notes.empty_list")}</MyText>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.searchContainer}>
        <SearchInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder={t("notes.search_placeholder")}
        />
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id?.toString() || item.title}
          renderItem={renderNote}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingMore: {
    paddingVertical: 20,
    alignItems: "center",
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
});
