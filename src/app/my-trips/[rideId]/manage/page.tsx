'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import { Users, ArrowLeft, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { updateBookingStatus } from './actions';

export default function ManageRidePage() {
  const params = useParams();
  const rideId = params.rideId as string;
  const router = useRouter();
  const supabase = createClient();

  const [ride, setRide] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // 抓取資料
  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push('/login');

    const { data: rideData } = await supabase.from('rides').select('*').eq('id', rideId).single();
    if (!rideData) return;
    setRide(rideData);

    const { data: bookingsData } = await supabase
      .from('bookings')
      .select('id, status, seats, passenger:profiles(*)')
      .eq('ride_id', rideId)
      .order('created_at', { ascending: false });

    setBookings(bookingsData || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [rideId]);

  // 處理審核動作
  const handleAction = async (bookingId: string, status: 'CONFIRMED' | 'CANCELLED') => {
    setProcessingId(bookingId);
    try {
      await updateBookingStatus(bookingId, rideId, status, ride.available_seats);
      await fetchData(); // 重新抓取資料更新 UI
      router.refresh();
    } catch (error) {
      alert('Operation failed');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" /></div>;

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/my-trips" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 mb-6 hover:text-blue-600">
          <ArrowLeft className="h-4 w-4" /> Back to My Trips
        </Link>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 mb-8">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Managing Trip</p>
          <h1 className="text-2xl font-black text-slate-900">{ride.origin} → {ride.destination}</h1>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-blue-600" /> Passenger Requests
          </h2>

          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-2xl p-5 border border-slate-200 flex items-center justify-between shadow-sm transition-all">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-600">
                  {booking.passenger?.full_name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{booking.passenger?.full_name}</p>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase border ${
                    booking.status === 'CONFIRMED' ? 'bg-green-50 border-green-200 text-green-700' :
                    booking.status === 'PENDING' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-red-50 border-red-200 text-red-700'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              </div>

              {booking.status === 'PENDING' && (
                <div className="flex gap-2">
                  {processingId === booking.id ? (
                    <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
                  ) : (
                    <>
                      <button onClick={() => handleAction(booking.id, 'CANCELLED')} className="text-red-400 hover:text-red-600 transition-colors">
                        <XCircle className="h-9 w-9" />
                      </button>
                      <button onClick={() => handleAction(booking.id, 'CONFIRMED')} className="text-green-500 hover:text-green-700 transition-colors">
                        <CheckCircle className="h-9 w-9" />
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
