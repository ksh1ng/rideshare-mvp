import { createClient } from '@/lib/supabase/server';
import RideCard from '@/components/RideCard';
import Link from 'next/link';

// Next.js 15: searchParams is a Promise
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

  if (origin) {
    query = query.ilike('origin', `%${origin}%`);
  }
  if (destination) {
    query = query.ilike('destination', `%${destination}%`);
  }
  if (date) {
    // Simple date filtering (starts on that day)
    query = query.gte('departure_time', `${date}T00:00:00`).lte('departure_time', `${date}T23:59:59`);
  }

  const { data: rides, error } = await query;

  if (error) {
    console.error('Error fetching rides:', error);
  }

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-64px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Find a Ride</h1>
            <p className="text-slate-500 mt-2">
              {origin || destination ? (
                <>
                  Showing results for <span className="font-semibold text-slate-900">{origin || 'Anywhere'}</span> to <span className="font-semibold text-slate-900">{destination || 'Anywhere'}</span>
                  {date && <span> on {date}</span>}
                </>
              ) : (
                'Showing all upcoming trips'
              )}
            </p>
          </div>

          <div className="flex gap-2">
            <Link href="/rides" className="bg-white px-4 py-2 border border-slate-300 rounded text-sm text-slate-700 hover:bg-slate-50">
              Clear Filters
            </Link>
          </div>
        </div>

        {/* Content */}
        {rides && rides.length > 0 ? (
          <div className="space-y-4">
            {rides.map((ride: any) => (
              <RideCard key={ride.id} ride={ride} />
            ))}

            <div className="text-center pt-8 pb-4">
              <p className="text-slate-400 text-sm">End of results</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-xl border border-slate-200 border-dashed">
            <div className="mx-auto h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900">No rides found</h3>
            <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
              We couldn't find any trips matching your criteria. Try changing your filters.
            </p>
            <Link
              href="/rides"
              className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-brand-700 bg-brand-100 hover:bg-brand-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
            >
              View All Rides
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
