"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Globe } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { Locale, localeFlags, localeNames } from "@/i18n/config";
import { getTranslations } from "@/lib/translations";

export function LanguageSwitcher() {
  const { locale, setLocale, isRTL } = useLanguage();

  const toggleLanguage = () => {
    const newLocale: Locale = locale === "en" ? "ar" : "en";
    setLocale(newLocale);
  };

  return (
    <motion.button
      onClick={toggleLanguage}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-card hover:bg-noir-crimson/20 transition-colors"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <Globe className="w-4 h-4 text-noir-crimson-light" />
      <AnimatePresence mode="wait">
        <motion.span
          key={locale}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="text-sm font-medium text-noir-gray flex items-center gap-1.5"
        >
          <span>{localeFlags[locale]}</span>
          <span>{localeNames[locale]}</span>
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

// Compact version for mobile or tight spaces
export function LanguageSwitcherCompact() {
  const { locale, setLocale } = useLanguage();
  const t = getTranslations(locale);

  return (
    <motion.button
      onClick={() => setLocale(locale === "en" ? "ar" : "en")}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="w-8 h-8 rounded-full glass-card flex items-center justify-center hover:bg-noir-crimson/20 transition-colors"
      title={locale === "en" ? t.language.switchToArabic : t.language.switchToEnglish}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={locale}
          initial={{ opacity: 0, rotate: -90 }}
          animate={{ opacity: 1, rotate: 0 }}
          exit={{ opacity: 0, rotate: 90 }}
          transition={{ duration: 0.2 }}
          className="text-sm font-medium"
        >
          {localeFlags[locale]}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
