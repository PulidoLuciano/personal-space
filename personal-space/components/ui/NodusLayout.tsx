import React from "react";
import { View, StatusBar, StyleSheet, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../hooks/useTheme";

interface Props {
  children: React.ReactNode;
  useSafeArea?: boolean;
  safeAreaEdges?: ("top" | "bottom" | "left" | "right")[];
}

export const NodusLayout: React.FC<Props> = ({
  children,
  useSafeArea = true,
  safeAreaEdges = ["top", "bottom"],
}) => {
  const { theme, isHydrated, colors } = useTheme();
  const insets = useSafeAreaInsets();

  if (!isHydrated) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: "#000", justifyContent: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  const safeAreaStyle = useSafeArea
    ? {
        paddingTop: safeAreaEdges.includes("top") ? insets.top : 0,
        paddingBottom: safeAreaEdges.includes("bottom") ? insets.bottom : 0,
        paddingLeft: safeAreaEdges.includes("left") ? insets.left : 0,
        paddingRight: safeAreaEdges.includes("right") ? insets.right : 0,
      }
    : {};

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={theme.isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
        // Para Android, asegura que el contenido pueda verse detrás de la status bar si se desea
        translucent={true}
      />
      <View style={[styles.flex, safeAreaStyle]}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
});
