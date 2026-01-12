'use client';

import React, { useState } from 'react';
import { Ride, RideType } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import {
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Phone,
  Calendar,
  Clock,
  Star,
  Loader2,
  MapPin,
  Circle
} from 'lucide-react';

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

  // 格式化時間與日期
  const formattedDate = departureDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    weekday: 'short'
  });
  const formattedTime = departureDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  });

  const handleRequest = async (e: React.MouseEvent) => {
    e.stopPropagation(); // 防止點擊按鈕時觸發卡片展開

    if (requestStatus !== 'IDLE' || ride.available_seats === 0) return;

    // 1. 獲取當前用戶
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Please sign in to book a ride');
      router.push('/login');
      return;
    }

    // 2. 檢查是否為自己的行程 (司機不能訂自己的車)
    if (user.id === ride.user_id) {
      alert("You cannot book your own trip.");
      return;
    }

    setRequestStatus('SENDING');

    try {
      // 3. 插入資料到 bookings 表格 (僅新增預訂，不扣除座位)
      const { error: bookingError } = await supabase
        .from('bookings')
        .insert([
          {
            ride_id: ride.id,
            passenger_id: user.id,
            seats: 1,
            status: 'PENDING'
          }
        ]);

      if (bookingError) {
        if (bookingError.code === '23505') {
          alert('You have already requested this ride.');
        } else {
          throw bookingError;
        }
        setRequestStatus('IDLE');
        return;
      }

      // 4. 成功狀態回饋 (注意：此時不執行更新 rides 表格的動作)
      setRequestStatus('ACCEPTED');
      router.refresh();

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
        {/* Left Section: Route & Time */}
        <div className="flex-1">
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

          <div className="relative pl-6 space-y-6">
            <div className="absolute left-[9px] top-2 bottom-4 w-0.5 bg-slate-100"></div>
            <div className="relative">
              <div className="absolute -left-[24px] top-1 h-4 w-4 rounded-full border-2 border-slate-300 bg-white group-hover:border-blue-500 transition-colors"></div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-0.5">Origin</p>
              <p className="text-lg font-bold text-slate-900 leading-none">{ride.origin}</p>
            </div>
            <div className="relative">
              <div className="absolute -left-[24px] top-1 h-4 w-4 rounded-full border-2 border-blue-500 bg-blue-500"></div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-0.5">Destination</p>
              <p className="text-lg font-bold text-slate-900 leading-none">{ride.destination}</p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3 pt-4 border-t border-slate-50">
            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-sm font-bold text-blue-700">
              {ride.user?.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{ride.user?.full_name || 'Anonymous User'}</p>
              <div className="flex items-center text-[11px] text-slate-500 font-bold">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 mr-1" />
                <span className="mr-1">{ride.user?.rating || 'New'}</span>
                <span className="text-slate-300 mx-1">•</span>
                <span className="text-blue-500">Verified Profile</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Price & Action */}
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
                ${requestStatus === 'SENDING' ? 'opacity-70 cursor-wait' : ''}
              `}
            >
              {requestStatus === 'SENDING' && <Loader2 className="w-4 h-4 animate-spin" />}
              {requestStatus === 'SENDING'
                ? 'Processing...'
                : requestStatus === 'ACCEPTED'
                  ? 'Requested'
                  : ride.available_seats === 0
                    ? 'Sold Out'
                    : 'Book Now'}
            </button>
            <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {isExpanded ? 'Hide Details' : 'View Details'}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Section: Description/Comment */}
      {isExpanded && (
        <div className="bg-slate-50 border-t border-slate-100 p-5 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-2 mb-3">
            <MessageSquare className="h-4 w-4 text-blue-500 mt-0.5" />
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Notes</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-sm text-slate-600 leading-relaxed italic mb-4">
            {ride.description || "No specific comments provided for this trip."}
          </div>

          {requestStatus === 'ACCEPTED' && (
            <div className="bg-green-100 border border-green-200 rounded-xl p-4 flex items-center gap-3">
              <div className="bg-green-500 p-2 rounded-full">
                <Phone className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs text-green-800 font-bold uppercase tracking-tight">Request Sent</p>
                <p className="text-sm text-green-700">The driver will review your request shortly.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RideCard;
