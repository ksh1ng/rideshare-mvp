import { createClient } from '@/lib/supabase/server';
import RideCard from '@/components/RideCard';
import Link from 'next/link';
import { Search, SlidersHorizontal, ArrowLeft } from 'lucide-react';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function RideListPage(props: {
  searchParams: SearchParams
}) {
  const searchParams = await props.searchParams
  const supabase = await createClient();

  const origin = typeof searchParams.origin === 'string' ? searchParams.origin : '';
  const destination = typeof searchParams.destination === 'string' ? searchParams.destination : '';
  const date = typeof searchParams.date === 'string' ? searchParams.date : '';

  let query = supabase
    .from('rides')
    .select('*, user:profiles(*)')
    .eq('status', 'OPEN')
    .order('departure_time', { ascending: true });

  if (origin) query = query.ilike('origin', `%${origin}%`);
  if (destination) query = query.ilike('destination', `%${destination}%`);
  if (date) {
    query = query.gte('departure_time', `${date}T00:00:00`).lte('departure_time', `${date}T23:59:59`);
  }

  const { data: rides, error } = await query;

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Find a Ride</h1>
            <Link
              href="/rides"
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              <SlidersHorizontal className="h-3 w-3" /> Clear Filters
            </Link>
          </div>

          <div className="bg-blue-600 rounded-2xl p-4 shadow-lg shadow-blue-100 text-white">
            <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-1">Current Search</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-lg">{origin || 'Anywhere'}</span>
              <span className="text-blue-300">→</span>
              <span className="font-bold text-lg">{destination || 'Anywhere'}</span>
              {date && (
                <span className="ml-auto bg-blue-500 px-3 py-1 rounded-lg text-sm font-medium">
                  {date}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        {rides && rides.length > 0 ? (
          <div className="space-y-4">
            {rides.map((ride: any) => (
              <RideCard key={ride.id} ride={ride} />
            ))}
            <div className="text-center pt-8">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">End of results</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed px-6">
            <div className="mx-auto h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <Search className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No trips found</h3>
            <p className="mt-2 text-slate-500 text-sm max-w-xs mx-auto">
              We couldn't find any rides matching your current filters. Try searching for different locations.
            </p>
            <Link
              href="/rides"
              className="mt-8 inline-flex items-center px-8 py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all shadow-xl"
            >
              Reset All Filters
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
