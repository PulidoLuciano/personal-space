import { useCallback, useEffect, useRef, useState } from "react";
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { Spacing, FontSize } from "@/constants/spacing";

interface MarkdownEditorProps {
  visible: boolean;
  initialValue: string;
  onSave: (markdown: string) => void;
  onCancel: () => void;
}

const HTML_TEMPLATE = `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/vditor@3.10.3/dist/index.css" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #fff; }
  #vditor { height: 100vh; border: none; }
  .vditor { height: 100vh !important; border: none !important; }
  .vditor-toolbar { background: #f8f9fa; border-bottom: 1px solid #e9ecef; }
  .vditor-content { background: #fff; }
  @media (prefers-color-scheme: dark) {
    body { background: #1c1c1e; }
    .vditor-toolbar { background: #2c2c2e; border-color: #3a3a3c; }
    .vditor-content { background: #1c1c1e; }
    .vditor-toolbar__item svg { fill: #ccc; }
    .vditor-toolbar__item:hover { background: #3a3a3c; }
    .vditor-reset { color: #e5e5e7; }
    .vditor-ir__marker { color: #8e8e93; }
  }
</style>
</head>
<body>
<div id="vditor"></div>
<script src="https://cdn.jsdelivr.net/npm/vditor@3.10.3/dist/index.min.js"></script>
<script>
  var vditor = null;
  var pendingContent = __INITIAL_CONTENT__;
  var isReady = false;

  function getToolbar() {
    return [
      'headings', 'bold', 'italic', 'strike', 'link', '|',
      'list', 'ordered-list', 'check', 'outdent', 'indent', '|',
      'quote', 'line', 'code', 'inline-code', '|',
      'table', 'image', '|',
      'undo', 'redo', '|',
      'edit-mode', 'both', 'preview', 'fullscreen'
    ];
  }

  function initVditor() {
    if (vditor) return;
    vditor = new Vditor('vditor', {
      mode: 'wysiwyg',
      toolbar: getToolbar(),
      placeholder: 'Write description...',
      cache: { enable: false },
      height: window.innerHeight,
      lang: 'en_US',
      after: function() {
        isReady = true;
        if (pendingContent) {
          vditor.setValue(pendingContent);
          pendingContent = null;
        }
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready' }));
      },
      input: function(value) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'change',
          content: value
        }));
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
    if (typeof Vditor !== 'undefined') {
      initVditor();
    } else {
      var checkInterval = setInterval(function() {
        if (typeof Vditor !== 'undefined') {
          clearInterval(checkInterval);
          initVditor();
        }
      }, 100);
    }
  });

  window.addEventListener('message', function(event) {
    try {
      var data = JSON.parse(event.data);
      if (data.type === 'setContent') {
        if (isReady && vditor) {
          vditor.setValue(data.content);
        } else {
          pendingContent = data.content;
        }
      } else if (data.type === 'getContent') {
        if (isReady && vditor) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'content',
            content: vditor.getValue()
          }));
        }
      }
    } catch (e) {}
  });

  try {
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready' }));
  } catch (e) {}
</script>
</body>
</html>`;

function getHtml(initialContent: string): string {
  const escaped = initialContent
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$/g, "\\$");
  return HTML_TEMPLATE.replace("__INITIAL_CONTENT__", `\`${escaped}\``);
}

export function MarkdownEditor({
  visible,
  initialValue,
  onSave,
  onCancel,
}: MarkdownEditorProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = Colors[isDark ? "dark" : "light"];
  const webViewRef = useRef<WebView>(null);
  const [currentContent, setCurrentContent] = useState(initialValue);

  useEffect(() => {
    if (visible) {
      setCurrentContent(initialValue);
    }
  }, [visible, initialValue]);

  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "change") {
        setCurrentContent(data.content);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  const handleSave = useCallback(() => {
    onSave(currentContent);
  }, [currentContent, onSave]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onCancel}
    >
      <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
          <TouchableOpacity onPress={onCancel} style={styles.headerButton}>
            <ThemedText type="defaultSemiBold" style={{ color: colors.tint }}>
              Cancel
            </ThemedText>
          </TouchableOpacity>
          <ThemedText type="defaultSemiBold" style={{ color: colors.text }}>
            Edit Description
          </ThemedText>
          <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
            <ThemedText type="defaultSemiBold" style={{ color: colors.tint }}>
              Save
            </ThemedText>
          </TouchableOpacity>
        </View>
        <View style={styles.editorContainer}>
          <WebView
            ref={webViewRef}
            source={{ html: getHtml(initialValue) }}
            onMessage={handleMessage}
            style={styles.webview}
            javaScriptEnabled
            domStorageEnabled
            originWhitelist={["*"]}
            mixedContentMode="always"
            keyboardDisplayRequiresUserAction={false}
            hideKeyboardAccessoryView={false}
          />
        </View>
        <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
          <ThemedText type="default" style={{ color: colors.textSecondary, fontSize: FontSize.xs }}>
            Markdown supported — use toolbar for formatting
          </ThemedText>
        </View>
      </ThemedView>
    </Modal>
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingTop: 60,
    borderBottomWidth: 1,
  },
  headerButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  editorContainer: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    alignItems: "center",
  },
});
