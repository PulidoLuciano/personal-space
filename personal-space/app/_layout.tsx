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

import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
  anchor: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    async function setup() {
      try {
        // Ejecuta el script de creación de tablas
        await initializeDatabase();
        setDbReady(true);
      } catch (e) {
        console.warn("Error inicializando la DB:", e);
      } finally {
        // Oculta la pantalla de carga una vez listo
        await SplashScreen.hideAsync();
      }
    }

    setup();
  }, []);

  if (!dbReady) {
    // Puedes retornar un componente de carga personalizado aquí
    return null;
  }

  return (
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
  );
}
