'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

export default function Home() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');

  // Check auth state on mount to show correct buttons
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoadingUser(false);
    };
    checkUser();
  }, [supabase]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (origin) params.append('origin', origin);
    if (destination) params.append('destination', destination);
    if (date) params.append('date', date);
    router.push(`/rides?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="relative bg-blue-600 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-blue-600 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32 px-4 sm:px-6 lg:px-8 pt-20">
            <main className="mt-10 mx-auto max-w-7xl sm:mt-12 md:mt-16 lg:mt-20 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Share the ride,</span>{' '}
                  <span className="block text-blue-200 xl:inline">split the cost.</span>
                </h1>
                <p className="mt-3 text-base text-blue-100 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Connect with people going your way. Save money, reduce traffic, and make new friends on your daily commute or weekend trips.
                </p>

                {/* Dynamic Call to Action Buttons */}
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start gap-3">
                  {!loadingUser && (
                    <>
                      {user ? (
                        // Logged In Actions
                        <>
                          <div className="rounded-md shadow">
                            <Link
                              href="/rides/create"
                              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-slate-50 md:py-4 md:text-lg md:px-10"
                            >
                              Post a Trip
                            </Link>
                          </div>
                          <div className="mt-3 sm:mt-0 sm:ml-3">
                            <Link
                              href="/rides"
                              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 md:py-4 md:text-lg md:px-10"
                            >
                              Find a Ride
                            </Link>
                          </div>
                        </>
                      ) : (
                        // Logged Out Actions
                        <>
                          <div className="rounded-md shadow">
                            <Link
                              href="/login"
                              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-slate-50 md:py-4 md:text-lg md:px-10"
                            >
                              Get Started
                            </Link>
                          </div>
                          <div className="mt-3 sm:mt-0 sm:ml-3">
                            <Link
                              href="/rides"
                              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 md:py-4 md:text-lg md:px-10"
                            >
                              Browse Rides
                            </Link>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>

              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Search Box - Floating */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20">
        <div className="bg-white rounded-xl shadow-xl p-6 sm:p-10">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="flex flex-col gap-1">
              <label htmlFor="origin" className="text-sm font-medium text-slate-700">Leaving from</label>
              <input
                type="text"
                id="origin"
                placeholder="City or Station"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full bg-white text-slate-900 rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="destination" className="text-sm font-medium text-slate-700">Going to</label>
              <input
                type="text"
                id="destination"
                placeholder="City or Station"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-white text-slate-900 rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="date" className="text-sm font-medium text-slate-700">Date</label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white text-slate-900 rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Search Rides
            </button>
          </form>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="text-center p-6 bg-white rounded-lg border border-slate-100 shadow-sm">
            <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-md flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900">Verified Profiles</h3>
            <p className="mt-2 text-base text-slate-500">Safety first. All members have verified emails and phone numbers.</p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg border border-slate-100 shadow-sm">
            <div className="h-12 w-12 bg-green-100 text-green-600 rounded-md flex items-center justify-center mx-auto mb-4">
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900">Low Cost</h3>
            <p className="mt-2 text-base text-slate-500">Travel cheaper than trains or buses by sharing the fuel costs.</p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg border border-slate-100 shadow-sm">
            <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-md flex items-center justify-center mx-auto mb-4">
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900">Eco Friendly</h3>
            <p className="mt-2 text-base text-slate-500">Reduce your carbon footprint by filling empty seats in cars already on the road.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
