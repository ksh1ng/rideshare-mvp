'use client';

import React, { useState } from 'react';
import { Ride, RideType } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { ChevronDown, ChevronUp, MessageSquare, Phone, Calendar, Clock, Star } from 'lucide-react';

interface RideCardProps {
  ride: Ride;
}

const RideCard: React.FC<RideCardProps> = ({ ride }) => {
  const [requestStatus, setRequestStatus] = useState<'IDLE' | 'SENDING' | 'ACCEPTED'>('IDLE');
  const [isExpanded, setIsExpanded] = useState(false); // 控制展開狀態
  const supabase = createClient();

  const isDriver = ride.type === RideType.DRIVER_OFFERING;
  const departureDate = new Date(ride.departure_time);

  const formattedDate = departureDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
  const formattedTime = departureDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  const handleRequest = async (e: React.MouseEvent) => {
    e.stopPropagation(); // 防止點擊按鈕時觸發卡片展開
    if (requestStatus !== 'IDLE') return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Please sign in to book a ride');
      return;
    }

    setRequestStatus('SENDING');

    // Simulate Booking Logic
    setTimeout(() => {
      setRequestStatus('ACCEPTED');
    }, 1000);
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
            <div className="absolute left-[9px] top-2 bottom-4 w-0.5 bg-slate-100 group-hover:bg-blue-100 transition-colors"></div>

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
            <div className="text-[11px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full mt-3 inline-block">
              {ride.available_seats} seats left
            </div>
          </div>

          <div className="md:hidden">
            <span className="text-2xl font-black text-slate-900">${ride.price_per_seat}</span>
            <span className="text-xs font-bold text-slate-400"> /seat</span>
          </div>

          <div className="w-full md:w-auto mt-auto flex flex-col gap-2">
            <button
              onClick={handleRequest}
              disabled={requestStatus === 'SENDING' || ride.available_seats === 0}
              className={`w-full px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all active:scale-95
                ${requestStatus === 'ACCEPTED'
                  ? 'bg-green-500 text-white cursor-default'
                  : isDriver
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100'
                }
                ${requestStatus === 'SENDING' ? 'opacity-70 cursor-wait' : ''}
              `}
            >
              {requestStatus === 'SENDING' ? 'Sending...' : requestStatus === 'ACCEPTED' ? 'Requested' : (isDriver ? 'Book Seat' : 'Offer Ride')}
            </button>
            <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {isExpanded ? 'Show Less' : 'View Details'}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Section: Description/Comment */}
      {isExpanded && (
        <div className="bg-slate-50 border-t border-slate-100 p-5 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-2 mb-3">
            <MessageSquare className="h-4 w-4 text-blue-500 mt-0.5" />
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Driver's Notes</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-sm text-slate-600 leading-relaxed italic">
            {ride.description || "No specific comments provided for this trip."}
          </div>

          {requestStatus === 'ACCEPTED' && (
            <div className="mt-4 bg-green-100 border border-green-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-green-800 font-bold uppercase tracking-tight">Contact Information</p>
                <p className="text-lg font-mono font-bold text-green-900">{ride.user?.phone_number || '0912-345-678'}</p>
              </div>
              <Phone className="h-6 w-6 text-green-600" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RideCard;
