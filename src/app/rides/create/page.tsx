'use client';

import { useForm } from 'react-hook-form';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function CreateRidePage() {
  const supabase = createClient();
  const router = useRouter();
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data: any) => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return alert('Please login');

    const { error } = await supabase
      .from('rides')
      .insert({
        ...data,
        user_id: user.id,
        status: 'OPEN',
        // Ensure numeric fields are converted
        price_per_seat: Number(data.price_per_seat),
        total_seats: Number(data.total_seats),
        available_seats: Number(data.total_seats),
      });

    if (!error) {
      router.push('/rides');
      router.refresh();
    } else {
      console.error(error);
      alert('Error creating ride');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold">Post a Trip</h1>

      <div className="space-y-2">
        <label>Origin</label>
        <input
          {...register("origin", { required: true })}
          className="w-full p-3 border rounded text-slate-900 bg-white"
          placeholder="City or Station"
        />
      </div>

      <div className="space-y-2">
        <label>Destination</label>
        <input
          {...register("destination", { required: true })}
          className="w-full p-3 border rounded text-slate-900 bg-white"
          placeholder="City or Station"
        />
      </div>

      <div className="space-y-2">
        <label>Departure Time</label>
        <input
          type="datetime-local"
          {...register("departure_time", { required: true })}
          className="w-full p-3 border rounded text-slate-900 bg-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label>Price</label>
          <input
            type="number"
            {...register("price_per_seat", { required: true })}
            className="w-full p-3 border rounded text-slate-900 bg-white"
          />
        </div>
        <div className="space-y-2">
          <label>Seats</label>
          <select {...register("total_seats")} className="w-full p-3 border rounded text-slate-900 bg-white">
            <option value="1">1 Seat</option>
            <option value="2">2 Seats</option>
            <option value="3">3 Seats</option>
          </select>
        </div>
      </div>

      <input type="hidden" {...register("type")} value="DRIVER_OFFERING" />

      <button className="w-full bg-blue-600 text-white p-3 rounded font-bold">
        Publish Ride
      </button>
    </form>
  );
}
