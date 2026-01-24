"use client";

import React, { useState } from 'react';
import { usePushNotification } from "@/hooks/usePushNotification";
import { BellRing, Loader2 } from 'lucide-react';

export default function NotificationBtn() {
  const { subscribeUser } = usePushNotification();
  const [isLoading, setIsLoading] = useState(false);

  const handleEnableNotifications = async () => {
    setIsLoading(true);

    try {
      // Step A: 向瀏覽器請求訂閱 (取得 endpoint/keys)
      const sub = await subscribeUser();

      if (sub) {
        // Step B: 透過 API Route 存入 Supabase
        const response = await fetch('/api/push/subscribe', {
          method: 'POST',
          body: JSON.stringify({ subscription: sub }),
          headers: { 'Content-Type': 'application/json' },
        });

        const result = await response.json();

        if (response.ok && result.success) {
          alert("Notifications Enabled Successfully!");
        } else {
          alert(`Server Error: ${result.error || 'Failed to save'}`);
        }
      } else {
        alert("Failed to enable notifications. Please check permissions.");
      }
    } catch (error) {
      console.error("Button Error:", error);
      alert("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleEnableNotifications}
      disabled={isLoading}
      className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <BellRing className="h-5 w-5" />
      )}
      {isLoading ? "Processing..." : "Enable Driver Alerts"}
    </button>
  );
}
