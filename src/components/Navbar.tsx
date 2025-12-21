'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Car, User, LogOut, Menu, X, Home } from 'lucide-react'; // 新增 Home 圖示
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

  // 獲取用戶狀態並訂閱變動
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

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsProfileOpen(false);
    setIsMenuOpen(false);
    router.push('/'); // 登出後回到首頁
    router.refresh();
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo: 本身就是回到首頁的連結 */}
            <Link href="/" className="flex-shrink-0 flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Car className="h-8 w-8 text-blue-600" /> {/* 這裡將 brand-600 改為 blue-600 確保顏色顯示 */}
              <span className="font-bold text-xl text-slate-900 tracking-tight">RideShare</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              {/* 新增首頁按鈕 */}
              <Link
                href="/"
                className={`${isActive('/') ? 'border-blue-500 text-slate-900' : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-full transition-colors`}
              >
                <Home className="h-4 w-4 mr-1" /> 首頁
              </Link>
              <Link
                href="/rides"
                className={`${isActive('/rides') ? 'border-blue-500 text-slate-900' : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-full transition-colors`}
              >
                Find a Ride
              </Link>
              <Link
                href="/rides/create"
                className={`${isActive('/rides/create') ? 'border-blue-500 text-slate-900' : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-full transition-colors`}
              >
                Post a Trip
              </Link>
            </div>
          </div>

          <div className="flex items-center">
            {user ? (
              // 已登入狀態 (Desktop)
              <div className="hidden sm:ml-3 sm:relative sm:flex sm:items-center">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 items-center gap-2 border border-slate-200 pl-2 pr-3 py-1 hover:bg-slate-50 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                    {user.user_metadata?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-slate-700 font-medium max-w-[100px] truncate text-sm">
                    {user.user_metadata?.full_name || user.email?.split('@')[0]}
                  </span>
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <>
                    {/* 點擊背景自動關閉選單 */}
                    <div className="fixed inset-0 z-0" onClick={() => setIsProfileOpen(false)}></div>
                    <div className="origin-top-right absolute right-0 top-14 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in zoom-in-95 duration-100 z-10">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs text-slate-500">已登入身分</p>
                        <p className="text-sm font-bold text-slate-900 truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                      >
                        <LogOut className="h-4 w-4" /> 登出帳號
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              // 未登入狀態 (Desktop)
              <div className="hidden sm:flex items-center">
                <Link
                  href="/login"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-100 flex items-center gap-2"
                >
                  登入 / 註冊
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden ml-4">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu (手機版選單) */}
      {isMenuOpen && (
        <div className="sm:hidden bg-white border-b border-slate-200 shadow-xl absolute w-full z-50 animate-in slide-in-from-top duration-200">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className={`${isActive('/') ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-transparent text-slate-500 hover:bg-slate-50 hover:border-slate-300'} block pl-3 pr-4 py-3 border-l-4 text-base font-bold`}
            >
              <div className="flex items-center gap-2"><Home className="h-5 w-5" /> 首頁</div>
            </Link>
            <Link
              href="/rides"
              onClick={() => setIsMenuOpen(false)}
              className={`${isActive('/rides') ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-transparent text-slate-500 hover:bg-slate-50 hover:border-slate-300'} block pl-3 pr-4 py-3 border-l-4 text-base font-bold`}
            >
              Find a Ride
            </Link>
            <Link
              href="/rides/create"
              onClick={() => setIsMenuOpen(false)}
              className={`${isActive('/rides/create') ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-transparent text-slate-500 hover:bg-slate-50 hover:border-slate-300'} block pl-3 pr-4 py-3 border-l-4 text-base font-bold`}
            >
              Post a Trip
            </Link>
          </div>

          <div className="pt-4 pb-4 border-t border-slate-200">
            {user ? (
              <div className="space-y-1">
                <div className="px-4 py-3">
                  <div className="text-base font-bold text-slate-800">{user.user_metadata?.full_name || 'User'}</div>
                  <div className="text-sm font-medium text-slate-500">{user.email}</div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-3 text-base font-bold text-red-500 hover:bg-red-50"
                >
                  <div className="flex items-center gap-2"><LogOut className="h-5 w-5" /> 登出帳號</div>
                </button>
              </div>
            ) : (
              <div className="px-4 py-3">
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-center px-4 py-3 border border-transparent text-base font-bold rounded-xl shadow-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  立即登入
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
