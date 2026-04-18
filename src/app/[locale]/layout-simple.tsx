import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";
import { Navigation } from "@/components/navigation";
import { AuthProvider } from "@/lib/auth-context";
import { LanguageProvider } from "@/lib/language-context";
import { SWRProvider } from "@/components/swr-provider";

export const metadata: Metadata = {
  title: "FinSight | Premium Financial Terminal",
  description: "High-performance financial analysis platform with AI-powered investment signals",
};

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Validate that the incoming locale is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <body className="animated-gradient min-h-screen">
        <LanguageProvider initialLocale={locale as "en" | "ar"}>
          <SWRProvider>
            <AuthProvider>
              <div className="grid-pattern min-h-screen">
                <Navigation />
                <main className="relative z-10 pt-16">{children}</main>
              </div>
            </AuthProvider>
          </SWRProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
