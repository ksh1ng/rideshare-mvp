"use client";

import { urlBase64ToUint8Array } from "@/lib/webPushUtils";

export const usePushNotification = () => {
  const subscribeUser = async () => {
    // 1. 檢查瀏覽器是否支援 Service Worker 與 Push
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.error("此瀏覽器不支援 PWA 推播");
      return null;
    }

    try {
      // 2. 等待 Service Worker 準備就緒
      // @ducanh2912/next-pwa 會自動註冊 sw.js，我們在這裡等待它
      const registration = await navigator.serviceWorker.ready;

      // 3. 檢查現有的訂閱
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log("使用者已經訂閱過:", existingSubscription);
        await existingSubscription.unsubscribe();
        console.log("已清理舊訂閱");
      }

      // 4. 取得公鑰
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      // 診斷：看看 window 物件是否真的沒被注入
      if (typeof window !== "undefined") {
        console.log("Full Env Check:", process.env);
      }
      // 新增這行來檢查
      console.log("Debug VAPID Key:", publicKey); // 確保這裡不是 undefined 或包含多餘引號

      if (!publicKey) throw new Error("缺少 VAPID 公鑰，請檢查 .env.local");

      // 5. 執行訂閱 (這會觸發瀏覽器的權限詢問視窗)
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true, // 規定所有推播都必須讓使用者看見，不能有隱形推播
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      console.log("成功取得新訂閱:", subscription);
      return subscription;
    } catch (error) {
      console.error("訂閱過程中發生錯誤:", error);
      return null;
    }
  };

  return { subscribeUser };
};
