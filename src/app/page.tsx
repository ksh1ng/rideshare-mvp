// src/app/page.tsx
// 此為 Server Component，預設不需要 "use client"

import Link from 'next/link'; // 使用 next/link 替換所有 react-router-dom 或標準 <a> 標籤
import { Search } from 'lucide-react'; // 引入圖示

// 搜尋 Bar 組件 (包含輸入框和搜尋按鈕)
const SimpleSearchBar = () => {
  return (
    <div className="flex w-full max-w-2xl rounded-full bg-white p-2 shadow-2xl shadow-blue-400/30">
      <input
        type="text"
        placeholder="從哪裡出發？"
        className="flex-1 px-4 py-2 rounded-l-full focus:outline-none text-gray-700"
      />
      <input
        type="text"
        placeholder="要去哪裡？"
        className="flex-1 px-4 py-2 focus:outline-none border-l border-gray-200 text-gray-700"
      />
      <Link
        href="/rides" // 導航到行程列表頁
        className="flex items-center justify-center rounded-full bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 transition duration-150"
      >
        <Search className="w-5 h-5 mr-2" /> 搜尋順風車
      </Link>
    </div>
  );
};

export default function HomePage() {
  return (
    // 使用 Tailwind CSS 設定佈局
    <div className="min-h-[90vh] flex flex-col items-center justify-center bg-blue-50">
      {/* 標題區塊 */}
      <header className="text-center mb-12">
        <h1 className="text-6xl font-extrabold text-blue-800 mb-4">
          👋 順路共乘，環保又省錢
        </h1>
        <p className="text-xl text-gray-600">
          讓您的旅途充滿人情味。尋找順風車，或分享您的空位。
        </p>
      </header>

      {/* 核心搜尋功能 */}
      <SimpleSearchBar />

      {/* 呼籲行動按鈕 */}
      <div className="mt-12 text-center">
        <p className="text-lg text-gray-700 mb-4">
          想提供空位給別人嗎？
        </p>
        <Link
          href="/rides/create"
          className="inline-flex items-center rounded-lg bg-emerald-600 px-6 py-3 text-white text-lg font-semibold shadow-lg hover:bg-emerald-700 transition duration-200"
        >
          刊登行程，車徵人！
        </Link>
      </div>

      {/* 專案技術標示 (可選) */}
      <footer className="mt-20 text-sm text-gray-400">
        Powered by Next.js, Supabase, and Tailwind CSS (MVP)
      </footer>
    </div>
  );
}
