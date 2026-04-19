'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  FileText, 
  LayoutDashboard, 
  Play, 
  Search, 
  Settings, 
  Terminal as TerminalIcon 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [logs, setLogs] = useState<any[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [cmdInput, setCmdInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const runCommand = (query: string) => {
    // Add to logs visual feedback
    setLogs(prev => [...prev, { type: 'stdout', content: `\ncareer-ops > ${query}\n` }]);
    setIsExecuting(true);
    
    const eventSource = new EventSource(`/api/exec?q=${encodeURIComponent(query)}`);
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'done') {
        setIsExecuting(false);
        eventSource.close();
      } else {
        setLogs(prev => [...prev, data]);
      }
    };

    eventSource.onerror = () => {
      setLogs(prev => [...prev, { type: 'stderr', content: '\n✗ Connection lost or execution failed.' }]);
      setIsExecuting(false);
      eventSource.close();
    };
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cmdInput.trim() || isExecuting) return;
    
    const q = cmdInput.trim();
    setHistory(prev => [q, ...prev].slice(0, 50));
    setHistoryIndex(-1);
    runCommand(q);
    setCmdInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const nextIndex = historyIndex + 1;
      if (nextIndex < history.length) {
        setHistoryIndex(nextIndex);
        setCmdInput(history[nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = historyIndex - 1;
      if (nextIndex >= 0) {
        setHistoryIndex(nextIndex);
        setCmdInput(history[nextIndex]);
      } else {
        setHistoryIndex(-1);
        setCmdInput('');
      }
    }
  };

  useEffect(() => {
    const fetchData = () => {
      fetch('/api/data')
        .then(res => res.json())
        .then(d => {
          setData(d);
          setLoading(false);
        });
    };
    fetchData();
    const interval = setInterval(fetchData, 30000); // 30s refresh
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll terminal with better precision
  useEffect(() => {
    const term = document.getElementById('terminal-logs');
    if (term) {
      term.scrollTo({
        top: term.scrollHeight,
        behavior: 'auto' // Instant scroll for "real-time" feel
      });
    }
  }, [logs]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#09090b] text-white">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#09090b] text-[#fafafa] font-sans selection:bg-amber-500/30">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-black/20 backdrop-blur-xl flex flex-col p-6">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="h-8 w-8 bg-amber-500 rounded-lg flex items-center justify-center">
            <Briefcase className="h-5 w-5 text-black" />
          </div>
          <span className="text-xl font-bold tracking-tight">Career-Ops <span className="text-xs text-amber-500 font-mono opacity-60">v2</span></span>
        </div>

        <nav className="space-y-2 flex-1">
          <NavItem icon={<LayoutDashboard size={18}/>} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavItem icon={<Briefcase size={18}/>} label="Applications" active={activeTab === 'apps'} onClick={() => setActiveTab('apps')} />
          <NavItem icon={<Search size={18}/>} label="Job Pipeline" active={activeTab === 'pipeline'} onClick={() => setActiveTab('pipeline')} />
          <NavItem icon={<FileText size={18}/>} label="Resume Manager" active={activeTab === 'cv'} onClick={() => setActiveTab('cv')} />
          <NavItem icon={<TerminalIcon size={18}/>} label="Terminal" active={activeTab === 'terminal'} onClick={() => setActiveTab('terminal')} />
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5">
          <NavItem icon={<Settings size={18}/>} label="Settings" active={false} onClick={() => {}} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-10">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold mb-1">Welcome back, {data?.profile?.candidate?.full_name?.split(' ')[0]}</h1>
            <p className="text-white/40">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="flex gap-4">
             <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2">
                <Search size={16} />
                <span>Global Search</span>
             </button>
             <button 
                onClick={() => { setActiveTab('terminal'); runCommand('rank'); }}
                className="px-4 py-2 bg-amber-500 text-black font-semibold rounded-lg hover:bg-amber-400 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
              >
                <Play size={16} />
                <span>Quick Run</span>
             </button>
          </div>
        </header>

        <section className="grid grid-cols-4 gap-6 mb-10">
          <StatCard icon={<Clock className="text-amber-500" />} label="Ongoing" value={data?.stats?.applied || 0} color="amber" />
          <StatCard icon={<CheckCircle2 className="text-emerald-500" />} label="Interviews" value={data?.stats?.interviews || 0} color="emerald" />
          <StatCard icon={<FileText className="text-blue-500" />} label="Generated PDFs" value={data?.pdfs?.length || 0} color="blue" />
          <StatCard icon={<Search className="text-white/40" />} label="In Pipeline" value={data?.pipeline?.length || 0} color="gray" />
        </section>

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div key="dash" className="grid grid-cols-2 gap-10">
               <div className="bg-white/5 p-8 rounded-3xl border border-white/10 aspect-video flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Application Funnel</h3>
                    <p className="text-white/40">Real-time status tracking</p>
                  </div>
                  <div className="flex items-end gap-4 h-32">
                    <div className="flex-1 bg-amber-500/20 border-t-2 border-amber-500 rounded-lg h-[80%]" />
                    <div className="flex-1 bg-amber-500/15 border-t-2 border-amber-500/60 rounded-lg h-[50%]" />
                    <div className="flex-1 bg-amber-500/10 border-t-2 border-amber-500/30 rounded-lg h-[20%]" />
                    <div className="flex-1 bg-white/5 rounded-lg h-[5%]" />
                  </div>
               </div>
               <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
                  <h3 className="text-2xl font-bold mb-6">Recent Activity</h3>
                  <div className="space-y-4">
                    {data?.applications?.slice(0, 4).map((app: any, i: number) => (
                      <div key={i} className="flex items-center gap-4 text-sm">
                        <div className="h-2 w-2 rounded-full bg-amber-500" />
                        <span className="font-semibold">{app.company}</span>
                        <span className="text-white/40">applied {new Date(app.applied_at).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
               </div>
            </motion.div>
          )}

          {activeTab === 'apps' && (
            <motion.div key="apps" className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
              <div className="p-6 border-b border-white/5">
                <h2 className="text-xl font-bold">Applications</h2>
              </div>
              <div className="overflow-x-auto max-h-[600px] scroll-smooth">
                <table className="w-full text-left">
                  <thead className="sticky top-0 z-10 bg-[#09090b] shadow-[0_1px_0_rgba(255,255,255,0.05)]">
                    <tr className="text-white/40 text-xs uppercase tracking-widest font-bold">
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">Company</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Applied</th>
                      <th className="px-6 py-4">Score</th>
                      <th className="px-6 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.applications?.map((app: any, i: number) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-4 text-xs font-mono text-white/20">#{app.app_id}</td>
                        <td className="px-6 py-4 font-semibold">{app.company}</td>
                        <td className="px-6 py-4 text-white/60">{app.role}</td>
                        <td className="px-6 py-4 text-white/40 text-sm font-mono">{new Date(app.applied_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-2">
                             <div className="h-1.5 w-12 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500" style={{ width: `${app.score * 10 || 0}%` }}></div>
                             </div>
                             <span className="text-xs font-mono text-amber-500">{app.score}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <button 
                             onClick={() => { setActiveTab('terminal'); runCommand(`apply ${app.app_id}`); }}
                             className="p-2 border border-white/10 rounded-lg hover:bg-amber-500 hover:text-black transition-all"
                           >
                             <Play size={14} />
                           </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'pipeline' && (
            <motion.div key="pipeline" className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
              <div className="p-6 border-b border-white/5">
                <h2 className="text-xl font-bold">Job Pipeline (Vercel/Greenhouse Scanned)</h2>
              </div>
              <div className="overflow-x-auto text-sm max-h-[600px] scroll-smooth">
                <table className="w-full text-left">
                  <thead className="sticky top-0 z-10 bg-[#09090b] shadow-[0_1px_0_rgba(255,255,255,0.05)]">
                    <tr className="text-white/40 text-xs uppercase tracking-widest font-bold">
                      <th className="px-6 py-4 w-12">ID</th>
                      <th className="px-6 py-4">Target / Company</th>
                      <th className="px-6 py-4">Job Title</th>
                      <th className="px-6 py-4">Portal</th>
                      <th className="px-6 py-4">AI Score</th>
                      <th className="px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.pipeline?.map((job: any, i: number) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-4 text-amber-500/40 font-mono text-xs">#{job.pipeline_id}</td>
                        <td className="px-6 py-4">
                           <div className="font-semibold text-[#fafafa]">{job.company}</div>
                           <a href={job.url} target="_blank" className="text-xs text-amber-500 hover:underline">{job.url.substring(0, 40)}...</a>
                        </td>
                        <td className="px-6 py-4 text-white/80">{job.title || 'Unknown Role'}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded-md bg-amber-500/10 text-amber-500 text-[10px] font-bold border border-amber-500/20 uppercase tracking-tighter">
                            {job.source || 'Scanned'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-amber-500">{job.score}</td>
                        <td className="px-6 py-4 flex gap-2">
                           <button 
                             onClick={() => { setActiveTab('terminal'); runCommand(`offer-match ${job.pipeline_id}`); }}
                             className="px-3 py-1.5 bg-amber-500 text-black rounded-lg font-bold text-xs hover:bg-amber-400 transition-colors"
                           >
                             Tailor
                           </button>
                           <button 
                             onClick={() => { setActiveTab('terminal'); runCommand(`apply ${job.pipeline_id}`); }}
                             className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg font-bold text-xs hover:bg-emerald-500/30 transition-colors"
                           >
                             Apply
                           </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'cv' && (
            <motion.div key="cv" className="grid grid-cols-3 gap-8">
               <div className="col-span-2 space-y-8">
                  <div className="bg-white/5 p-8 border border-white/10 rounded-3xl">
                     <h3 className="text-xl font-bold mb-4">Profile Narrative</h3>
                     <p className="text-white/60 leading-relaxed italic border-l-2 border-amber-500 pl-4">
                        "{data?.profile?.narrative?.exit_story}"
                     </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {data?.profile?.narrative?.superpowers?.map((s: any, i: number) => (
                      <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-xl text-sm text-white/40">
                         {s}
                      </div>
                    ))}
                  </div>
               </div>
               <div className="bg-[#050505] border border-white/10 rounded-3xl p-6 flex flex-col">
                  <h3 className="font-bold mb-6 flex items-center gap-2 underline underline-offset-8 decoration-amber-500">Generated PDFs</h3>
                  <div className="space-y-2 overflow-y-auto flex-1 pr-2">
                    {data?.pdfs?.map((pdf: any, i: number) => (
                      <div key={i} className="p-3 bg-white/5 rounded-lg border border-white/5 hover:border-amber-500/50 transition-all flex items-center justify-between group">
                         <div className="truncate text-xs font-mono text-white/60">{pdf.name}</div>
                         <FileText size={14} className="group-hover:text-amber-500 transition-colors" />
                      </div>
                    ))}
                  </div>
               </div>
            </motion.div>
          )}

          {activeTab === 'terminal' && (
            <motion.div key="terminal" className="bg-black border border-white/10 rounded-2xl flex flex-col h-[500px] overflow-hidden shadow-2xl relative">
              <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02] z-10">
                 <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                       <div className="h-2.5 w-2.5 bg-red-500/50 rounded-full" />
                       <div className="h-2.5 w-2.5 bg-amber-500/50 rounded-full" />
                       <div className="h-2.5 w-2.5 bg-emerald-500/50 rounded-full" />
                    </div>
                    <span className="text-xs font-mono text-white/40 ml-2">career-ops-terminal.zsh</span>
                 </div>
                 <div className="flex gap-4 items-center">
                    {isExecuting && (
                      <div className="flex items-center gap-2">
                         <div className="h-2 w-2 bg-amber-500 rounded-full animate-ping" />
                         <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">Active</span>
                      </div>
                    )}
                    <button onClick={() => setLogs([])} className="text-xs text-white/20 hover:text-white transition-colors uppercase tracking-widest font-bold">Clear</button>
                 </div>
              </div>
                  <div id="terminal-logs" className="flex-1 p-6 font-mono text-sm overflow-y-auto whitespace-pre-wrap bg-[#050505] scroll-smooth">
                     {logs.length === 0 && !isExecuting ? (
                       <div className="text-white/20 italic">Ready for command... type &apos;help&apos; to begin</div>
                     ) : (
                       <div className="space-y-0.5">
                         {logs.map((log, i) => (
                           <div key={i} className={`${log.type === 'stderr' ? 'text-red-400' : 'text-amber-500/80'} leading-relaxed`}>
                              {log.content}
                           </div>
                         ))}
                         {isExecuting && (
                            <motion.span 
                              animate={{ opacity: [1, 0] }}
                              transition={{ duration: 0.8, repeat: Infinity }}
                              className="inline-block w-2.5 h-5 bg-amber-500 align-middle ml-1"
                            />
                         )}
                       </div>
                     )}
                  </div>

                  {/* Quick Action Bar */}
                  <div className="flex gap-2 p-3 bg-white/[0.03] border-t border-white/5 overflow-x-auto no-scrollbar">
                     <div className="flex items-center gap-2 px-2 border-r border-white/10 mr-1">
                        <TerminalIcon size={12} className="text-white/20" />
                        <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest whitespace-nowrap">AI Tools</span>
                     </div>
                     <button onClick={() => runCommand('scan')} className="px-3 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-[10px] font-bold border border-amber-500/20 transition-all whitespace-nowrap">SCAN</button>
                     <button onClick={() => runCommand('offer-list')} className="px-3 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-[10px] font-bold border border-amber-500/20 transition-all whitespace-nowrap">OFFER-LIST</button>
                     <button onClick={() => runCommand('apply')} className="px-3 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 text-[10px] font-bold border border-emerald-500/20 transition-all whitespace-nowrap">APPLY</button>
                     <button onClick={() => runCommand('help')} className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 text-white/40 text-[10px] font-bold border border-white/10 transition-all whitespace-nowrap">HELP</button>
                  </div>

                  <div className="p-4 bg-[#050505]">
                     <div className="flex items-center gap-2 group">
                        <span className="text-amber-500 font-bold shrink-0">career-ops &gt;</span>
                        <form onSubmit={handleCommandSubmit} className="flex-1">
                           <input 
                             type="text"
                             value={cmdInput}
                             onChange={(e) => setCmdInput(e.target.value)}
                             onKeyDown={handleKeyDown}
                             placeholder={isExecuting ? 'Waiting for process...' : 'scan · offer-list · offer-match <id> · apply <id> · help'}
                             disabled={isExecuting}
                             className="w-full bg-transparent outline-none border-none text-[#fafafa] placeholder:text-white/10 caret-amber-500"
                             autoFocus
                           />
                        </form>
                     </div>
                  </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-amber-500 text-black font-bold shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
      {icon}
      <span className="text-sm">{label}</span>
      {active && <motion.div layoutId="nav-active" className="ml-auto w-1.5 h-1.5 bg-black rounded-full" />}
    </button>
  );
}

function StatCard({ icon, label, value, color }: { icon: any, label: string, value: any, color: string }) {
  const colors: any = {
    amber: 'border-amber-500/20 bg-amber-500/5',
    emerald: 'border-emerald-500/20 bg-emerald-500/5',
    blue: 'border-blue-500/20 bg-blue-500/5',
    gray: 'border-white/10 bg-white/5'
  };

  return (
    <div className={`p-6 rounded-2xl border ${colors[color]} backdrop-blur-sm`}>
      <div className="flex items-center justify-between mb-4">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">{label}</span>
      </div>
      <div className="text-3xl font-bold tracking-tight">{value}</div>
    </div>
  );
}
