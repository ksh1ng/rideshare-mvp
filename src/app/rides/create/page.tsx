'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { RideType } from '@/types';
import {
  MapPin,
  Calendar,
  DollarSign,
  Users,
  MessageSquare,
  Car,
  ArrowLeft,
  Loader2,
  CheckCircle2
} from 'lucide-react';

export default function CreateRide() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    type: RideType.DRIVER_OFFERING,
    origin: '',
    destination: '',
    departure_time: '',
    price_per_seat: '',
    total_seats: '1',
    description: ''
  });

  // Check auth state on mount
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login?next=/rides/create');
      } else {
        setCheckingAuth(false);
      }
    };
    checkUser();
  }, [supabase, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication required');

      const { error } = await supabase
        .from('rides')
        .insert({
          type: formData.type,
          origin: formData.origin,
          destination: formData.destination,
          departure_time: formData.departure_time,
          price_per_seat: Number(formData.price_per_seat),
          total_seats: Number(formData.total_seats),
          available_seats: Number(formData.total_seats),
          description: formData.description,
          user_id: user.id,
          status: 'OPEN'
        });

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        router.push('/rides');
        router.refresh();
      }, 1500);
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Failed to create ride');
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-sm w-full border border-slate-100 animate-in zoom-in-95 duration-300">
          <CheckCircle2 className="h-20 w-20 text-emerald-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Trip Posted Successfully!</h2>
          <p className="text-slate-500">Redirecting to trip list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-64px)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">

        {/* Back and Title */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-slate-500 hover:text-blue-600 mb-6 transition-colors font-medium group"
        >
          <ArrowLeft className="h-5 w-5 mr-1 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Post Your Trip</h1>
          <p className="mt-3 text-lg text-slate-600">
            Fill in the details below to find the perfect carpool partner.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
          <form onSubmit={handleSubmit}>

            {/* Role Selection */}
            <div className="p-8 border-b border-slate-50">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 block">I want to...</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: RideType.DRIVER_OFFERING }))}
                  className={`relative flex items-center p-4 rounded-2xl border-2 transition-all ${formData.type === RideType.DRIVER_OFFERING ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                >
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center mr-4 ${formData.type === RideType.DRIVER_OFFERING ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    <Car className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <p className={`font-bold ${formData.type === RideType.DRIVER_OFFERING ? 'text-blue-900' : 'text-slate-900'}`}>Offer a Ride</p>
                    <p className="text-xs text-slate-500">I have a car and want to find passengers</p>
                  </div>
                  {formData.type === RideType.DRIVER_OFFERING && (
                    <CheckCircle2 className="absolute top-3 right-3 h-5 w-5 text-blue-600" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: RideType.PASSENGER_SEEKING }))}
                  className={`relative flex items-center p-4 rounded-2xl border-2 transition-all ${formData.type === RideType.PASSENGER_SEEKING ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                >
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center mr-4 ${formData.type === RideType.PASSENGER_SEEKING ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    <Users className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <p className={`font-bold ${formData.type === RideType.PASSENGER_SEEKING ? 'text-blue-900' : 'text-slate-900'}`}>Find a Ride</p>
                    <p className="text-xs text-slate-500">I need a lift and I'm looking for a driver</p>
                  </div>
                  {formData.type === RideType.PASSENGER_SEEKING && (
                    <CheckCircle2 className="absolute top-3 right-3 h-5 w-5 text-blue-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Form Details */}
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label htmlFor="origin" className="flex items-center text-sm font-bold text-slate-700 uppercase tracking-wider">
                    <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                    Departure
                  </label>
                  <input
                    type="text"
                    id="origin"
                    name="origin"
                    required
                    placeholder="e.g. London King's Cross"
                    value={formData.origin}
                    onChange={handleChange}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-4 border transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="destination" className="flex items-center text-sm font-bold text-slate-700 uppercase tracking-wider">
                    <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                    Destination
                  </label>
                  <input
                    type="text"
                    id="destination"
                    name="destination"
                    required
                    placeholder="e.g. Manchester Piccadilly"
                    value={formData.destination}
                    onChange={handleChange}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-4 border transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="departure_time" className="flex items-center text-sm font-bold text-slate-700 uppercase tracking-wider">
                  <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                  Departure Time
                </label>
                <input
                  type="datetime-local"
                  id="departure_time"
                  name="departure_time"
                  required
                  value={formData.departure_time}
                  onChange={handleChange}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-4 border transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label htmlFor="price_per_seat" className="flex items-center text-sm font-bold text-slate-700 uppercase tracking-wider">
                    <DollarSign className="h-4 w-4 mr-2 text-blue-600" />
                    {formData.type === RideType.DRIVER_OFFERING ? 'Price per Seat ($)' : 'Willing to Pay ($)'}
                  </label>
                  <input
                    type="number"
                    id="price_per_seat"
                    name="price_per_seat"
                    min="0"
                    required
                    placeholder="0"
                    value={formData.price_per_seat}
                    onChange={handleChange}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-4 border transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="total_seats" className="flex items-center text-sm font-bold text-slate-700 uppercase tracking-wider">
                    <Users className="h-4 w-4 mr-2 text-blue-600" />
                    {formData.type === RideType.DRIVER_OFFERING ? 'Seats Available' : 'Passenger Count'}
                  </label>
                  <select
                    id="total_seats"
                    name="total_seats"
                    value={formData.total_seats}
                    onChange={handleChange}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-4 border transition-all appearance-none cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Person' : 'People'}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="flex items-center text-sm font-bold text-slate-700 uppercase tracking-wider">
                  <MessageSquare className="h-4 w-4 mr-2 text-blue-600" />
                  Notes / Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  placeholder="e.g. Non-smoking, pet-friendly, large trunk space available..."
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-4 border transition-all resize-none"
                />
              </div>
            </div>

            {/* Submission Area */}
            <div className="p-8 bg-slate-50 flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="flex-1 px-8 py-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-all text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-[2] px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg hover:shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                    Posting...
                  </>
                ) : (
                  'Post Trip Now'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
