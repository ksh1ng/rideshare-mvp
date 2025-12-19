'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { rideService } from '@/services/mockData';
import { RideType } from '@/types';
import { createClient } from '@/lib/supabase/client';

export default function CreateRide() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: RideType.DRIVER_OFFERING,
    origin: '',
    destination: '',
    departure_time: '',
    price_per_seat: '',
    total_seats: 1,
    description: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check for user session first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
         // Redirect to login if not authenticated
         // In a real app we might want to return url to redirect back after login
         router.push('/login?next=/rides/create');
         return;
      }

      await rideService.createRide({
        ...formData,
        available_seats: Number(formData.total_seats),
        user_id: user.id, // Use real user ID
        price_per_seat: Number(formData.price_per_seat),
        total_seats: Number(formData.total_seats)
      });

      // Simulate network delay for UX
      setTimeout(() => {
        router.push('/rides');
      }, 500);
    } catch (error) {
      console.error(error);
      alert('Failed to create ride');
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-64px)] py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Post a Trip</h1>
          <p className="mt-2 text-slate-600 max-w-lg mx-auto">
            Connect with others going your way. Fill out the details below to get matched instantly.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
          <form onSubmit={handleSubmit} className="divide-y divide-slate-100">

            {/* Step 1: Role Selection */}
            <div className="p-8">
              <label className="text-base font-semibold text-slate-900 mb-4 block">I want to...</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className={`relative flex cursor-pointer rounded-xl border p-4 shadow-sm focus:outline-none transition-all ${formData.type === RideType.DRIVER_OFFERING ? 'border-blue-600 ring-1 ring-blue-600 bg-blue-50' : 'border-slate-200 hover:border-blue-400 bg-white'}`}>
                  <input
                    type="radio"
                    name="type"
                    value={RideType.DRIVER_OFFERING}
                    checked={formData.type === RideType.DRIVER_OFFERING}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center">
                      <div className="text-sm">
                        <p className={`font-bold ${formData.type === RideType.DRIVER_OFFERING ? 'text-blue-900' : 'text-slate-900'}`}>Drive</p>
                        <p className={`text-slate-500 ${formData.type === RideType.DRIVER_OFFERING ? 'text-blue-700' : 'text-slate-500'}`}>I have a car and seats</p>
                      </div>
                    </div>
                    {formData.type === RideType.DRIVER_OFFERING && (
                      <svg className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    )}
                  </div>
                </label>

                <label className={`relative flex cursor-pointer rounded-xl border p-4 shadow-sm focus:outline-none transition-all ${formData.type === RideType.PASSENGER_SEEKING ? 'border-blue-600 ring-1 ring-blue-600 bg-blue-50' : 'border-slate-200 hover:border-blue-400 bg-white'}`}>
                  <input
                    type="radio"
                    name="type"
                    value={RideType.PASSENGER_SEEKING}
                    checked={formData.type === RideType.PASSENGER_SEEKING}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center">
                      <div className="text-sm">
                        <p className={`font-bold ${formData.type === RideType.PASSENGER_SEEKING ? 'text-blue-900' : 'text-slate-900'}`}>Ride</p>
                        <p className={`text-slate-500 ${formData.type === RideType.PASSENGER_SEEKING ? 'text-blue-700' : 'text-slate-500'}`}>I need a lift</p>
                      </div>
                    </div>
                    {formData.type === RideType.PASSENGER_SEEKING && (
                      <svg className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Step 2: Route Info */}
            <div className="p-8">
              <h3 className="text-lg font-medium leading-6 text-slate-900 mb-6">Trip Details</h3>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">

                <div className="sm:col-span-3">
                  <label htmlFor="origin" className="block text-sm font-medium text-slate-700">From</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <div className="h-2 w-2 rounded-full border-2 border-slate-400"></div>
                    </div>
                    <input
                      type="text"
                      name="origin"
                      id="origin"
                      required
                      placeholder="City or location"
                      value={formData.origin}
                      onChange={handleChange}
                      className="bg-white text-slate-900 focus:ring-blue-500 focus:border-blue-500 block w-full pl-8 sm:text-sm border-slate-300 rounded-md py-3 border"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="destination" className="block text-sm font-medium text-slate-700">To</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                       <div className="h-2 w-2 rounded-full border-2 border-blue-500"></div>
                    </div>
                    <input
                      type="text"
                      name="destination"
                      id="destination"
                      required
                      placeholder="City or location"
                      value={formData.destination}
                      onChange={handleChange}
                      className="bg-white text-slate-900 focus:ring-blue-500 focus:border-blue-500 block w-full pl-8 sm:text-sm border-slate-300 rounded-md py-3 border"
                    />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="departure_time" className="block text-sm font-medium text-slate-700">Departure Time</label>
                  <input
                    type="datetime-local"
                    name="departure_time"
                    id="departure_time"
                    required
                    value={formData.departure_time}
                    onChange={handleChange}
                    className="mt-1 bg-white text-slate-900 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-slate-300 rounded-md py-3 border px-3"
                  />
                </div>

                <div className="sm:col-span-3">
                   <label htmlFor="price_per_seat" className="block text-sm font-medium text-slate-700">
                     {formData.type === RideType.DRIVER_OFFERING ? 'Price per Seat' : 'Willing to Pay'}
                   </label>
                   <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-slate-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      name="price_per_seat"
                      id="price_per_seat"
                      min="0"
                      required
                      placeholder="0"
                      value={formData.price_per_seat}
                      onChange={handleChange}
                      className="bg-white text-slate-900 focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-slate-300 rounded-md py-3 border"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-slate-500 sm:text-sm">TWD</span>
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="total_seats" className="block text-sm font-medium text-slate-700">
                     {formData.type === RideType.DRIVER_OFFERING ? 'Seats Available' : 'Seats Needed'}
                  </label>
                  <select
                    id="total_seats"
                    name="total_seats"
                    value={formData.total_seats}
                    onChange={handleChange}
                    className="mt-1 block w-full py-3 px-3 border border-slate-300 bg-white text-slate-900 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Seat' : 'Seats'}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="description" className="block text-sm font-medium text-slate-700">
                    Additional Notes
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-slate-300 rounded-md p-3 bg-white text-slate-900"
                      placeholder="E.g. Large trunk space, pet friendly, non-smoking..."
                      value={formData.description}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="px-8 py-5 bg-slate-50 text-right">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-8 border border-transparent shadow-sm text-sm font-bold rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Publishing...' : 'Publish Trip'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
