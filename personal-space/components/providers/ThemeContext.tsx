import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setBackgroundColorAsync } from "expo-system-ui";
import { Themes, ThemePalette } from "@/constants/themes";

type ThemeID = keyof typeof Themes | "system";
const THEME_STORAGE_KEY = "@nodus_theme_id";

interface ThemeContextProps {
  theme: ThemePalette;
  themeId: ThemeID;
  setTheme: (id: ThemeID) => Promise<void>;
  isHydrated: boolean;
}

export const ThemeContext = createContext<ThemeContextProps | undefined>(
  undefined,
);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const systemColorScheme = useColorScheme();
  const [themeId, setThemeIdState] = useState<ThemeID>("system");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        let themeToUse: keyof typeof Themes | "system" = "system";
        
        if (saved && (Themes[saved] || saved === "system")) {
          themeToUse = saved as ThemeID;
          setThemeIdState(themeToUse);
        }
        
        const themeId = themeToUse === "system" 
          ? (systemColorScheme === "dark" ? "dark" : "light") 
          : themeToUse;
        const theme = Themes[themeId] || Themes.light;
        await setBackgroundColorAsync(theme.colors.background);
      } catch (e) {
        console.error("Error hidratando tema", e);
      } finally {
        setIsHydrated(true);
      }
    };
    hydrate();
  }, []);

  const setTheme = async (id: ThemeID) => {
    setThemeIdState(id);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, id);
    
    const themeId = id === "system" 
      ? (systemColorScheme === "dark" ? "dark" : "light") 
      : id;
    const theme = Themes[themeId] || Themes.light;
    await setBackgroundColorAsync(theme.colors.background);
  };

  const activeTheme = useMemo(() => {
    let idToUse = themeId;
    if (themeId === "system") {
      idToUse = systemColorScheme === "dark" ? "dark" : "light";
    }
    return Themes[idToUse] || Themes.light;
  }, [themeId, systemColorScheme]);

  return (
    <ThemeContext.Provider
      value={{ theme: activeTheme, setTheme, themeId, isHydrated }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
