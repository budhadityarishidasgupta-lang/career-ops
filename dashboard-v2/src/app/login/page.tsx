'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Briefcase, Github, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: true,
        callbackUrl: '/'
      });
      if (result?.error) {
        setError("Invalid credentials. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-16 w-16 bg-amber-500 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.3)] mb-6">
            <Briefcase className="h-8 w-8 text-black" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Career-Ops</h1>
          <p className="text-white/40 font-medium">Elevate your career with AI-driven intelligence.</p>
        </div>

        <div className="bg-white/[0.03] border border-white/10 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl">
          <div className="space-y-6">
            {/* Social Login */}
            <button 
              onClick={() => signIn('github', { callbackUrl: '/' })}
              className="w-full bg-white text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/90 transition-all shadow-lg active:scale-[0.98]"
            >
              <Github size={20} />
              Continue with GitHub
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#0e0e11] px-4 text-white/30 tracking-widest font-bold">Or secure access</span>
              </div>
            </div>

            {/* Credentials Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">Work Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-amber-500/50 focus:ring-4 ring-amber-500/5 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-amber-500/50 focus:ring-4 ring-amber-500/5 transition-all text-sm"
                  />
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-red-400 text-xs font-bold text-center bg-red-500/10 py-2 rounded-xl border border-red-500/20"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-amber-500 text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none mt-4"
              >
                {isLoading ? 'Authenticating...' : (
                  <>
                    Access Dashboard
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-white/30">
          <ShieldCheck size={14} />
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">Secured with Enterprise Auth v5.0</span>
        </div>
      </motion.div>

      {/* Footer Branding */}
      <div className="absolute bottom-8 text-center w-full opacity-20 hover:opacity-100 transition-opacity cursor-default">
         <p className="text-[10px] font-bold tracking-[0.3em] uppercase">Built for high-performance careers</p>
      </div>
    </div>
  );
}
