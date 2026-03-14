"use client";
import { useEffect, useState } from 'react';
import { productService } from '@/services/api';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productService.getAll()
      .then(res => setProducts(res.data))
      .catch(err => console.error("Failed to fetch products:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 p-10 max-w-7xl mx-auto">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="h-72 bg-slate-100 animate-pulse rounded-[2rem]" />
            <div className="h-4 w-2/3 bg-slate-100 animate-pulse rounded" />
            <div className="h-4 w-1/3 bg-slate-100 animate-pulse rounded" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="max-w-7xl mx-auto p-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-blue-600 font-bold tracking-widest text-xs uppercase">Curated Gear</span>
            <h1 className="text-5xl font-black text-slate-900 mt-2 tracking-tight">Our Collection</h1>
          </div>
          <p className="text-slate-500 max-w-xs text-sm">
            Discover precision-engineered electronics designed for the next generation.
          </p>
        </div>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-100 rounded-[3rem]">
            <ShoppingBag size={48} className="text-slate-200 mb-4" />
            <p className="text-slate-400 font-medium">No products found in the vault.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {products.map((p: any) => (
              <Link 
                href={`/products/${p._id}`} 
                key={p._id} 
                className="group relative flex flex-col"
              >
                <div className="relative h-80 bg-slate-50 rounded-[2.5rem] overflow-hidden border border-slate-100 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-blue-100 group-hover:-translate-y-2 flex items-center justify-center">
                  
                  {/* REAL IMAGE DISPLAY */}
                  {p.images && p.images.length > 0 ? (
                    <img 
                      src={p.images[0]} 
                      alt={p.name} 
                      className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                  ) : (
                    <ShoppingBag size={60} className="text-slate-200 group-hover:text-blue-100 transition-colors duration-500" />
                  )}
                  
                  <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors duration-500 flex items-end p-6">
                    <div className="bg-white w-full py-3 rounded-2xl shadow-xl translate-y-20 group-hover:translate-y-0 transition-transform duration-500 flex items-center justify-center gap-2 font-bold text-sm text-slate-900">
                      View Details <ArrowRight size={16} />
                    </div>
                  </div>
                </div>

                <div className="mt-6 px-2">
                  <h2 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                    {p.name}
                  </h2>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-slate-500 text-sm font-medium">{p.category || "Vector Series"}</p>
                    <p className="text-blue-600 font-black text-lg">${p.price.toLocaleString()}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}