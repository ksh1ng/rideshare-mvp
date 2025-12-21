import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar"; // 1. 引入 Navbar 組件

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RideShare - 輕鬆共乘",
  description: "全台最便利的共乘媒合平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50`}
      >
        {/* 2. 放置 Navbar，它會顯示在所有頁面最上方 */}
        <Navbar />

        {/* 3. 使用 main 包裹內容，確保佈局整齊 */}
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
