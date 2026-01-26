import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav"; // 這是我們準備加入的手機底部導覽列

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 1. PWA 與 SEO Metadata 設定
export const metadata: Metadata = {
  title: "RideShare - Smart Carpooling",
  description: "Find your carpool buddy easily.",
  manifest: "/manifest.json", // PWA 核心設定
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RideShare",
  },
  formatDetection: {
    telephone: false,
  },
};

// 2. 移動端優化 Viewport 設定
export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // 禁止縮放讓操作更像 App
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* iOS 圖示 */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50`}>
        {/* 在這裡加入註冊組件 */}
        <ServiceWorkerRegister />

        {/* 原本的 Navbar (之後會在組件內加入 hidden md:block 以便在手機隱藏) */}
        <Navbar />

        {/* main 加入 pb-20 是為了在手機版預留空間給底部的 MobileNav，
            md:pb-0 則讓電腦版不留白。
        */}
        <main className="min-h-screen pb-20 md:pb-0">
          {children}
        </main>

        {/* 這裡加入新的手機底部導覽列 */}
        <MobileNav />
      </body>
    </html>
  );
}
