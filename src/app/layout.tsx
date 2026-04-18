import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FinSight | Premium Financial Terminal",
  description: "High-performance financial analysis platform with AI-powered investment signals",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="animated-gradient min-h-screen">
        {children}
      </body>
    </html>
  );
}
