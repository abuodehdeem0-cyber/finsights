"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { Locale, localeDirections, localeFonts } from "@/i18n/config";
import { getTranslations, Translations } from "./translations";

interface LanguageContextType {
  locale: Locale;
  direction: "ltr" | "rtl";
  fontFamily: string;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  isRTL: boolean;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = "finsight-locale";

interface LanguageProviderProps {
  children: ReactNode;
  initialLocale: Locale;
}

export function LanguageProvider({ children, initialLocale }: LanguageProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check localStorage for saved preference
    const savedLocale = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (savedLocale && (savedLocale === "en" || savedLocale === "ar")) {
      setLocaleState(savedLocale);
    }
  }, []);

  useEffect(() => {
    // Update document direction when locale changes
    const direction = localeDirections[locale];
    document.documentElement.dir = direction;
    document.documentElement.lang = locale;
    
    // Apply font family
    const fontFamily = localeFonts[locale];
    document.documentElement.style.fontFamily = fontFamily;

    // Load Arabic font if needed
    if (locale === "ar") {
      loadArabicFont();
    }
  }, [locale]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
  }, []);

  const toggleLocale = useCallback(() => {
    const newLocale = locale === "en" ? "ar" : "en";
    setLocale(newLocale);
  }, [locale, setLocale]);

  const loadArabicFont = () => {
    // Check if already loaded
    if (document.getElementById("arabic-font")) return;

    const link = document.createElement("link");
    link.id = "arabic-font";
    link.href = "https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&family=Cairo:wght@300;400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  };

  const direction = localeDirections[locale];
  const fontFamily = localeFonts[locale];
  const isRTL = direction === "rtl";

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  const t = getTranslations(locale);

  return (
    <LanguageContext.Provider
      value={{
        locale,
        direction,
        fontFamily,
        setLocale,
        toggleLocale,
        isRTL,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    // Return default values instead of throwing error
    // This allows components to work during redirects before LanguageProvider is mounted
    return {
      locale: "en" as const,
      direction: "ltr" as const,
      fontFamily: "Inter, system-ui, sans-serif",
      setLocale: () => {},
      toggleLocale: () => {},
      isRTL: false,
      t: getTranslations("en"),
    };
  }
  return context;
}
