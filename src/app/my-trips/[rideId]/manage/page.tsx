import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { Users, ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react';
import Link from 'next/link';

export default async function ManageRidePage({ params }: { params: Promise<{ rideId: string }> }) {
  const { rideId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // 1. 抓取行程資訊並驗證權限（必須是本人發布的）
  const { data: ride } = await supabase
    .from('rides')
    .select('*')
    .eq('id', rideId)
    .single();

  if (!ride || ride.user_id !== user.id) return notFound();

  // 2. 抓取所有該行程的預訂與乘客資料
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      id,
      status,
      seats,
      passenger:profiles(*)
    `)
    .eq('ride_id', rideId)
    .order('created_at', { ascending: false });

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/my-trips" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 mb-6 hover:text-blue-600 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to My Trips
        </Link>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 mb-8">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Managing Trip</p>
          <h1 className="text-2xl font-black text-slate-900">{ride.origin} → {ride.destination}</h1>
          <div className="mt-4 flex gap-4 text-sm font-bold text-slate-500">
            <span>{ride.available_seats} / {ride.total_seats} Seats Left</span>
            <span>${ride.price_per_seat} / seat</span>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" /> Passenger Requests
          </h2>

          {bookings && bookings.length > 0 ? (
            bookings.map((booking: any) => (
              <div key={booking.id} className="bg-white rounded-2xl p-5 border border-slate-200 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                    {booking.passenger?.full_name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{booking.passenger?.full_name || 'Anonymous'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase border ${
                        booking.status === 'CONFIRMED' ? 'bg-green-50 border-green-200 text-green-700' : 
                        booking.status === 'PENDING' ? 'bg-amber-50 border-amber-200 text-amber-700' : 
                        'bg-red-50 border-red-200 text-red-700'
                      }`}>
                        {booking.status}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">{booking.seats} seat(s)</span>
                    </div>
                  </div>
                </div>

                {/* 狀態操作按鈕 (MVP 這裡先做 UI，邏輯稍後補上) */}
                {booking.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <button className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors">
                      <XCircle className="h-8 w-8" />
                    </button>
                    <button className="p-2 text-green-500 hover:bg-green-50 rounded-full transition-colors">
                      <CheckCircle className="h-8 w-8" />
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
              <Clock className="h-10 w-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">No requests yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
