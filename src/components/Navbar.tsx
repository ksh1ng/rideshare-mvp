'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Car, User, LogOut, Menu, X, Home } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      router.refresh();
    });

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsProfileOpen(false);
    setIsMenuOpen(false);
    router.push('/');
    router.refresh();
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
              <Car className="h-8 w-8 text-blue-600" />
              <span className="font-bold text-xl text-slate-900 tracking-tight">RideShare</span>
            </Link>

            {/* Desktop Nav - 標籤改為英文 */}
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              <Link href="/" className={`${isActive('/') ? 'border-blue-500 text-slate-900' : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-full transition-colors`}>
                <Home className="h-4 w-4 mr-1" /> Home
              </Link>
              <Link href="/rides" className={`${isActive('/rides') ? 'border-blue-500 text-slate-900' : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-full transition-colors`}>
                Find a Ride
              </Link>
              <Link href="/rides/create" className={`${isActive('/rides/create') ? 'border-blue-500 text-slate-900' : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-full transition-colors`}>
                Post a Trip
              </Link>
            </div>
          </div>

          <div className="flex items-center">
            {user ? (
              /* Logged In State */
              <div className="hidden sm:ml-3 sm:relative sm:flex sm:items-center">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 items-center gap-2 border border-slate-200 pl-2 pr-3 py-1 hover:bg-slate-50 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-slate-700 font-medium max-w-[100px] truncate text-sm">
                    My Account
                  </span>
                </button>

                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-0" onClick={() => setIsProfileOpen(false)}></div>
                    <div className="origin-top-right absolute right-0 top-14 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs text-slate-500">Account</p>
                        <p className="text-sm font-bold text-slate-900 truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                      >
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Logged Out State */
              <div className="hidden sm:flex items-center">
                <Link
                  href="/login"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-100"
                >
                  Sign In
                </Link>
              </div>
            )}
            {/* Mobile Menu Toggle */}
            <div className="flex items-center sm:hidden ml-4">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-400 hover:text-slate-500">
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Content - 標籤改為英文 */}
      {isMenuOpen && (
        <div className="sm:hidden bg-white border-b border-slate-200 absolute w-full z-50">
          <div className="pt-2 pb-3 space-y-1">
            <Link href="/" onClick={() => setIsMenuOpen(false)} className="block pl-3 pr-4 py-3 border-l-4 border-transparent text-base font-bold text-slate-500">Home</Link>
            <Link href="/rides" onClick={() => setIsMenuOpen(false)} className="block pl-3 pr-4 py-3 border-l-4 border-transparent text-base font-bold text-slate-500">Find a Ride</Link>
            <Link href="/rides/create" onClick={() => setIsMenuOpen(false)} className="block pl-3 pr-4 py-3 border-l-4 border-transparent text-base font-bold text-slate-500">Post a Trip</Link>
          </div>
          <div className="pt-4 pb-4 border-t border-slate-200 px-4">
            {user ? (
              <button onClick={handleSignOut} className="flex items-center gap-2 text-red-500 font-bold">
                <LogOut className="h-5 w-5" /> Sign Out
              </button>
            ) : (
              <Link href="/login" onClick={() => setIsMenuOpen(false)} className="block w-full text-center bg-blue-600 text-white py-2 rounded-xl font-bold">Sign In</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
