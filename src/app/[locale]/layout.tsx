import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Inter, Cairo } from "next/font/google";
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });
const cairo = Cairo({ subsets: ["arabic"] });
import { Navigation } from "@/components/navigation";
import { LanguageProvider } from "@/lib/language-context";
import { Providers } from "@/components/providers";

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
      <body className={`animated-gradient min-h-screen ${locale === "ar" ? cairo.className : inter.className}`}>
        <LanguageProvider initialLocale={locale as "en" | "ar"}>
          <Providers>
            <div className="grid-pattern min-h-screen">
              <Navigation />
              <main className="relative z-10 pt-16">{children}</main>
            </div>
          </Providers>
        </LanguageProvider>
      </body>
    </html>
  );
}
