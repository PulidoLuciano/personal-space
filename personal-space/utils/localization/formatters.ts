import { LocaleSettings } from "./types";

export const formatNumber = (
  settings: LocaleSettings,
  value: number,
  precision: number = 2,
): string => {
  let fixedValue = value.toFixed(precision);
  let [integerPart, decimalPart] = fixedValue.split(".");

  if (settings.digitGroupingSeparator) {
    integerPart = integerPart.replace(
      /\B(?=(\d{3})+(?!\d))/g,
      settings.digitGroupingSeparator,
    );
  }

  return precision > 0
    ? `${integerPart}${settings.decimalSeparator}${decimalPart}`
    : integerPart;
};

export const formatCurrency = (settings: LocaleSettings, amount: number) => {
  return `${settings.currencySymbol}${formatNumber(settings, amount, 2)}`;
};
