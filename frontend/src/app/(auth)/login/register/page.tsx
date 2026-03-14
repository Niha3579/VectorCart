"use client";
import { useState } from 'react';
import { authService } from '@/services/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'customer' });
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authService.register(formData);
      alert("Account created! Please log in.");
      router.push('/login');
    } catch (err: any) {
      alert(err.response?.data?.detail || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
        <h1 className="text-3xl font-bold text-center mb-8">Create Account</h1>
        <form onSubmit={handleRegister} className="space-y-4">
          <input 
            placeholder="Full Name" required 
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-slate-200"
          />
          <input 
            type="email" placeholder="Email" required 
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-slate-200"
          />
          <input 
            type="password" placeholder="Password" required 
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-slate-200"
          />
          <button className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition">
            Create Account
          </button>
        </form>
        <p className="text-center mt-6 text-slate-600">
          Already have an account? <Link href="/login" className="text-blue-600 font-bold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}