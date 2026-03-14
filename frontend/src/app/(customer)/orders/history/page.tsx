"use client";
import { useEffect, useState } from 'react';
import { orderService } from '@/services/api';
import Navbar from '@/components/Navbar';
import { Package, Clock, CheckCircle2, ChevronRight, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getMyOrders()
      .then(res => setOrders(res.data))
      .catch(err => console.error("Error fetching orders:", err))
      .finally(() => setLoading(false));
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-4xl mx-auto p-10 animate-pulse space-y-8">
        <div className="h-10 w-48 bg-slate-100 rounded" />
        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-50 rounded-3xl" />)}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto py-16 px-6">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Order History</h1>
          <p className="text-slate-500 mt-2">Track and manage your previous vector purchases.</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-20 text-center shadow-sm">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="text-slate-300" size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">No orders yet</h2>
            <p className="text-slate-500 mt-2 mb-8">When you buy gear, it will appear here.</p>
            <Link href="/products" className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order: any) => (
              <div key={order._id} className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-5">
                    <div className="bg-slate-50 p-4 rounded-2xl group-hover:bg-blue-50 transition-colors">
                      <Package className="text-slate-400 group-hover:text-blue-500 transition-colors" size={28} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Order ID: {order._id.slice(-8).toUpperCase()}</p>
                      <h3 className="text-lg font-bold text-slate-900 mt-1">
                        {order.products?.length || 0} Items Ordered
                      </h3>
                      <p className="text-slate-500 text-sm mt-1">
                        Placed on {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-8 border-t md:border-t-0 pt-4 md:pt-0">
                    <div className="text-right">
                      <p className="text-sm text-slate-400 font-medium">Total Amount</p>
                      <p className="text-xl font-black text-slate-900">${order.total_price || order.total_amount}</p>
                    </div>
                    
                    <div className={`px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-widest ${getStatusStyle(order.order_status || 'Pending')}`}>
                      {order.order_status || 'Pending'}
                    </div>
                    
                    <ChevronRight className="text-slate-300 hidden md:block" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}