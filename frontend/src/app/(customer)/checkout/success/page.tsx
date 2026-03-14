"use client";
import Link from 'next/link';
import { CheckCircle, Package } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="flex flex-col items-center justify-center py-32 px-6 text-center">
        <div className="bg-green-50 p-6 rounded-full mb-8">
          <CheckCircle size={80} className="text-green-500" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Order Successful!</h1>
        <p className="text-slate-500 mt-4 max-w-sm text-lg leading-relaxed">
          Your payment was processed and your vector gear is now being prepared for shipping.
        </p>
        
        <div className="mt-12 flex flex-col sm:flex-row gap-4">
          <Link 
            href="/products" 
            className="bg-black text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 transition shadow-xl"
          >
            Continue Shopping
          </Link>
          <Link 
            href="/orders/history" 
            className="bg-slate-100 text-slate-900 px-8 py-4 rounded-2xl font-bold hover:bg-slate-200 transition"
          >
            View My Orders
          </Link>
        </div>
      </div>
    </div>
  );
}