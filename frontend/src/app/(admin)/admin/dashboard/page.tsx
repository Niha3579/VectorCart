"use client";
import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { 
  Users, 
  Package, 
  DollarSign, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  AlertCircle 
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    totalProducts: 0
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you'd have a specific /admin/stats endpoint
    // For now, let's fetch all orders and calculate stats manually
    api.get('/orders/history') // Assuming admin can see all or update this to /admin/orders
      .then(res => {
        const allOrders = res.data;
        setOrders(allOrders);
        
        const revenue = allOrders.reduce((acc: number, o: any) => acc + (o.total_price || 0), 0);
        const pending = allOrders.filter((o: any) => o.order_status === 'Pending').length;
        
        setStats({
          totalOrders: allOrders.length,
          totalRevenue: revenue,
          pendingOrders: pending,
          totalProducts: 0 // Fetch from product service if needed
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      alert("Status updated!");
      window.location.reload(); // Quick refresh to show change
    } catch (err) {
      alert("Failed to update status. Are you an admin?");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Admin Console</h1>
          <p className="text-slate-500 mt-1">System Overview & Order Management</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard title="Total Revenue" value={`$${stats.totalRevenue}`} icon={<DollarSign className="text-emerald-500" />} color="bg-emerald-50" />
          <StatCard title="Total Orders" value={stats.totalOrders} icon={<Package className="text-blue-500" />} color="bg-blue-50" />
          <StatCard title="Pending" value={stats.pendingOrders} icon={<Clock className="text-amber-500" />} color="bg-amber-50" />
          <StatCard title="Growth" value="+12%" icon={<TrendingUp className="text-purple-500" />} color="bg-purple-50" />
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-xl font-bold">Recent Transactions</h2>
            <button className="text-blue-600 font-bold text-sm hover:underline">Export CSV</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-xs uppercase tracking-widest font-bold">
                  <th className="px-8 py-4">Customer ID</th>
                  <th className="px-8 py-4">Amount</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order: any) => (
                  <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-6 font-medium text-slate-600">#{order.user_id.slice(-6)}</td>
                    <td className="px-8 py-6 font-black text-slate-900">${order.total_price}</td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
                        order.order_status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      }`}>
                        {order.order_status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <select 
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        className="bg-slate-100 text-xs font-bold p-2 rounded-lg outline-none border-none"
                      >
                        <option value="">Update Status</option>
                        <option value="Completed">Complete</option>
                        <option value="Cancelled">Cancel</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-6">
      <div className={`${color} p-4 rounded-2xl`}>
        {icon}
      </div>
      <div>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{title}</p>
        <p className="text-2xl font-black text-slate-900 mt-1">{value}</p>
      </div>
    </div>
  );
}