"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      // 使用全新的檔名避開衝突，並加上時間戳記破除快取
      const swUrl = `/push-sw.js?v=${Date.now()}`;

      navigator.serviceWorker
        .register(swUrl)
        .then((reg) => {
          console.log("推播 Service Worker 註冊成功，範圍:", reg.scope);
          // 強制檢查更新
          reg.update();
        })
        .catch((err) => {
          console.error("Service Worker 註冊失敗:", err);
        });
    }
  }, []);

  return null; // 這個組件不需要渲染任何內容
}
