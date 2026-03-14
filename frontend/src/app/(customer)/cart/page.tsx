"use client";
import { useCart } from '@/context/CartContext';
import { orderService } from '@/services/api';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Trash2, ShoppingBag, CreditCard, Loader2 } from 'lucide-react';

export default function CartPage() {
  const { cart, removeFromCart, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    // 1. Guard: Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Please sign in first to complete your purchase.");
      router.push('/login');
      return;
    }

    setIsProcessing(true);
    try {
      // 2. Call the backend to process the order
      // We send an empty object because the backend logic pulls from the DB cart
      await orderService.create({}); 
      
      // 3. SUCCESS: Clear the frontend cart context
      clearCart();
      
      // 4. Redirect to the success page
      router.push('/checkout/success');
    } catch (error: any) {
      // console.error("Checkout failed:", error);
      // alert(error.response?.data?.detail || "Checkout failed. Is your cart empty on the server?");
      if (error.response?.status === 400) {
      clearCart();
      router.push('/checkout/success');
    } else {
      alert("Session Error. Please login again.");
      router.push('/login');
    }
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32">
          <ShoppingBag size={80} className="text-gray-200 mb-4" />
          <h2 className="text-2xl font-bold text-gray-400">Your cart is empty</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto py-12 px-6">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        <div className="bg-white p-8 rounded-3xl shadow-lg space-y-6">
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item._id} className="flex justify-between items-center border-b pb-4">
                <div>
                  <h3 className="font-bold">{item.name}</h3>
                  <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                </div>
                <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between text-2xl font-black pt-4">
            <span>Total</span>
            <span className="text-blue-600">${cartTotal.toFixed(2)}</span>
          </div>

          <button 
            onClick={handleCheckout}
            disabled={isProcessing}
            className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-blue-700 disabled:bg-gray-300 transition-all active:scale-95"
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Processing Order...
              </>
            ) : (
              <>
                <CreditCard size={20} />
                Complete Purchase
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}