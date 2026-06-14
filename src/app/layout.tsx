import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Dietética Celina | Alimentos que nutren tu bienestar",
    template: "%s | Dietética Celina",
  },
  description:
    "Dietética Celina, Rosario. Semillas, cereales, especias, granola y productos naturales para una mejor calidad de vida.",
  keywords: [
    "dietética",
    "alimentos naturales",
    "semillas",
    "cereales",
    "granola",
    "especias",
    "Rosario",
    "Argentina",
  ],
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "Dietética Celina",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${playfairDisplay.variable} ${dmSans.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
