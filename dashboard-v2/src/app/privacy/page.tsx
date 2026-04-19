'use client';

import { ShieldCheck, Lock, EyeOff, Key, ArrowLeft, Fingerprint, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function PrivacyPage() {
  const pillars = [
    { 
      title: 'Data Sovereignty', 
      icon: <Fingerprint className="text-emerald-500" />,
      content: 'Your career narrative is yours. We use high-isolation tenancy on Neon Postgres to ensure no cross-leakage ever occurs.'
    },
    { 
      title: 'Brevo Privacy', 
      icon: <Lock className="text-amber-500" />,
      content: 'Email verification is performed over encrypted tunnels. We never share your contact details with external scanners.'
    },
    { 
      title: 'Model Privacy', 
      icon: <EyeOff className="text-blue-500" />,
      content: 'Your tailoring requests to OpenAI and HuggingFace are stateless. No fine-tuning is performed on your private career data.'
    },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-8 md:p-24 selection:bg-amber-500/30 font-sans">
      <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-12 group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Hub
      </Link>

      <div className="max-w-4xl">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">Privacy Core</h1>
        <p className="text-white/40 text-lg mb-16 max-w-2xl text-balance">The Career-Ops Zero-Trust Manifest. We believe professional growth shouldn&apos;t compromise personal data integrity.</p>

        <div className="space-y-12 mb-20">
          {pillars.map((p, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-8 items-start"
            >
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 shrink-0">{p.icon}</div>
              <div>
                <h3 className="text-2xl font-bold mb-2">{p.title}</h3>
                <p className="text-white/40 leading-relaxed max-w-xl">{p.content}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl flex items-center gap-6">
          <Key className="text-emerald-500 shrink-0" size={32} />
          <div>
            <h4 className="font-bold mb-1">Encrypted Secrets</h4>
            <p className="text-white/40 text-sm">Your API keys are stored with AES-256 encryption. Our infrastructure never reads them in plain text outside of the secure execution runner.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
