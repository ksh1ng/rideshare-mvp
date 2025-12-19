'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { LogIn, PlusCircle, Search } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');

  // Listen to auth state to ensure buttons show correct actions
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
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
      {/* Hero Section with Brand Blue Background */}
      <div className="relative bg-blue-600 overflow-hidden">
        {/* Decorative background circle */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 hidden lg:block">
           <div className="w-96 h-96 bg-blue-500 rounded-full opacity-20 blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-blue-600 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32 px-4 sm:px-6 lg:px-8 pt-20">
            <main className="mt-10 mx-auto max-w-7xl sm:mt-12 md:mt-16 lg:mt-20 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Share the ride,</span>{' '}
                  <span className="block text-blue-200 xl:inline">split the cost.</span>
                </h1>
                <p className="mt-3 text-base text-blue-100 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Whether it's a daily commute or a weekend getaway, travel with like-minded people. Save money, reduce traffic, and make new friends on your journey.
                </p>

                {/* Dynamic Call-to-Action Buttons */}
                <div className="mt-8 sm:flex sm:justify-center lg:justify-start gap-4">
                  {user ? (
                    // Logged In State
                    <>
                      <Link
                        href="/rides/create"
                        className="flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-xl text-blue-700 bg-white hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl md:px-10 group"
                      >
                        <PlusCircle className="mr-2 h-6 w-6 group-hover:scale-110 transition-transform" />
                        Post a Trip
                      </Link>
                      <Link
                        href="/rides"
                        className="mt-3 sm:mt-0 flex items-center justify-center px-8 py-4 border border-white/30 text-lg font-bold rounded-xl text-white bg-blue-700/50 hover:bg-blue-700 transition-all md:px-10"
                      >
                        Find a Ride
                      </Link>
                    </>
                  ) : (
                    // Logged Out State - Prominent Login Option
                    <>
                      <Link
                        href="/login"
                        className="flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-xl text-blue-700 bg-white hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl md:px-10 group"
                      >
                        <LogIn className="mr-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                        Login / Sign Up
                      </Link>
                      <Link
                        href="/rides"
                        className="mt-3 sm:mt-0 flex items-center justify-center px-8 py-4 border border-white/30 text-lg font-bold rounded-xl text-white bg-blue-700/50 hover:bg-blue-700 transition-all md:px-10"
                      >
                        Browse Trips
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Floating Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20">
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-10 border border-slate-100">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div className="flex flex-col gap-2">
              <label htmlFor="origin" className="text-sm font-bold text-slate-700 uppercase tracking-wider">Leaving from</label>
              <div className="relative">
                <input
                  type="text"
                  id="origin"
                  placeholder="City, station or place"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-4 border transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="destination" className="text-sm font-bold text-slate-700 uppercase tracking-wider">Going to</label>
              <div className="relative">
                <input
                  type="text"
                  id="destination"
                  placeholder="Where to?"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-4 border transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="date" className="text-sm font-bold text-slate-700 uppercase tracking-wider">Departure Date</label>
              <div className="relative">
                <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-4 border transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 border border-transparent rounded-xl shadow-lg py-4 px-4 text-lg font-bold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all flex items-center justify-center gap-2"
            >
              <Search className="h-5 w-5" />
              Search Rides
            </button>
          </form>
        </div>
      </div>

      {/* Core Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="text-center p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="h-14 w-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900">Verified Profiles</h3>
            <p className="mt-3 text-base text-slate-500 leading-relaxed">Safety first. All members are verified with a rating system, ensuring every journey is secure and reliable.</p>
          </div>
          <div className="text-center p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="h-14 w-14 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-6">
               <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900">Smart Savings</h3>
            <p className="mt-3 text-base text-slate-500 leading-relaxed">Stop paying full price for solo travel. Share fuel costs and tolls with others going your way.</p>
          </div>
          <div className="text-center p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="h-14 w-14 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-6">
               <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900">Better for Earth</h3>
            <p className="mt-3 text-base text-slate-500 leading-relaxed">Reduce traffic congestion and CO2 emissions by making efficient use of every empty seat.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
