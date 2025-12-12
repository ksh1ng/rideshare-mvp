// src/components/RideCard.tsx
"use client"; // 這是 Client Component，因為它包含按鈕點擊事件和狀態管理（未來擴充）

import { useState } from 'react';
import { MapPin, Clock, Users, DollarSign, ArrowRight, User } from 'lucide-react';

// 從 '@/types' 匯入我們定義的介面（使用 @/* 別名）
import { Ride, UserProfile } from '@/types/index';

// 定義組件的 Props 介面
interface RideCardProps {
  // 將 Ride 類型擴展，加入 creator_profile 以顯示司機或乘客資訊
  ride: Ride & { creator_profile: UserProfile };
  onBook: (rideId: string, seats: number) => void; // 預訂行程的函式
}

// 格式化日期時間
const formatDateTime = (isoDate: string) => {
  const date = new Date(isoDate);
  return date.toLocaleDateString('zh-TW', {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function RideCard({ ride, onBook }: RideCardProps) {
  // 模擬預訂狀態（未來可替換為實際的 Supabase 狀態）
  const [isBooked, setIsBooked] = useState(false);
  const [requestedSeats, setRequestedSeats] = useState(1);

  // 判斷是否為司機提供行程 (車徵人)
  const isDriverOffering = ride.ride_type === 'driver_offering';

  // 處理預訂按鈕點擊
  const handleBook = () => {
    // 這裡調用外部傳入的 onBook 函式，並傳遞行程 ID 和座位數
    // onBook(ride.id, requestedSeats);
    setIsBooked(true);
  };

  // 顯示行程主要資訊
  const tripInfo = [
    { icon: Clock, label: '出發時間', value: formatDateTime(ride.departure_time) },
    {
      icon: Users,
      label: isDriverOffering ? '剩餘空位' : '所需座位',
      value: isDriverOffering ? ride.seats_available : ride.seats_requested,
      color: isDriverOffering ? 'text-emerald-600' : 'text-orange-500'
    },
    { icon: DollarSign, label: '單人費用', value: `NT$ ${ride.price_per_seat}` },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 p-6 mb-6">
      <div className="flex justify-between items-start mb-4 border-b pb-4">
        {/* 起點與終點 */}
        <div className="flex items-center text-lg font-semibold text-gray-700">
          <MapPin className="w-5 h-5 text-blue-600 mr-2" />
          {ride.origin}
          <ArrowRight className="w-4 h-4 mx-3 text-gray-400" />
          {ride.destination}
        </div>

        {/* 角色標籤 */}
        <div className={`px-3 py-1 text-sm font-bold rounded-full ${isDriverOffering
            ? 'bg-blue-100 text-blue-700'
            : 'bg-orange-100 text-orange-700'
        }`}>
          {isDriverOffering ? '車徵人 (提供)' : '人徵車 (尋求)'}
        </div>
      </div>

      {/* 詳細資訊 Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6">
        {tripInfo.map((item, index) => (
          <div key={index} className="flex flex-col items-start">
            <div className="flex items-center text-gray-500 mb-1">
              <item.icon className="w-4 h-4 mr-1" />
              {item.label}
            </div>
            <div className={`font-bold ${item.color || 'text-gray-800'} text-base`}>
              {item.value}
            </div>
          </div>
        ))}

        {/* 發布者資訊 */}
        <div className="flex flex-col items-start">
            <div className="flex items-center text-gray-500 mb-1">
              <User className="w-4 h-4 mr-1" />
              發布者
            </div>
            <div className="font-semibold text-gray-800 text-base">
              {ride.creator_profile.full_name || ride.creator_profile.username || '匿名用戶'}
            </div>
        </div>

      </div>

      {/* 預訂/聯絡區塊 */}
      <div className="flex justify-end items-center pt-4 border-t border-dashed">
        {isBooked ? (
          <div className="text-emerald-600 font-semibold flex items-center">
            ✅ 請求已送出 (等待確認)
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            {/* 這裡可以放座位數選擇器，MVP 暫時固定為 1 */}
            <label className="text-gray-600 text-sm">
              座位數:
            </label>
            <select
              value={requestedSeats}
              onChange={(e) => setRequestedSeats(Number(e.target.value))}
              className="px-2 py-1 border rounded-md"
            >
              {[1, 2, 3, 4].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>

            <button
              onClick={handleBook}
              disabled={isBooked}
              className={`px-5 py-2 rounded-lg font-bold transition duration-200 ${
                isDriverOffering
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-orange-500 text-white hover:bg-orange-600'
              } disabled:bg-gray-400`}
            >
              {isDriverOffering ? '發送搭乘請求' : '發送提供請求'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
