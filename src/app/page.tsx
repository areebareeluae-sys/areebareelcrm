'use client';

import { useState } from 'react';
import { loginUser } from './api/users/route';

export default function LoginPage() {
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const result = await loginUser(formData);

    if (result?.error) {
      setErrorMsg(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-slate-950">
      
      {/* Background Image with Blur & Scale Animation */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0 filter brightness-[0.8] blur-[3px] scale-105 transition-transform duration-1000"
        style={{ backgroundImage: `url('/images/loginbackground.jpg')` }}
      ></div>

      {/* Modern Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/90 via-indigo-950/70 to-slate-900/80 z-0"></div>

      {/* Login Card Container with Fade-in & Scale Animation */}
      <div className="relative z-10 bg-white/15 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 w-full max-w-md space-y-6 transition-all duration-500 hover:shadow-indigo-500/10">
        
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-black text-white tracking-tight">Admin Portal</h1>
          <p className="text-xs text-slate-300 font-medium">Enter your credentials to access the dashboard</p>
        </div>

        {/* Error message alert */}
        {errorMsg && (
          <div className="bg-rose-500/20 border border-rose-500/40 text-rose-200 p-3 rounded-xl text-xs text-center font-semibold animate-shake">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Email / Username</label>
            <input 
              name="email" 
              type="text" 
              placeholder="admin@example.com" 
              required 
              className="w-full bg-slate-900/50 border border-white/15 text-white placeholder-slate-400 p-3 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition" 
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Password</label>
            <input 
              name="password" 
              type="password" 
              placeholder="••••••••" 
              required 
              className="w-full bg-slate-900/50 border border-white/15 text-white placeholder-slate-400 p-3 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition" 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-3 rounded-xl font-bold text-sm tracking-wide shadow-lg shadow-indigo-600/30 hover:from-indigo-500 hover:to-blue-500 active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center text-[11px] text-slate-400 font-medium pt-2 border-t border-white/10">
          Areeb Areel CRM Admin Portal &copy; {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}