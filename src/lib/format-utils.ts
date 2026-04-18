import { useLanguage } from "./language-context";

// Format currency with locale support
export function formatCurrency(
  value: number,
  currency: string,
  locale: string
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// Format number with locale support
export function formatNumber(
  value: number,
  locale: string,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

// Format percentage with locale support
export function formatPercentage(
  value: number,
  locale: string,
  decimals: number = 2
): string {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}

// Format compact number (for large values like market cap)
export function formatCompactNumber(
  value: number,
  locale: string
): string {
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    compactDisplay: "short",
  }).format(value);
}

// Format date with locale support
export function formatDate(
  date: Date | string,
  locale: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(
    locale,
    options || {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  ).format(d);
}

// Hook for locale-aware formatting
export function useFormatter() {
  const { locale } = useLanguage();

  return {
    currency: (value: number, currency: string) =>
      formatCurrency(value, currency, locale),
    number: (value: number, options?: Intl.NumberFormatOptions) =>
      formatNumber(value, locale, options),
    percentage: (value: number, decimals?: number) =>
      formatPercentage(value, locale, decimals),
    compact: (value: number) => formatCompactNumber(value, locale),
    date: (date: Date | string, options?: Intl.DateTimeFormatOptions) =>
      formatDate(date, locale, options),
    locale,
  };
}

// Convert number to Arabic numerals if in Arabic mode
export function localizeNumber(
  num: number | string,
  locale: string
): string {
  if (locale !== "ar") return String(num);

  // Arabic-Indic numerals
  const arabicNumerals = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

  return String(num)
    .split("")
    .map((char) => {
      const digit = parseInt(char);
      if (!isNaN(digit)) {
        return arabicNumerals[digit];
      }
      return char;
    })
    .join("");
}
