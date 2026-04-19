'use client';

import { FileText, Search, Play, Zap, ArrowLeft, Target, Cpu, Database } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function DocsPage() {
  const sections = [
    { 
      title: 'Global Scanners', 
      icon: <Search className="text-amber-500" />,
      content: 'Our continuous scraping engines ingest job data from Vercel, Greenhouse, LinkedIn, and specialized engineering portals 24/7.'
    },
    { 
      title: 'Agentic Tailoring', 
      icon: <Target className="text-blue-500" />,
      content: 'LLM-driven optimization that cross-references your career narrative against real-time hiring manager signals found in JD semantic clusters.'
    },
    { 
      title: 'Infrastructure Sync', 
      icon: <Database className="text-emerald-500" />,
      content: 'Multi-tenant database architecture ensures that your data is strictly isolated and encrypted at rest with zero-trust protocols.'
    },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-8 md:p-24 selection:bg-amber-500/30 font-sans">
      <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-12 group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Hub
      </Link>

      <div className="max-w-4xl">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">Documentation</h1>
        <p className="text-white/40 text-lg mb-16 max-w-2xl text-balance">The technical foundation of Career-Ops. Learn how we use agentic AI to build the ultimate career command center.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {sections.map((s, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="space-y-4"
            >
              <div className="p-4 bg-white/5 w-fit rounded-2xl border border-white/10">{s.icon}</div>
              <h3 className="text-2xl font-bold">{s.title}</h3>
              <p className="text-white/40 leading-relaxed text-sm">{s.content}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-24 p-8 bg-amber-500/5 border border-amber-500/10 rounded-3xl">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Cpu className="text-amber-500" size={20} />
            AI Training Context
          </h2>
          <p className="text-white/60 text-sm leading-relaxed">Career-Ops uses a specialized RAG (Retrieval-Augmented Generation) pipeline that combines your career narrative with thousands of high-performing resume patterns to generate high-conversion applications on the fly.</p>
        </div>
      </div>
    </div>
  );
}
