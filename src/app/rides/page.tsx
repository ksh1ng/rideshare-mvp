import { createClient } from '@/lib/supabase/server';
import RideCard from '@/components/RideCard';

export default async function RideListPage({ searchParams }: { searchParams: any }) {
  const supabase = createClient();

  // Fetch data
  const { data: rides } = await supabase
    .from('rides')
    .select('*, user:profiles(*)')
    .eq('status', 'OPEN');

  return (
    <div className="p-8">
      {rides?.map((ride) => (
        <RideCard key={ride.id} ride={ride} />
      ))}
    </div>
  );
}
