import Link from 'next/link';
import { LayoutDashboard, Package, Ticket, BookOpen, BarChart3 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
    { name: 'Products', icon: Package, href: '/admin/products' },
    { name: 'Knowledge Base', icon: BookOpen, href: '/admin/upload' },
    { name: 'Tickets', icon: Ticket, href: '/admin/tickets' },
    { name: 'Analytics', icon: BarChart3, href: '/admin/analytics' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-slate-900 text-white p-6 space-y-8">
        <h1 className="text-2xl font-bold text-blue-400">VectorCart Admin</h1>
        <nav className="space-y-4">
          {menuItems.map((item) => (
            <Link key={item.name} href={item.href} className="flex items-center gap-3 hover:text-blue-400 transition">
              <item.icon size={20} /> {item.name}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}