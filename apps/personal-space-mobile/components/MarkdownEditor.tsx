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

const DARK_STYLES = `
    body { background: #1c1c1e !important; }
    .vditor { background: #1c1c1e !important; }
    .vditor-toolbar { background: #2c2c2e !important; border-color: #3a3a3c !important; }
    .vditor-content { background: #1c1c1e !important; }
    .vditor-toolbar__item svg { fill: #ccc !important; }
    .vditor-toolbar__item:hover { background: #3a3a3c !important; }
    .vditor-reset * { color: #e5e5e7 !important; }
    .vditor-wysiwyg { background: #1c1c1e !important; color: #e5e5e7 !important; }
    .vditor-wysiwyg__block { color: #e5e5e7 !important; }
    .vditor-wysiwyg p,
    .vditor-wysiwyg h1,
    .vditor-wysiwyg h2,
    .vditor-wysiwyg h3,
    .vditor-wysiwyg h4,
    .vditor-wysiwyg h5,
    .vditor-wysiwyg h6,
    .vditor-wysiwyg li,
    .vditor-wysiwyg td,
    .vditor-wysiwyg th,
    .vditor-wysiwyg blockquote,
    .vditor-wysiwyg pre,
    .vditor-wysiwyg code,
    .vditor-wysiwyg span { color: #e5e5e7 !important; }
    .vditor-ir__marker { color: #8e8e93 !important; }
    .vditor-input { color: #e5e5e7 !important; background: #1c1c1e !important; }
    .vditor-placeholder { color: #6b7280 !important; }
    .vditor-toolbar__divider { border-left-color: #3a3a3c !important; }
    .vditor-panel { background: #2c2c2e !important; border-color: #3a3a3c !important; }
    .vditor-panel--arrow::before { background: #2c2c2e !important; border-color: #3a3a3c !important; }
    .vditor-toolbar__item.vditor-toolbar__item--current { background: #3a3a3c !important; }
    .vditor-preview { background: #1c1c1e !important; }
    .vditor-preview__block { color: #e5e5e7 !important; }
`;

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
  __DARK_STYLES__
</style>
</head>
<body>
<div id="vditor" __VDITOR_CLASS__></div>
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
      theme: '__VDITOR_THEME__',
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

function getHtml(initialContent: string, isDark: boolean): string {
  const escaped = initialContent
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$/g, "\\$");
  return HTML_TEMPLATE
    .replace("__DARK_STYLES__", isDark ? DARK_STYLES : "")
    .replace("__VDITOR_CLASS__", isDark ? 'class="vditor--dark"' : "")
    .replace("__VDITOR_THEME__", isDark ? "dark" : "classic")
    .replace("__INITIAL_CONTENT__", `\`${escaped}\``);
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
            source={{ html: getHtml(initialValue, isDark) }}
            key={isDark ? "dark" : "light"}
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
