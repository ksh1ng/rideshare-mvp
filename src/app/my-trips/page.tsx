import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import RideCard from '@/components/RideCard';
import { Car, Ticket, Phone, Settings2, CalendarDays } from 'lucide-react';
import Link from 'next/link';

export default async function MyTripsPage() {
  const supabase = await createClient();

  // 1. 檢查登入狀態
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // 2. 抓取我預訂的行程 (乘客身分) - 包含司機的電話資訊
  const { data: bookedRides } = await supabase
    .from('bookings')
    .select(`
      id,
      status,
      ride:rides (
        *,
        driver:profiles!rides_user_id_fkey (
          full_name,
          phone,
          avatar_url,
          rating
        )
      )
    `)
    .eq('passenger_id', user.id)
    .order('created_at', { ascending: false });

  // 3. 抓取我發布的行程 (司機身分)
  const { data: myPosts } = await supabase
    .from('rides')
    .select('*, user:profiles(*)')
    .eq('user_id', user.id)
    .order('departure_time', { ascending: true });

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-black text-slate-900 mb-8 tracking-tight italic">My Trips</h1>

        {/* --- 第一部分：我預訂的行程 (Passenger) --- */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Ticket className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-800">Booked Rides</h2>
          </div>

          <div className="space-y-4">
            {bookedRides && bookedRides.length > 0 ? (
              bookedRides.map((booking: any) => (
                <div key={booking.id} className="relative group flex flex-col gap-2">
                  {/* 狀態標籤 */}
                  <div className="absolute -top-2 -right-2 z-10">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase shadow-sm border ${
                      booking.status === 'CONFIRMED'
                        ? 'bg-green-500 text-white border-green-400'
                        : booking.status === 'CANCELLED'
                        ? 'bg-red-500 text-white border-red-400'
                        : 'bg-amber-400 text-white border-amber-300'
                    }`}>
                      {booking.status}
                    </span>
                  </div>

                  {/* 行程卡片 */}
                  <RideCard ride={booking.ride} />

                  {/* 只有在 CONFIRMED 時才顯示司機電話 */}
                  {booking.status === 'CONFIRMED' && (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-1 duration-500">
                      <div className="flex items-center gap-3">
                        <div className="bg-emerald-500 p-2 rounded-lg shadow-sm">
                          <Phone className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Driver Contact</p>
                          <p className="text-sm font-bold text-slate-900">
                            {booking.ride.driver?.phone || 'No phone provided'}
                          </p>
                        </div>
                      </div>
                      <a
                        href={`tel:${booking.ride.driver?.phone}`}
                        className="bg-white text-emerald-600 border border-emerald-200 px-4 py-2 rounded-xl text-xs font-black uppercase hover:bg-emerald-50 transition-all active:scale-95 shadow-sm"
                      >
                        Call Now
                      </a>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 border-dashed">
                <p className="text-slate-400 font-medium">You haven't booked any rides yet.</p>
                <Link href="/" className="mt-4 inline-block text-blue-600 font-bold text-sm hover:underline">
                  Find a ride now →
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* --- 第二部分：我發布的行程 (Driver) --- */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Car className="h-5 w-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-800">Your Posts</h2>
          </div>

          <div className="space-y-4">
            {myPosts && myPosts.length > 0 ? (
              myPosts.map((ride: any) => (
                <div key={ride.id} className="relative group">
                  <RideCard ride={ride} />

                  {/* 司機管理按鈕 */}
                  <Link
                    href={`/my-trips/${ride.id}/manage`}
                    className="absolute top-4 right-4 z-20 bg-slate-900 text-white text-[10px] font-black uppercase px-3 py-2 rounded-lg shadow-xl hover:bg-blue-600 transition-all flex items-center gap-1.5 active:scale-95"
                  >
                    <Settings2 className="h-3 w-3" />
                    Manage Requests
                  </Link>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 border-dashed">
                <p className="text-slate-400 font-medium">You haven't posted any trips yet.</p>
                <Link href="/post-ride" className="mt-4 inline-block text-emerald-600 font-bold text-sm hover:underline">
                  Create your first post →
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
