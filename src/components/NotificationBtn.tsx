"use client";

import { usePushNotification } from "@/hooks/usePushNotification";

export default function NotificationBtn() {
  const { subscribeUser } = usePushNotification();

  const handleEnableNotifications = async () => {
    const sub = await subscribeUser();
    if (sub) {
      alert("通知權限已開啟！");
      // 下一階段：我們會將此 sub 傳送到 Supabase
      console.log("這就是我們要存入資料庫的 JSON:", JSON.stringify(sub));
    } else {
      alert("開啟失敗，請檢查權限設定");
    }
  };

  return (
    <button
      onClick={handleEnableNotifications}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition shadow-md"
    >
      開啟司機訂閱通知
    </button>
  );
}:
