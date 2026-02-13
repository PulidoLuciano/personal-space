import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import "react-native-reanimated";
import { useState, useEffect } from "react";
import { initializeDatabase } from "@/database/initializeDatabase";
import { SQLiteDatabase } from "expo-sqlite";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { DependenciesProvider } from "@/components/providers/DatabaseContext";

export const unstable_settings = {
  anchor: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [db, setDb] = useState<SQLiteDatabase | null>(null);

  useEffect(() => {
    async function setup() {
      try {
        // Ejecuta el script de creación de tablas
        const database = await initializeDatabase();
        setDb(database);
      } catch (e) {
        console.warn("Error inicializando la DB:", e);
      } finally {
        // Oculta la pantalla de carga una vez listo
        await SplashScreen.hideAsync();
      }
    }

    setup();
  }, []);

  if (!db) {
    return null;
  }

  return (
    <DependenciesProvider db={db}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </DependenciesProvider>
  );
}
