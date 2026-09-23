import { ThemeProvider } from "@/components/ThemeProvider";
import { PushNotificationManager } from "@/components/PushNotificationManager";
import { BottomNav } from "@/components/BottomNav";
import { Geist, Geist_Mono } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dashboard - Promo Automation",
  description: "Sistem Manajemen Promo Beauty Kendari",
  manifest: "/manifest.json",
  applicationName: "Promo Auto",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Promo Auto",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#09090b" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <PushNotificationManager />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <BottomNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
