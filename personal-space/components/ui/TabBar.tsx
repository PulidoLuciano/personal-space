import React from "react";
import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useTheme } from "../../hooks/useTheme";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export const TabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { colors, theme } = useTheme();
  const router = useRouter();

  // Calculamos el punto medio exacto de las rutas configuradas
  const middleIndex = Math.floor(state.routes.length / 2);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderTopColor: colors.hover },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        // Definimos el item de navegación estándar
        const tabItem = (
          <TabItem
            key={route.key}
            isFocused={isFocused}
            options={options}
            onPress={() => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented)
                navigation.navigate(route.name);
            }}
            colors={colors}
          />
        );

        // Si llegamos al índice medio, insertamos el FAB antes del item actual
        if (index === middleIndex) {
          return (
            <React.Fragment key="center-action-group">
              <TouchableOpacity
                onPress={() => router.push("/modal/create")}
                style={[styles.fab, { backgroundColor: colors.primary }]}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="add"
                  size={32}
                  color={theme.isDark ? colors.background : colors.surface}
                />
              </TouchableOpacity>
              {tabItem}
            </React.Fragment>
          );
        }

        return tabItem;
      })}
    </View>
  );
};

const TabItem = ({ isFocused, options, onPress, colors }: any) => {
  const renderIcon = options.tabBarIcon ? (
    options.tabBarIcon({
      focused: isFocused,
      color: isFocused ? colors.primary : colors.textMuted,
      size: 24,
    })
  ) : (
    <Ionicons
      name="ellipse"
      size={24}
      color={isFocused ? colors.primary : colors.textMuted}
    />
  );

  return (
    <TouchableOpacity onPress={onPress} style={styles.tabItem}>
      {renderIcon}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: Platform.OS === "ios" ? 88 : 88,
    paddingBottom: Platform.OS === "ios" ? 28 : 28,
    borderTopWidth: 1,
    alignItems: "center",
    justifyContent: "space-around",
  },
  tabItem: { flex: 1, alignItems: "center", justifyContent: "center" },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginTop: -30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
