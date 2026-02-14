import { useContext } from "react";
import { LocalizationContext } from "@/components/providers/LocalizationContext";

export const useLocale = () => {
  const context = useContext(LocalizationContext);

  if (context === undefined) {
    throw new Error(
      "useLocale debe ser usado dentro de un LocalizationProvider",
    );
  }

  return context;
};
