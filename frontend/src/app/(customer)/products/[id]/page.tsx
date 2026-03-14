"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, productService, cartService } from '@/services/api'; 
import Navbar from '@/components/Navbar';
import { ShoppingCart, ArrowLeft, ShieldCheck, Truck, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function ProductDetails() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (id) {
      productService.getOne(id as string)
        .then(res => setProduct(res.data))
        .catch(() => router.push('/products'))
        .finally(() => setLoading(false));
    }
  }, [id, router]);

  const handleAddToCart = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert("Please sign in first to add items to your cart.");
      router.push('/login');
      return;
    }

    setIsAdding(true);
    try {
      // 1. Sync with Backend (Crucial to prevent 400 error at checkout)
      await cartService.syncAdd(product._id, 1);

      // 2. Update Local UI State
      addToCart(product);

      alert(`${product.name} added to cart!`);
    } catch (err: any) {
      console.error("Cart sync failed:", err);
      alert(err.response?.data?.detail || "Failed to sync cart. Try logging in again.");
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  if (!product) return null;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-12">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-black mb-8 transition-colors font-medium"
        >
          <ArrowLeft size={20} /> Back to Collection
        </button>

        <div className="grid md:grid-cols-2 gap-16 items-start">
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-[2rem] aspect-square flex items-center justify-center border border-slate-100 shadow-inner">
              <ShoppingCart size={120} className="text-slate-200" />
            </div>
          </div>

          <div className="flex flex-col h-full">
            <div className="flex-1 space-y-8">
              <div>
                <span className="text-blue-600 font-bold tracking-widest text-xs uppercase">Premium Collection</span>
                <h1 className="text-5xl font-black text-slate-900 mt-2 tracking-tight">{product.name}</h1>
                <p className="text-3xl text-slate-900 font-light mt-4">${product.price.toLocaleString()}</p>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-slate-900">Description</h3>
                <p className="text-slate-500 leading-relaxed text-lg">{product.description || "Premium vector gear."}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <Truck className="text-blue-600" size={24} />
                  <div>
                    <p className="text-xs font-bold text-slate-900 uppercase">Shipping</p>
                    <p className="text-xs text-slate-500">Free Express</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <ShieldCheck className="text-blue-600" size={24} />
                  <div>
                    <p className="text-xs font-bold text-slate-900 uppercase">Warranty</p>
                    <p className="text-xs text-slate-500">2 Year Local</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <button 
                onClick={handleAddToCart}
                disabled={isAdding}
                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl disabled:bg-slate-300 transform active:scale-95"
              >
                {isAdding ? <Loader2 className="animate-spin" size={24} /> : <ShoppingCart size={24} />}
                {isAdding ? "Syncing..." : "Add to Cart"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}