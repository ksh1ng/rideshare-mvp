import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// 1. PWA 與 iOS 相關的 Metadata 設定
export const metadata: Metadata = {
  title: "RideShare - 大學共乘平台",
  description: "快速、安全、便利的校園共乘媒合服務",
  manifest: "/manifest.json", // 指向 public/manifest.json
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RideShare",
    // 這裡可以定義 iOS 啟動畫面圖示
  },
  formatDetection: {
    telephone: false, // 防止數字被自動轉成連結（我們在 My Trips 手動處理過了）
  },
};

// 2. 針對手機版體驗的 Viewport 設定
export const viewport: Viewport = {
  themeColor: "#2563eb", // 瀏覽器工具列顏色（對應你的品牌藍）
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // 禁用縮放，使 UI 操作更像原生 App
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <head>
        {/* iOS 圖示設定 */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        {/* 確保 PWA 的色彩在各系統一致 */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${inter.className} bg-slate-50 antialiased`}>
        <main className="min-h-screen">
          {children}
        </main>

        {/* 提示：如果你之後實作了 MobileBottomNav 組件，
            通常會放在這裡，並判斷是否為手機尺寸顯示。
        */}
      </body>
    </html>
  );
}
