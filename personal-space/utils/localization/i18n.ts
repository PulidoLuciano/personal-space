import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { resources } from "@/constants/localization";

i18n.use(initReactI18next).init({
  resources,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

// Tipado para que t('clave') tenga autocompletado
declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: (typeof resources)["es"];
  }
}

export default i18n;
