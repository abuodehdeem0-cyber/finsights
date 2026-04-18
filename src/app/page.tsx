"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getTranslations } from "@/lib/translations";

export default function RootPage() {
  const router = useRouter();
  const [t, setT] = useState(getTranslations("en"));

  useEffect(() => {
    // Check localStorage for saved locale
    const savedLocale = localStorage.getItem("finsight-locale") as "en" | "ar" | null;
    if (savedLocale) {
      setT(getTranslations(savedLocale));
    }
    // Redirect to default or saved locale
    router.replace(`/${savedLocale || "en"}`);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-noir-dark">
      <div className="animate-pulse text-noir-gray">{t.common.loading}</div>
    </div>
  );
}
