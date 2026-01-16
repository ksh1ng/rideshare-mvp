// src/components/NotificationBtn.tsx (建議內容)
"use client";

import { usePushNotification } from "@/hooks/usePushNotification";

export default function NotificationBtn() {
  const { subscribeUser } = usePushNotification();

  const handleEnableNotifications = async () => {
    const sub = await subscribeUser();
    if (sub) {
      alert("Notifications Enabled Successfully!");
      console.log("Subscription JSON:", JSON.stringify(sub));
    } else {
      alert("Failed to enable notifications. Please check permissions.");
    }
  };

  return (
    <button
      onClick={handleEnableNotifications}
      className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg active:scale-95"
    >
      Enable Driver Alerts
    </button>
  );
}
