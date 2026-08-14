import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import ThemeProviderClient from "@/lib/theme";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "EarnCoin — Online Rewards, Video Promotion & Business Advertisement Platform",
  description:
    "EarnCoin lets you earn reward points by watching promotional videos, completing tasks, joining events, inviting friends, and participating in earning rooms. Businesses can promote products, brands, and social content.",
  keywords: [
    "EarnCoin",
    "online rewards",
    "video promotion",
    "business advertisement",
    "earn points",
    "referral",
    "withdrawal",
  ],
  icons: {
    icon: "/favicon.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "EarnCoin — Online Rewards Platform",
    description: "Earn rewards by watching videos, completing tasks, and inviting friends.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className="overflow-x-hidden">
      <body className={`${geistSans.variable} antialiased bg-background text-foreground overflow-x-hidden w-full relative`} suppressHydrationWarning>
        <ThemeProviderClient>
          <div className="min-h-screen flex flex-col bg-background">
            <Suspense fallback={<main className="flex-1">{children}</main>}>
              <LayoutWrapper>{children}</LayoutWrapper>
            </Suspense>
          </div>
        </ThemeProviderClient>
      </body>
    </html>
  );
}
