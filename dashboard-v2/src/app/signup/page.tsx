'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, Github, Mail, Lock, User, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setIsSuccess(true);
      // Automatically log them in after 2 seconds
      setTimeout(() => {
        signIn('credentials', {
           email: formData.email,
           password: formData.password,
           callbackUrl: '/'
        });
      }, 2000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-amber-500/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[150px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center h-12 w-12 bg-amber-500 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.2)] mb-4">
            <Briefcase className="h-6 w-6 text-black" />
          </Link>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Join Career-Ops</h1>
          <p className="text-white/40 text-sm">Create your AI-powered career command center.</p>
        </div>

        <div className="bg-white/[0.02] border border-white/10 backdrop-blur-3xl rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10"
              >
                <div className="h-20 w-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Welcome aboard!</h2>
                <p className="text-white/40 mb-8">Your account has been created. Redirecting you to the dashboard...</p>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2 }}
                    className="h-full bg-emerald-500" 
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div key="form" exit={{ opacity: 0, scale: 0.95 }}>
                <button 
                  onClick={() => signIn('github', { callbackUrl: '/' })}
                  className="w-full bg-white text-black font-bold py-3.5 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/90 transition-all active:scale-[0.98] mb-6"
                >
                  <Github size={20} />
                  Join with GitHub
                </button>

                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/5"></span>
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase">
                    <span className="bg-[#09090b] px-4 text-white/20 tracking-widest font-bold">Or use email</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                      <input 
                        type="text" 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="John Doe"
                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-amber-500/50 transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">Work Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                      <input 
                        type="email" 
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="name@company.com"
                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-amber-500/50 transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">Password</label>
                      <input 
                        type="password" 
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 px-4 outline-none focus:border-amber-500/50 transition-all text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">Confirm</label>
                      <input 
                        type="password" 
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 px-4 outline-none focus:border-amber-500/50 transition-all text-sm"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="text-red-400 text-xs font-bold text-center bg-red-500/10 py-2 rounded-xl border border-red-500/20">
                      {error}
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-amber-500 text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/10 active:scale-[0.98] disabled:opacity-50 mt-4"
                  >
                    {isLoading ? 'Creating Account...' : (
                      <>
                        Create Account
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="mt-8 text-center text-white/40 text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-amber-500 font-bold hover:text-amber-400 transition-colors">
            Sign in
          </Link>
        </p>

        <div className="mt-8 flex items-center justify-center gap-2 text-white/10">
          <ShieldCheck size={14} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Enterprise Security v2.0</span>
        </div>
      </motion.div>
    </div>
  );
}
