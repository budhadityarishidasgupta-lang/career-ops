'use client';

import { Briefcase, ArrowRight, ShieldCheck, Play, Sparkles, Zap, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-amber-500/10 rounded-full blur-[150px] animate-pulse" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[150px]" />

      {/* Header */}
      <header className="z-20 px-8 py-6 flex justify-between items-center border-b border-white/5 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-amber-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            <Briefcase className="h-5 w-5 text-black" />
          </div>
          <span className="text-xl font-bold tracking-tight">Career-Ops <span className="text-xs text-amber-500 font-mono opacity-60">SaaS v2</span></span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-bold text-white/60 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link href="/signup" className="px-5 py-2.5 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-all shadow-lg active:scale-95">
            Join Platform
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10 max-w-5xl mx-auto w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold uppercase tracking-widest mb-4">
            <Sparkles size={12} />
            Next Gen Career Infrastructure
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-tight">
            Automate Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-200">Career Ascension</span>
          </h1>

          <p className="text-white/40 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            The multi-tenant AI command center for professional growth. 
            Automated job scanning, agentic resume tailoring, and 
            real-time pipeline intelligence.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-10">
            <Link 
              href="/signup" 
              className="w-full md:w-auto px-10 py-5 bg-amber-500 text-black font-bold text-lg rounded-2xl flex items-center justify-center gap-3 hover:bg-amber-400 transition-all shadow-[0_0_30px_rgba(245,158,11,0.2)] active:scale-95 group"
            >
              Get Started for Free
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/login" 
              className="w-full md:w-auto px-10 py-5 bg-white/5 border border-white/10 text-white font-bold text-lg rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all active:scale-95"
            >
              Enter Command Center
            </Link>
          </div>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 w-full"
        >
          <FeatureCard 
            icon={<Zap size={24} className="text-amber-500" />} 
            title="Real-time Scanning" 
            desc="Continuous scraping of global job boards with high-precision AI ranking." 
          />
          <FeatureCard 
            icon={<Target size={24} className="text-blue-500" />} 
            title="Agentic Tailoring" 
            desc="LLM-driven resume optimization that matches exact hiring manager signals." 
          />
          <FeatureCard 
            icon={<ShieldCheck size={24} className="text-emerald-500" />} 
            title="Secure Tenancy" 
            desc="Encrypted multi-tenant architecture keeps your career narrative private." 
          />
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="z-10 p-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 bg-black/40 backdrop-blur-3xl">
        <div className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] flex items-center gap-2">
          <Play size={10} className="fill-white/20" />
          Initialized v2.0-cloud-saas
        </div>
        <div className="flex gap-8 text-white/40 text-xs text-balance">
          <Link href="/docs" className="hover:text-white transition-colors">Documentation</Link>
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy Core</Link>
          <Link href="/status" className="hover:text-white transition-colors">Infrastructure Status</Link>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl text-left backdrop-blur-sm group hover:border-white/10 transition-all">
      <div className="mb-6 p-3 bg-white/5 w-fit rounded-2xl group-hover:bg-white/10 transition-colors">
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
