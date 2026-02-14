import { useContext } from "react";
import { ThemeContext } from "@/components/providers/ThemeContext";

/**
 * Hook para acceder al sistema de diseño de Nodus.
 * Proporciona el tema activo (colores), los tokens (espaciado, radio)
 * y la función para cambiar el tema.
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error("useTheme debe ser usado dentro de un ThemeProvider");
  }

  const { theme, setTheme, themeId, isHydrated } = context;

  const isDark = theme.isDark;

  return {
    theme,
    colors: theme.colors,
    setTheme,
    themeId,
    isHydrated,
    isDark,
  };
};
