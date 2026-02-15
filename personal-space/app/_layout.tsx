import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import "react-native-reanimated";
import { useState, useEffect, useCallback } from "react";
import { initializeDatabase, deleteDatabase } from "@/database/initializeDatabase";
import { SQLiteDatabase } from "expo-sqlite";

import { DependenciesProvider, ResetDatabaseProvider } from "@/components/providers/DatabaseContext";
import { ThemeProvider } from "@/components/providers/ThemeContext";
import { LocalizationProvider } from "@/components/providers/LocalizationContext";

export const unstable_settings = {
  anchor: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [db, setDb] = useState<SQLiteDatabase | null>(null);
  const [dbKey, setDbKey] = useState(0);

  const initDb = useCallback(async () => {
    try {
      const database = await initializeDatabase();
      setDb(database);
    } catch (e) {
      console.warn("Error inicializando la DB:", e);
    } finally {
      await SplashScreen.hideAsync();
    }
  }, []);

  useEffect(() => {
    initDb();
  }, [initDb, dbKey]);

  const handleReset = useCallback(async () => {
    if (db) {
      await db.closeAsync();
    }
    await deleteDatabase();
    setDb(null);
    setDbKey((prev) => prev + 1);
  }, [db]);

  if (!db) {
    return null;
  }

  return (
    <ResetDatabaseProvider onReset={handleReset}>
      <DependenciesProvider db={db}>
        <LocalizationProvider>
          <ThemeProvider>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="[projectId]"
                options={{
                  headerShown: false,
                  presentation: "card",
                }}
              />
              <Stack.Screen
                name="modal/create"
                options={{
                  presentation: "modal",
                  headerShown: false,
                  contentStyle: { backgroundColor: "transparent" },
                }}
              />
              <Stack.Screen
                name="modal/create-project"
                options={{
                  presentation: "modal",
                  headerShown: false,
                  contentStyle: { backgroundColor: "transparent" },
                }}
              />
            </Stack>
          </ThemeProvider>
        </LocalizationProvider>
      </DependenciesProvider>
    </ResetDatabaseProvider>
  );
}
