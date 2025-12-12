import { createClient } from '@/lib/supabase/server';
import RideCard from '@/components/RideCard'; // Ensure you move RideCard to src/components

export default async function RideListPage() {
  const supabase = await createClient();

  // Fetch data
  const { data: rides } = await supabase
    .from('rides')
    .select('*, user:profiles(*)')
    .eq('status', 'OPEN')
    .order('departure_time', { ascending: true });

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Available Rides</h1>
      <div className="space-y-4">
        {rides?.map((ride: any) => (
          <RideCard key={ride.id} ride={ride} />
        ))}
        {rides?.length === 0 && <p>No rides found.</p>}
      </div>
    </div>
  );
}
