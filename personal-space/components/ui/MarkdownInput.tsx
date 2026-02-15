import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInputProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Markdown from "react-native-markdown-display";
import { useTheme } from "@/hooks/useTheme";
import { useLocale } from "@/hooks/useLocale";
import { MyText } from "./MyText";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Mode = "edit" | "preview";

interface MarkdownInputProps extends Omit<TextInputProps, "onChangeText"> {
  value: string;
  onChangeText: (text: string) => void;
  style?: object;
}

const MARKDOWN_STORAGE_KEY = "@markdown_default_mode";

interface ToolbarButtonProps {
  icon?: string;
  label?: string;
  onPress: () => void;
  active?: boolean;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  icon,
  label,
  onPress,
  active,
}) => {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.toolbarButton,
        { backgroundColor: active ? colors.primary + "20" : "transparent" },
      ]}
    >
      {icon ? (
        <Ionicons
          name={icon as any}
          size={18}
          color={active ? colors.primary : colors.textMuted}
        />
      ) : (
        <MyText
          variant="caption"
          weight="bold"
          style={{ color: active ? colors.primary : colors.textMuted }}
        >
          {label}
        </MyText>
      )}
    </Pressable>
  );
};

export const MarkdownInput: React.FC<MarkdownInputProps> = ({
  value,
  onChangeText,
  style,
  placeholder,
  ...props
}) => {
  const { colors } = useTheme();
  const { t } = useLocale();
  const inputRef = useRef<TextInput>(null);
  const [mode, setMode] = useState<Mode>("edit");

  useEffect(() => {
    AsyncStorage.getItem(MARKDOWN_STORAGE_KEY).then((savedMode) => {
      if (savedMode === "edit" || savedMode === "preview") {
        setMode(savedMode);
      }
    });
  }, []);

  const toggleMode = (newMode: Mode) => {
    setMode(newMode);
    AsyncStorage.setItem(MARKDOWN_STORAGE_KEY, newMode);
  };

  const insertMarkdown = (before: string, after: string = "") => {
    const input = inputRef.current;
    if (!input) return;

    input.focus();

    const newText = before + after;
    onChangeText(value + newText);
  };

  const insertTable = () => {
    const table = "\n| Header 1 | Header 2 | Header 3 |\n| --------- | --------- | --------- |\n| Cell 1   | Cell 2   | Cell 3   |\n";
    onChangeText(value + table);
  };

  const prependLine = (prefix: string) => {
    const input = inputRef.current;
    if (!input) return;

    input.focus();
    const newText = value + "\n" + prefix;
    onChangeText(newText);
  };

  const markdownStyles = {
    body: { color: colors.text, fontSize: 15 },
    heading1: { color: colors.text, fontSize: 24, fontWeight: "bold" as const, marginTop: 8, marginBottom: 4 },
    heading2: { color: colors.text, fontSize: 20, fontWeight: "bold" as const, marginTop: 6, marginBottom: 3 },
    paragraph: { color: colors.text, fontSize: 15, lineHeight: 22 },
    strong: { fontWeight: "bold" as const },
    em: { fontStyle: "italic" as const },
    blockquote: {
      backgroundColor: colors.surface,
      borderLeftColor: colors.primary,
      borderLeftWidth: 4,
      paddingLeft: 12,
      paddingVertical: 8,
      marginVertical: 4,
    },
    code_inline: {
      backgroundColor: colors.surface,
      color: colors.primary,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      fontFamily: "monospace",
    },
    link: { color: colors.secondary },
    list_item: { color: colors.text, marginVertical: 2 },
  };

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.toolbar, { borderBottomColor: colors.hover }]}>
        <View style={styles.toolbarLeft}>
          <ToolbarButton
            label="H1"
            onPress={() => prependLine("# ")}
          />
          <ToolbarButton
            label="H2"
            onPress={() => prependLine("## ")}
          />
          <ToolbarButton
            label="H3"
            onPress={() => prependLine("### ")}
          />
          <ToolbarButton
            label="H4"
            onPress={() => prependLine("#### ")}
          />
          <ToolbarButton
            icon="remove-outline"
            onPress={() => prependLine("\n---\n")}
          />
          <ToolbarButton
            label="B"
            onPress={() => insertMarkdown("**", "**")}
          />
          <ToolbarButton
            label="I"
            onPress={() => insertMarkdown("*", "*")}
          />
          <ToolbarButton
            label="~"
            onPress={() => insertMarkdown("~~", "~~")}
          />
        </View>
      </View>
      <View style={styles.toolbar}>
        <View style={styles.toolbarLeft}>
          <ToolbarButton
            icon="ellipse"
            onPress={() => prependLine("- ")}
          />
          <ToolbarButton
            label="1."
            onPress={() => prependLine("1. ")}
          />
          <ToolbarButton
            icon="checkbox"
            onPress={() => prependLine("- [ ] ")}
          />
          <ToolbarButton
            icon="chatbox-ellipses"
            onPress={() => prependLine("> ")}
          />
          <ToolbarButton
            icon="grid"
            onPress={insertTable}
          />
          <ToolbarButton
            icon="link"
            onPress={() => insertMarkdown("[", "](url)")}
          />
          <ToolbarButton
            icon="image"
            onPress={() => insertMarkdown("![alt](", ")")}
          />
        </View>
        <View style={styles.toolbarRight}>
          <Pressable
            onPress={() => toggleMode("edit")}
            style={[
              styles.modeButton,
              {
                backgroundColor:
                  mode === "edit" ? colors.primary + "20" : "transparent",
              },
            ]}
          >
            <MyText
              variant="small"
              weight="semi"
              style={{ color: mode === "edit" ? colors.primary : colors.textMuted }}
            >
              {t("notes.edit_mode")}
            </MyText>
          </Pressable>
          <Pressable
            onPress={() => toggleMode("preview")}
            style={[
              styles.modeButton,
              {
                backgroundColor:
                  mode === "preview" ? colors.primary + "20" : "transparent",
              },
            ]}
          >
            <MyText
              variant="small"
              weight="semi"
              style={{
                color: mode === "preview" ? colors.primary : colors.textMuted,
              }}
            >
              {t("notes.preview_mode")}
            </MyText>
          </Pressable>
        </View>
      </View>

      {mode === "edit" ? (
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            {
              backgroundColor: colors.surface,
              color: colors.text,
              borderColor: colors.hover,
            },
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          multiline
          textAlignVertical="top"
          {...props}
        />
      ) : (
        <ScrollView
          style={[
            styles.preview,
            {
              backgroundColor: colors.surface,
              borderColor: colors.hover,
            },
          ]}
          contentContainerStyle={styles.previewContent}
        >
          {value ? (
            <Markdown style={markdownStyles}>{value}</Markdown>
          ) : (
            <MyText color="textMuted">{placeholder}</MyText>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 150,
  },
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  toolbarLeft: {
    flexDirection: "row",
    gap: 2,
  },
  toolbarRight: {
    flexDirection: "row",
    gap: 4,
  },
  toolbarButton: {
    padding: 8,
    borderRadius: 6,
  },
  modeButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    minHeight: 120,
  },
  preview: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    minHeight: 120,
  },
  previewContent: {
    flexGrow: 1,
  },
});
