"use client";
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { ShoppingBag, ArrowRight, ShieldCheck, Zap, User } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <header className="relative py-20 px-10 bg-slate-50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <h1 className="text-6xl font-extrabold text-slate-900 leading-tight">
              Next-Gen Shopping <br />
              <span className="text-blue-600">Powered by AI.</span>
            </h1>
            <p className="text-xl text-slate-600">
              Discover a curated collection of premium electronics with 24/7 AI-driven support that actually understands you.
            </p>
            <div className="flex gap-4">
              <Link href="/products" className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:bg-blue-700 transition">
                Shop Now <ArrowRight size={20} />
              </Link>
              <Link href="/chat" className="border border-slate-300 px-8 py-4 rounded-full font-bold hover:bg-white transition">
                Talk to AI
              </Link>
            </div>
          </div>
          <div className="flex-1 bg-blue-100 rounded-3xl h-80 w-full flex items-center justify-center">
             <ShoppingBag size={100} className="text-blue-500 animate-bounce" />
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="py-20 px-10 max-w-6xl mx-auto grid md:grid-cols-3 gap-10">
        <div className="p-6 border rounded-2xl space-y-3">
          <Zap className="text-blue-600" size={32} />
          <h3 className="text-xl font-bold">Instant RAG Chat</h3>
          <p className="text-slate-500">Our AI knows our entire inventory and return policies instantly.</p>
        </div>
        <div className="p-6 border rounded-2xl space-y-3">
          <ShieldCheck className="text-blue-600" size={32} />
          <h3 className="text-xl font-bold">Secure Checkout</h3>
          <p className="text-slate-500">Fully encrypted transactions and authenticated user sessions.</p>
        </div>
        <div className="p-6 border rounded-2xl space-y-3">
          <User className="text-blue-600" size={32} />
          <h3 className="text-xl font-bold">Smart Escalation</h3>
          <p className="text-slate-500">Frustrated? Our AI detects sentiment and calls for human backup.</p>
        </div>
      </section>
    </div>
  );
}