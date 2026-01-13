"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusSquare, Car } from "lucide-react"; // 假設你使用 lucide-react 圖標

const MobileNav = () => {
  const pathname = usePathname();

  const navItems = [
    { label: "Find a Ride", href: "/", icon: Search },
    { label: "My Trip", href: "/my-trips", icon: Car },
    { label: "Post a Trip", href: "/post-trip", icon: PlusSquare },
    { label: "Profile", href: "/profile", icon: Home },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe-area-inset-bottom z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? "text-blue-600" : "text-slate-500"
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
