"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingCart, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const { cart } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check for token on mount and when pathname changes
  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    router.push('/');
  };

  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-black tracking-tighter text-blue-600">
          VECTOR<span className="text-black">CART</span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-8 font-medium text-gray-600">
          <Link href="/products" className="hover:text-blue-600 transition">Shop</Link>
          <Link href="/chat" className="hover:text-blue-600 transition">AI Support</Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-5">
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <Link href="/orders/history" title="Orders">
                <User size={22} className="text-gray-600 hover:text-blue-600 cursor-pointer" />
              </Link>
              <button onClick={handleLogout} title="Logout">
                <LogOut size={22} className="text-gray-400 hover:text-red-500 transition" />
              </button>
            </div>
          ) : (
            <Link 
              href="/login" 
              className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition shadow-lg"
            >
              Sign In
            </Link>
          )}

          {/* Cart Icon */}
          <Link href="/cart" className="relative group p-2 bg-slate-50 rounded-full">
            <ShoppingCart size={22} className="text-gray-700 group-hover:text-blue-600 transition" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white">
                {cart.length}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}