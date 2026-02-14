import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import "react-native-reanimated";
import { useState, useEffect } from "react";
import { initializeDatabase } from "@/database/initializeDatabase";
import { SQLiteDatabase } from "expo-sqlite";

import { DependenciesProvider } from "@/components/providers/DatabaseContext";
import { ThemeProvider } from "@/components/providers/ThemeContext";

export const unstable_settings = {
  anchor: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
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
      <ThemeProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />
        </Stack>
      </ThemeProvider>
    </DependenciesProvider>
  );
}
