import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import RideCard from '@/components/RideCard';
import { Car, Ticket, CalendarDays, Settings2 } from 'lucide-react'; // 加入 Settings2
import Link from 'next/link'; // <--- 補上這這一行


export default async function MyTripsPage() {
  const supabase = await createClient();

  // 1. 檢查登入狀態
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // 2. 抓取我預訂的行程 (As a Passenger)
  const { data: bookedRides } = await supabase
    .from('bookings')
    .select(`
      id,
      status,
      ride:rides (
        *,
        user:profiles(*)
      )
    `)
    .eq('passenger_id', user.id)
    .order('created_at', { ascending: false });

  // 3. 抓取我發布的行程 (As a Driver)
  const { data: myPosts } = await supabase
    .from('rides')
    .select('*, user:profiles(*)')
    .eq('user_id', user.id)
    .order('departure_time', { ascending: true });

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-black text-slate-900 mb-8 tracking-tight">My Trips</h1>

        {/* Section 1: Booked Rides */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Ticket className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-800">Booked Rides</h2>
          </div>

          <div className="space-y-4">
            {bookedRides && bookedRides.length > 0 ? (
              bookedRides.map((booking: any) => (
                <div key={booking.id} className="relative">
                  <div className="absolute -top-2 -right-2 z-10">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase shadow-sm border ${
                      booking.status === 'CONFIRMED'
                        ? 'bg-green-500 text-white border-green-400'
                        : 'bg-amber-400 text-white border-amber-300'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  <RideCard ride={booking.ride} />
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 border-dashed">
                <p className="text-slate-400 font-medium">You haven't booked any rides yet.</p>
              </div>
            )}
          </div>
        </section>

        {/* Section 2: Your Posts (司機身分) */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Car className="h-5 w-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-800">Your Posts</h2>
          </div>

          <div className="space-y-4">
            {myPosts && myPosts.length > 0 ? (
              myPosts.map((ride: any) => (
                <div key={ride.id} className="relative group">
                  {/* 1. 原本的行程卡片 */}
                  <RideCard ride={ride} />

                  {/* 2. 加入管理按鈕：定位在卡片右上角，平時半透明，滑鼠移過時明顯 */}
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
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 border-dashed">
                <p className="text-slate-400 font-medium">You haven't posted any trips yet.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
