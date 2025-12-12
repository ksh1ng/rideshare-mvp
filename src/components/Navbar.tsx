'use client';
import Link from 'next/link';
import { Car, User, Search } from 'lucide-react'; // Example Lucide usage

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-slate-200">
       {/* Use <Link href="..."> instead of <Link to="..."> */}
       <Link href="/" className="flex items-center gap-2">
         <Car className="h-8 w-8 text-brand-600" />
         <span className="font-bold text-xl">RideShare</span>
       </Link>
       {/* ... rest of navbar ... */}
    </nav>
  )
}
