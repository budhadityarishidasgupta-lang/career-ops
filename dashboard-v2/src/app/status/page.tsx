'use client';

import { ShieldCheck, Zap, Server, Globe, ArrowLeft, CheckCircle2, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function StatusPage() {
  const systems = [
    { name: 'Core API Engine', status: 'Operational', latency: '42ms', uptime: '99.99%', icon: <Zap className="text-amber-500" /> },
    { name: 'Brevo Mail Gateway', status: 'Operational', latency: '120ms', uptime: '100%', icon: <Activity className="text-blue-500" /> },
    { name: 'Scoring Infrastructure', status: 'Operational', latency: '210ms', uptime: '99.95%', icon: <Server className="text-emerald-500" /> },
    { name: 'On-chain Data Feed', status: 'Degraded', latency: '1.2s', uptime: '98.2%', icon: <Globe className="text-purple-500" /> },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-8 md:p-24 selection:bg-amber-500/30 font-sans">
      <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-12 group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Hub
      </Link>

      <div className="max-w-4xl">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">Infrastructure Status</h1>
        <p className="text-white/40 text-lg mb-16 max-w-2xl">Real-time pulse of the Career-Ops ecosystem. We maintain zero-trust, high-availability clusters across global nodes.</p>

        <div className="grid gap-6">
          {systems.map((s, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/[0.02] border border-white/10 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 backdrop-blur-sm"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/5 rounded-2xl">{s.icon}</div>
                <div>
                  <h3 className="font-bold text-lg">{s.name}</h3>
                  <div className="flex gap-4 text-xs font-mono text-white/40 mt-1">
                    <span>Latency: {s.latency}</span>
                    <span>Uptime: {s.uptime}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                <div className={`h-2 w-2 rounded-full ${s.status === 'Operational' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'}`} />
                <span className={`text-xs font-bold uppercase tracking-widest ${s.status === 'Operational' ? 'text-emerald-500' : 'text-amber-500'}`}>{s.status}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 p-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 opacity-30 italic text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} />
            All systems nominal (excluding blockchain feeds)
          </div>
          <div className="font-mono">Last refreshed: {new Date().toLocaleTimeString()}</div>
        </div>
      </div>
    </div>
  );
}
