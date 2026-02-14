import * as Localization from "expo-localization";

export type MeasurementSystem = "metric" | "us" | "uk" | null;

export interface LocaleSettings {
  languageCode: string;
  currencyCode: string;
  currencySymbol: string;
  uses24hourClock: boolean;
  firstWeekday: number;
  measurementSystem: MeasurementSystem;
  decimalSeparator: string;
  digitGroupingSeparator: string;
}

export const getSystemLocale = (): LocaleSettings => {
  const device = Localization.getLocales()[0];
  const calendar = Localization.getCalendars()[0];

  return {
    languageCode: device.languageCode ?? "es",
    currencyCode: device.currencyCode ?? "ARS",
    currencySymbol: device.currencySymbol ?? "$",
    uses24hourClock: calendar.uses24hourClock ?? true,
    firstWeekday: calendar.firstWeekday ?? 1,
    measurementSystem:
      (device.measurementSystem as MeasurementSystem) ?? "metric",
    decimalSeparator: device.decimalSeparator ?? ",",
    digitGroupingSeparator: device.digitGroupingSeparator ?? ".",
  };
};
