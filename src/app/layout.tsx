import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";

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
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} antialiased bg-background text-foreground`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
          <Toaster />
          <SonnerToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
