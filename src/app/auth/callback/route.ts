'use client';

import React, { useState } from 'react';
import { Ride, RideType } from '@/types';
import { createClient } from '@/lib/supabase/client';

interface RideCardProps {
  ride: Ride;
}

const RideCard: React.FC<RideCardProps> = ({ ride }) => {
  const [requestStatus, setRequestStatus] = useState<'IDLE' | 'SENDING' | 'ACCEPTED'>('IDLE');
  const supabase = createClient();

  const isDriver = ride.type === RideType.DRIVER_OFFERING;
  const departureDate = new Date(ride.departure_time);

  const formattedDate = departureDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
  const formattedTime = departureDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  const handleRequest = async () => {
    if (requestStatus !== 'IDLE') return;

    // Check auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Please sign in to book a ride');
      return;
    }

    setRequestStatus('SENDING');

    // TODO: In a real app, you would insert into a 'bookings' table here.
    // For MVP/Demo, we simulate a successful request.
    setTimeout(() => {
      setRequestStatus('ACCEPTED');
    }, 1000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200 p-5 flex flex-col md:flex-row justify-between gap-6 group">
      {/* Left Section: Route & Time */}
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-4">
           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${isDriver ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
             {isDriver ? 'Driver' : 'Passenger'}
           </span>
           <span className="text-sm font-medium text-slate-500 flex items-center gap-1">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
             {formattedDate}
           </span>
           <span className="text-sm font-medium text-slate-500 flex items-center gap-1">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             {formattedTime}
           </span>
        </div>

        <div className="relative pl-6 space-y-6">
          <div className="absolute left-[9px] top-2 bottom-4 w-0.5 bg-slate-200 group-hover:bg-brand-200 transition-colors"></div>

          <div className="relative">
            <div className="absolute -left-[24px] top-1 h-4 w-4 rounded-full border-2 border-slate-400 bg-white group-hover:border-brand-500 transition-colors"></div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Origin</p>
            <p className="text-lg font-bold text-slate-900 leading-none">{ride.origin}</p>
          </div>
          <div className="relative">
            <div className="absolute -left-[24px] top-1 h-4 w-4 rounded-full border-2 border-brand-500 bg-brand-500"></div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Destination</p>
            <p className="text-lg font-bold text-slate-900 leading-none">{ride.destination}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3 pt-4 border-t border-slate-100">
          <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center text-sm font-bold text-brand-700">
            {ride.user?.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">{ride.user?.full_name || 'Anonymous User'}</p>
            <div className="flex items-center text-xs text-slate-500">
              <span className="text-yellow-500 mr-1">★</span>
              <span className="font-medium mr-1">{ride.user?.rating || 'New'}</span>
              <span>• Verified Profile</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section: Price & Action */}
      <div className="flex flex-row md:flex-col justify-between items-center md:items-end border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 min-w-[160px]">
        <div className="text-right hidden md:block">
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight">${ride.price_per_seat}</p>
          <p className="text-xs font-medium text-slate-400 uppercase">per seat</p>
          <p className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-1 rounded-full mt-2 inline-block">
            {ride.available_seats} seats left
          </p>
        </div>

        <div className="md:hidden">
          <span className="text-2xl font-bold text-slate-900">${ride.price_per_seat}</span>
          <span className="text-xs text-slate-500"> /seat</span>
        </div>

        <div className="w-full md:w-auto mt-auto">
          {requestStatus === 'ACCEPTED' ? (
             <div className="bg-green-50 border border-green-200 rounded-lg p-3 w-full animate-in fade-in slide-in-from-bottom-2">
                <p className="text-xs text-green-700 font-semibold mb-1">Request Accepted!</p>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <span className="font-mono font-bold">{ride.user?.phone_number || 'No Phone'}</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Contact the user to coordinate.</p>
             </div>
          ) : (
            <button
              onClick={handleRequest}
              disabled={requestStatus === 'SENDING' || ride.available_seats === 0}
              className={`w-full md:w-auto px-6 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-all
                ${isDriver
                  ? 'bg-brand-600 hover:bg-brand-700 text-white hover:shadow-brand-200'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-emerald-200'}
                ${requestStatus === 'SENDING' ? 'opacity-70 cursor-wait' : ''}
              `}
            >
              {requestStatus === 'SENDING'
                ? 'Sending...'
                : (isDriver ? 'Book Seat' : 'Offer Ride')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RideCard;
