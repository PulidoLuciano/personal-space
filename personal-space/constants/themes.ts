export interface ThemePalette {
  id: string;
  name: string;
  isDark: boolean;
  colors: {
    background: string;
    surface: string;
    primary: string;
    secondary: string;
    text: string;
    textMuted: string;
    accent: string;

    // Estados de interacción
    hover: string;
    press: string;

    // Feedback semántico
    danger: string;
    warning: string;
    info: string;
    success: string; // "Accept"
  };
}

export const Themes: Record<string, ThemePalette> = {
  light: {
    id: "light",
    name: "Claro",
    isDark: false,
    colors: {
      background: "#F8F9FB",
      surface: "#FFFFFF",
      primary: "#1A1A1A",
      secondary: "#4A90E2",
      text: "#1A1A1A",
      textMuted: "#999999",
      accent: "#E8F2FF",
      hover: "rgba(0,0,0,0.05)",
      press: "rgba(0,0,0,0.1)",
      danger: "#FF5252",
      warning: "#FFC107",
      info: "#2196F3",
      success: "#4CAF50",
    },
  },
  dark: {
    id: "dark",
    name: "Oscuro",
    isDark: true,
    colors: {
      background: "#121212",
      surface: "#1E1E1E",
      primary: "#FFFFFF",
      secondary: "#BB86FC",
      text: "#E1E1E1",
      textMuted: "#757575",
      accent: "#2C2C2C",
      hover: "rgba(255,255,255,0.05)",
      press: "rgba(255,255,255,0.1)",
      danger: "#CF6679",
      warning: "#FBC02D",
      info: "#64B5F6",
      success: "#81C784",
    },
  },
  // Ejemplo de cómo agregar uno nuevo fácilmente
  oled: {
    id: "oled",
    name: "OLED Black",
    isDark: true,
    colors: {
      /* ... mismos campos con background #000000 ... */
      background: "#000000",
      surface: "#0A0A0A",
      primary: "#FFFFFF",
      secondary: "#00FF41", // Un verde Matrix por diversión
      text: "#FFFFFF",
      textMuted: "#444444",
      accent: "#111111",
      hover: "#111111",
      press: "#222222",
      danger: "#FF3B30",
      warning: "#FFCC00",
      info: "#007AFF",
      success: "#34C759",
    },
  },
};
