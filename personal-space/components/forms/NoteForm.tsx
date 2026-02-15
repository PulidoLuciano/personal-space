import React, { useEffect, useState } from "react";
import { View, StyleSheet, Alert, ScrollView } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useTheme } from "@/hooks/useTheme";
import { useLocale } from "@/hooks/useLocale";
import { useNotes } from "@/hooks/useNotes";
import { MyText } from "@/components/ui/MyText";
import { MyInput } from "@/components/ui/MyInput";
import { MyButton } from "@/components/ui/MyButton";
import { MarkdownInput } from "@/components/ui/MarkdownInput";

interface NoteFormData {
  title: string;
  content: string;
}

interface NoteFormProps {
  projectId: number;
  noteId?: number;
  onSave: () => void;
  onCancel: () => void;
}

export const NoteForm: React.FC<NoteFormProps> = ({
  projectId,
  noteId,
  onSave,
  onCancel,
}) => {
  const { colors } = useTheme();
  const { t } = useLocale();
  const { createNote, updateNote, getNoteById } = useNotes();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<NoteFormData>({
    defaultValues: {
      title: "",
      content: "",
    },
  });

  useEffect(() => {
    if (noteId) {
      loadNote();
    }
  }, [noteId]);

  const loadNote = async () => {
    if (!noteId) return;
    try {
      const note = await getNoteById(noteId);
      if (note) {
        setValue("title", note.title);
        setValue("content", note.content);
      }
    } catch (error) {
      Alert.alert(t("common.error"), t("common.error_save"));
    }
  };

  const onSubmit = async (data: NoteFormData) => {
    setLoading(true);
    try {
      if (noteId) {
        await updateNote(noteId, {
          title: data.title,
          content: data.content,
        });
      } else {
        await createNote({
          projectId,
          title: data.title,
          content: data.content,
        });
      }
      onSave();
    } catch (error: any) {
      Alert.alert(t("common.error"), error.message || t("common.error_save"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView 
      style={styles.scrollView} 
      contentContainerStyle={styles.contentContainer} 
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.field}>
        <Controller
          control={control}
          name="title"
          rules={{
            required: t("notes.title_required"),
            maxLength: {
              value: 100,
              message: t("notes.title_too_long"),
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <MyInput
              label={t("notes.title_label")}
                placeholder={t("notes.title_placeholder")}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.title?.message}
              />
            )}
          />
        </View>

        <View style={styles.field}>
          <MyText variant="small" color="textMuted" style={styles.label}>
            {t("notes.content_label").toUpperCase()}
          </MyText>
          <Controller
            control={control}
            name="content"
            render={({ field: { onChange, value } }) => (
              <MarkdownInput
                value={value}
                onChangeText={onChange}
                placeholder={t("notes.content_placeholder")}
              />
            )}
          />
        </View>

        <View style={styles.buttons}>
          <View style={styles.buttonWrapper}>
            <MyButton
              title={t("common.cancel")}
              variant="ghost"
              onPress={onCancel}
            />
          </View>
          <View style={styles.buttonWrapper}>
            <MyButton
              title={t("common.save")}
              onPress={handleSubmit(onSubmit)}
              loading={loading}
            />
          </View>
        </View>
      </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
    marginLeft: 4,
  },
  buttons: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 16,
  },
  buttonWrapper: {
    flex: 1,
  },
});
