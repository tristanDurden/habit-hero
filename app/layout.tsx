import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { FloatingTimer } from "./components/timer/FloatingTimer";
import { GlobalTimerTick } from "./components/timer/GlobalTimerTick";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const viewport: Viewport = {
  themeColor: "#000000",
};

export const metadata: Metadata = {
  title: "Habit Hero",
  description: "Track your habits like you are playing a game!",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Habit Hero",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
  icons: {
    apple: [
      { url: "/icons-habit-tracker/apple-touch-icon.png", sizes: "180x180" },
      { url: "/icons-habit-tracker/apple-touch-icon-152x152.png", sizes: "152x152" },
      { url: "/icons-habit-tracker/apple-touch-icon-120x120.png", sizes: "120x120" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
        <GlobalTimerTick />
        <FloatingTimer />
      </body>
    </html>
  );
}
