import { TranslationKeys } from "./translations";
import { es } from "./es";
import { en } from "./en";

export const resources: Record<string, { translation: TranslationKeys }> = {
  es: { translation: es },
  en: { translation: en },
};
