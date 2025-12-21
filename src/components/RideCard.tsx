'use client';

import React, { useState } from 'react';
import { Ride, RideType } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation'; // 引入 router
import { ChevronDown, ChevronUp, MessageSquare, Phone, Calendar, Clock, Star, Loader2 } from 'lucide-react';

interface RideCardProps {
  ride: Ride;
}

const RideCard: React.FC<RideCardProps> = ({ ride }) => {
  const [requestStatus, setRequestStatus] = useState<'IDLE' | 'SENDING' | 'ACCEPTED'>('IDLE');
  const [isExpanded, setIsExpanded] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const isDriver = ride.type === RideType.DRIVER_OFFERING;
  const departureDate = new Date(ride.departure_time);
  const formattedDate = departureDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
  const formattedTime = departureDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  // --- 實作預訂邏輯 ---
  const handleRequest = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (requestStatus !== 'IDLE' || ride.available_seats === 0) return;

    // 1. 獲取當前用戶
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Please sign in to book a ride');
      router.push('/login');
      return;
    }

    // 2. 檢查是否為自己的行程
    if (user.id === ride.user_id) {
      alert("You cannot book your own trip.");
      return;
    }

    setRequestStatus('SENDING');

    try {
      // 3. 插入資料到 bookings 表格 (根據你的 SQL 結構)
      const { error: bookingError } = await supabase
        .from('bookings')
        .insert([
          {
            ride_id: ride.id,
            passenger_id: user.id,
            seats: 1, // 預設預訂 1 位
            status: 'PENDING'
          }
        ]);

      if (bookingError) {
        // 處理重複預訂 (SQL Unique Constraint)
        if (bookingError.code === '23505') {
          alert('You have already requested this ride.');
        } else {
          throw bookingError;
        }
        setRequestStatus('IDLE');
        return;
      }

      // 4. 更新 rides 表格的剩餘座位 (available_seats)
      // 注意：這在大型應用建議用 RPC 或 Trigger 做，MVP 階段可先在前端處理
      const { error: updateError } = await supabase
        .from('rides')
        .update({ available_seats: ride.available_seats - 1 })
        .eq('id', ride.id);

      if (updateError) throw updateError;

      // 5. 成功狀態
      setRequestStatus('ACCEPTED');
      router.refresh(); // 重新整理頁面數據

    } catch (error: any) {
      console.error('Booking failed:', error.message);
      alert('Something went wrong. Please try again.');
      setRequestStatus('IDLE');
    }
  };

  return (
    <div
      onClick={() => setIsExpanded(!isExpanded)}
      className={`bg-white rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden ${
        isExpanded ? 'border-blue-500 shadow-lg' : 'border-slate-200 hover:shadow-md hover:border-slate-300 shadow-sm'
      }`}
    >
      <div className="p-5 flex flex-col md:flex-row justify-between gap-6 group">
        {/* 左側資訊保持不變... */}
        <div className="flex-1">
          {/* ... (同前次提供的 Navbar/Layout 整合內容) */}
          <div className="flex items-center gap-3 mb-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
              isDriver ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {isDriver ? 'Driver' : 'Passenger'}
            </span>
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> {formattedDate}
            </span>
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {formattedTime}
            </span>
          </div>

          {/* Route Section */}
          <div className="relative pl-6 space-y-6">
            <div className="absolute left-[9px] top-2 bottom-4 w-0.5 bg-slate-100"></div>
            <div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Origin</p>
              <p className="text-lg font-bold text-slate-900">{ride.origin}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Destination</p>
              <p className="text-lg font-bold text-slate-900">{ride.destination}</p>
            </div>
          </div>
        </div>

        {/* 右側按鈕與價格 */}
        <div className="flex flex-row md:flex-col justify-between items-center md:items-end border-t md:border-t-0 md:border-l border-slate-50 pt-4 md:pt-0 md:pl-6 min-w-[180px]">
          <div className="text-right hidden md:block">
            <p className="text-3xl font-black text-slate-900 tracking-tight">${ride.price_per_seat}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">per seat</p>
            <div className={`text-[11px] font-bold px-3 py-1 rounded-full mt-3 inline-block ${
              ride.available_seats > 0 ? 'text-blue-600 bg-blue-50' : 'text-red-600 bg-red-50'
            }`}>
              {ride.available_seats > 0 ? `${ride.available_seats} seats left` : 'Fully Booked'}
            </div>
          </div>

          <div className="w-full md:w-auto mt-auto flex flex-col gap-2">
            <button
              onClick={handleRequest}
              disabled={requestStatus !== 'IDLE' || ride.available_seats === 0}
              className={`w-full px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all active:scale-95 flex items-center justify-center gap-2
                ${requestStatus === 'ACCEPTED'
                  ? 'bg-green-500 text-white cursor-default'
                  : ride.available_seats === 0
                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed shadow-none'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100'
                }
              `}
            >
              {requestStatus === 'SENDING' && <Loader2 className="w-4 h-4 animate-spin" />}
              {requestStatus === 'SENDING'
                ? 'Processing...'
                : requestStatus === 'ACCEPTED'
                  ? 'Request Sent'
                  : ride.available_seats === 0
                    ? 'Sold Out'
                    : 'Book Now'}
            </button>
            <div className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
              {isExpanded ? 'Hide Details' : 'View Details'}
            </div>
          </div>
        </div>
      </div>

      {/* 展開備註部分 */}
      {isExpanded && (
        <div className="bg-slate-50 border-t border-slate-100 p-5 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-2 mb-3">
            <MessageSquare className="h-4 w-4 text-blue-500 mt-0.5" />
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Notes</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-sm text-slate-600 leading-relaxed italic mb-4">
            {ride.description || "No specific comments provided for this trip."}
          </div>

          {/* 若預訂成功，顯示額外提示 */}
          {requestStatus === 'ACCEPTED' && (
            <div className="bg-green-100 border border-green-200 rounded-xl p-4 flex items-center gap-3">
              <div className="bg-green-500 p-2 rounded-full">
                <Phone className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs text-green-800 font-bold uppercase tracking-tight">Booking Pending</p>
                <p className="text-sm text-green-700">Check "My Trips" later for updates.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RideCard;
