import React, {
  createContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import i18n from "@/utils/localization/i18n";
import { TFunction } from "i18next";
import { LocaleSettings, getSystemLocale } from "@/utils/localization/types";
import {
  formatCurrency as formatCurrencyOriginal,
  formatNumber as formatNumberOriginal,
} from "@/utils/localization/formatters";

const STORAGE_KEY = "@nodus_locale_settings";

interface LocalizationContextProps {
  settings: LocaleSettings;
  updateSettings: (newSettings: Partial<LocaleSettings>) => Promise<void>;
  isHydrated: boolean;
  formatCurrency: (amount: number) => string;
  formatNumber: (value: number, precision?: number) => string;
  t: TFunction<"translation", undefined>;
}

export const LocalizationContext = createContext<
  LocalizationContextProps | undefined
>(undefined);

export const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<LocaleSettings>(getSystemLocale());
  const [isHydrated, setIsHydrated] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setSettings(parsed);
          i18n.changeLanguage(parsed.languageCode);
        }
      } catch (e) {
        console.error("Error loading locale", e);
      } finally {
        setIsHydrated(true);
      }
    };
    loadSettings();
  }, []);

  const updateSettings = async (newProps: Partial<LocaleSettings>) => {
    const updated = { ...settings, ...newProps };
    setSettings(updated);
    if (newProps.languageCode) i18n.changeLanguage(newProps.languageCode);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const formatNumber = useCallback(
    (value: number, precision: number = 2) => {
      return formatNumberOriginal(settings, value, precision);
    },
    [settings],
  );

  const formatCurrency = useCallback(
    (amount: number) => {
      return formatCurrencyOriginal(settings, amount);
    },
    [settings],
  );

  const value = useMemo(
    () => ({
      settings,
      updateSettings,
      isHydrated,
      formatCurrency,
      formatNumber,
      t,
    }),
    [settings, isHydrated, formatCurrency, formatNumber, t],
  );

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
};
