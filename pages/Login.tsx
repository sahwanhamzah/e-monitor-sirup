
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  LogIn, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  Calendar, 
  Search, 
  TrendingUp, 
  Package, 
  Percent, 
  AlertCircle, 
  Newspaper, 
  Phone, 
  Mail, 
  MapPin, 
  ExternalLink, 
  X, 
  Clock, 
  CheckCircle2,
  Monitor,
  Award,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { OPD, ProgressData, NewsItem } from '../types';
import { formatReportNumber, formatReportDecimal, getStatusBgClass, getCurrentTimestamp, formatCurrencyMillions, formatPercent } from '../utils';

interface LoginProps {
  onLogin: (username: string, password: string) => void;
  error?: string | null;
  opds: OPD[];
  progress: ProgressData[];
  news: NewsItem[];
}

type ViewState = 'login' | 'rekap' | 'berita' | 'kontak' | 'tv';

const Login: React.FC<LoginProps> = ({ onLogin, error, opds = [], progress = [], news = [] }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeView, setActiveView] = useState<ViewState>('login');
  const [searchTerm, setSearchTerm] = useState('');
  const [time, setTime] = useState(new Date());
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Mekanisme Auto-Scroll TV Monitor yang lebih stabil
  useEffect(() => {
    if (activeView !== 'tv' || progress.length === 0) return;
    
    let scrollTask: any;
    const scrollContainer = scrollRef.current;
    
    const startScroll = () => {
      if (!scrollContainer) return;
      let scrollAmount = scrollContainer.scrollTop;
      scrollTask = setInterval(() => {
        if (!scrollContainer) return;
        if (scrollContainer.scrollTop + scrollContainer.clientHeight >= scrollContainer.scrollHeight - 5) {
          scrollAmount = 0;
          scrollContainer.scrollTop = 0;
        } else {
          scrollAmount += 1;
          scrollContainer.scrollTop = scrollAmount;
        }
      }, 40);
    };

    // Delay sedikit untuk memastikan DOM siap
    const timeout = setTimeout(startScroll, 1000);
    return () => {
      clearTimeout(timeout);
      if (scrollTask) clearInterval(scrollTask);
    };
  }, [activeView, progress.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  const filteredProgress = useMemo(() => {
    if (!progress) return [];
    return progress.filter(p => {
      const opd = opds.find(o => o.id === p.opdId);
      return opd?.name.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [progress, opds, searchTerm]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProgress.slice(start, start + pageSize);
  }, [filteredProgress, currentPage, pageSize]);

  // Kalkulasi Dashboard Publik
  const totalPaguMurni = useMemo(() => opds.reduce((acc, curr) => acc + (curr.paguMurni || 0), 0), [opds]);
  const totalPaguTerinput = useMemo(() => progress.reduce((acc, curr) => 
    acc + (curr.todayPenyediaPagu || 0) + (curr.todaySwakelolaPagu || 0) + (curr.todayPdSPagu || 0), 0
  ), [progress]);
  const totalPaket = useMemo(() => progress.reduce((acc, curr) => 
    acc + (curr.todayPenyediaPaket || 0) + (curr.todaySwakelolaPaket || 0) + (curr.todayPdSPaket || 0), 0
  ), [progress]);
  
  const avgPercent = totalPaguMurni > 0 ? (totalPaguTerinput / totalPaguMurni) * 100 : 0;
  
  const topOPDs = useMemo(() => {
    if (progress.length === 0) return [];
    return [...progress]
      .map(p => {
        const total = (p.todayPenyediaPagu || 0) + (p.todaySwakelolaPagu || 0) + (p.todayPdSPagu || 0);
        return {
          name: opds.find(o => o.id === p.opdId)?.name || 'Unknown',
          percent: (total / (p.paguTarget || 1)) * 100
        };
      })
      .sort((a, b) => b.percent - a.percent)
      .slice(0, 5);
  }, [progress, opds]);

  return (
    <div className={`min-h-screen flex flex-col relative transition-all duration-500 ${activeView === 'login' || activeView === 'tv' ? 'bg-[#020617]' : 'bg-slate-50'}`}>
      
      {/* TV MONITOR OVERLAY (MODAL FULL SCREEN) */}
      {activeView === 'tv' && (
        <div className="fixed inset-0 z-[9999] bg-[#020617] text-white flex flex-col p-8 space-y-8 animate-in fade-in duration-700 overflow-hidden">
            <button 
              onClick={() => setActiveView('login')} 
              className="absolute top-6 left-6 p-4 bg-white/5 hover:bg-white/20 rounded-full text-white/40 hover:text-white transition-all z-[10000] no-print"
            >
              <X size={28} />
            </button>

            {/* TV HEADER */}
            <div className="flex items-center justify-between border-b border-white/5 pb-8 shrink-0">
              <div className="flex items-center gap-8 ml-20">
                <div className="bg-[#d9534f] p-6 rounded-[2rem] shadow-2xl shadow-red-900/50">
                  <ShieldCheck size={56} className="text-white" />
                </div>
                <div>
                  <h1 className="text-6xl font-black tracking-tighter uppercase italic leading-none">
                    DASHBOARD <span className="text-[#d9534f]">EKSEKUTIF</span>
                  </h1>
                  <p className="text-slate-500 font-black uppercase tracking-[0.5em] text-sm mt-4 flex items-center gap-3">
                    <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
                    Live Monitoring SiRUP NTB 2026
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-16 text-right">
                <div className="flex flex-col items-end">
                   <span className="text-slate-500 font-bold uppercase text-xs tracking-[0.3em] mb-2">HARI & TANGGAL</span>
                   <div className="text-4xl font-black text-slate-200 uppercase tracking-tight">
                     {time.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                   </div>
                </div>
                <div className="w-[1px] h-24 bg-white/10"></div>
                <div className="flex flex-col items-end">
                   <span className="text-slate-500 font-bold uppercase text-xs tracking-[0.3em] mb-2">WAKTU (WITA)</span>
                   <div className="text-7xl font-black text-white tabular-nums flex items-center gap-5">
                     <Clock size={48} className="text-emerald-500" />
                     {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                   </div>
                </div>
              </div>
            </div>

            {/* TV STATS */}
            <div className="grid grid-cols-4 gap-8 shrink-0">
              <StatCardTV label="Capaian Provinsi" value={formatPercent(avgPercent)} sub="Total RUP Terumumkan" icon={<Percent size={32}/>} color="emerald" />
              <StatCardTV label="Pagu Terinput" value={`Rp ${formatCurrencyMillions(totalPaguTerinput)} Jt`} sub={`Target: ${formatCurrencyMillions(totalPaguMurni)} Jt`} icon={<TrendingUp size={32}/>} color="blue" />
              <StatCardTV label="Volume Paket" value={totalPaket.toLocaleString('id-ID')} sub="Total Pen + Swa + PdS" icon={<Package size={32}/>} color="indigo" />
              <StatCardTV label="OPD Tuntas (100%)" value={`${progress.filter(p => Math.round(((p.todayPenyediaPagu + p.todaySwakelolaPagu + p.todayPdSPagu) / (p.paguTarget || 1)) * 100) >= 100).length} OPD`} sub="Telah menyelesaikan input RUP" icon={<Award size={32}/>} color="amber" />
            </div>

            {/* TV MAIN CONTENT */}
            <div className="flex-1 min-h-0 flex gap-8 overflow-hidden">
              {/* Leaderboard */}
              <div className="w-1/3 flex flex-col space-y-6">
                <div className="bg-slate-900/50 border border-white/5 p-10 rounded-[3.5rem] flex-1">
                  <h3 className="text-2xl font-black uppercase tracking-widest text-slate-400 mb-12 flex items-center gap-4">
                    <Award className="text-amber-500" size={32} /> TOP 5 TERTINGGI
                  </h3>
                  <div className="space-y-12">
                    {topOPDs.map((item, idx) => (
                      <div key={idx} className="space-y-5">
                        <div className="flex justify-between items-end">
                          <span className="text-lg font-black text-slate-300 uppercase truncate max-w-[280px]">{item.name}</span>
                          <span className="text-4xl font-black text-white tabular-nums">{Math.round(item.percent)}%</span>
                        </div>
                        <div className="h-5 bg-white/5 rounded-full overflow-hidden p-1 border border-white/5">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${item.percent >= 100 ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]' : 'bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]'}`} 
                            style={{ width: `${Math.min(item.percent, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-[#d9534f]/20 to-transparent border border-[#d9534f]/20 p-8 rounded-[3rem] shrink-0">
                   <h4 className="font-black text-[#d9534f] uppercase tracking-widest text-sm mb-3">Sistem Pengawasan</h4>
                   <p className="text-slate-300 text-base leading-relaxed italic">
                     Data diperbarui secara realtime dari database sinkronisasi SiRUP LKPP Pemerintah Provinsi NTB.
                   </p>
                </div>
              </div>

              {/* Scrolling List */}
              <div className="flex-1 bg-slate-900/50 border border-white/5 rounded-[3.5rem] flex flex-col overflow-hidden relative shadow-inner">
                 <div className="absolute top-0 left-0 right-0 h-24 bg-slate-900/95 backdrop-blur-xl z-10 flex items-center px-12 border-b border-white/10">
                    <div className="grid grid-cols-12 w-full text-sm font-black uppercase tracking-[0.3em] text-slate-500">
                       <div className="col-span-1">No</div>
                       <div className="col-span-7">Satuan Kerja</div>
                       <div className="col-span-2 text-right">Pagu Target</div>
                       <div className="col-span-2 text-right">Progres</div>
                    </div>
                 </div>
                 <div ref={scrollRef} className="flex-1 overflow-y-auto pt-24 px-12 no-scrollbar scroll-smooth">
                    <div className="divide-y divide-white/5">
                      {progress.length > 0 ? progress.map((item, idx) => {
                        const opd = opds.find(o => o.id === item.opdId);
                        const total = (item.todayPenyediaPagu || 0) + (item.todaySwakelolaPagu || 0) + (item.todayPdSPagu || 0);
                        const pct = (total / (item.paguTarget || 1)) * 100;
                        return (
                          <div key={item.opdId} className="grid grid-cols-12 w-full py-8 items-center hover:bg-white/5 transition-colors">
                            <div className="col-span-1 text-slate-600 font-black text-base">{idx + 1}</div>
                            <div className="col-span-7 font-black text-slate-200 uppercase text-base truncate pr-8">{opd?.name}</div>
                            <div className="col-span-2 text-right text-slate-400 font-black text-base tabular-nums">Rp {formatCurrencyMillions(item.paguTarget)} Jt</div>
                            <div className="col-span-2 text-right">
                               <span className={`px-6 py-2.5 rounded-2xl font-black text-base tabular-nums ${getStatusBgClass(pct)}`}>
                                 {Math.round(pct)}%
                               </span>
                            </div>
                          </div>
                        );
                      }) : <div className="p-20 text-center text-slate-500 font-black uppercase tracking-widest">Memuat Data Progres...</div>}
                    </div>
                 </div>
                 <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none z-10"></div>
              </div>
            </div>

            {/* TV FOOTER (RUNNING TEXT) */}
            <div className="h-20 bg-slate-900 border border-white/10 rounded-[2rem] flex items-center overflow-hidden shrink-0">
               <div className="bg-[#d9534f] h-full flex items-center px-12 font-black uppercase tracking-widest text-white skew-x-[-20deg] -ml-8 pr-16 z-20 relative shadow-2xl">
                  <span className="skew-x-[20deg] flex items-center gap-5 text-xl">
                    <ArrowUpRight size={28} /> RUNNING INFO
                  </span>
               </div>
               <div className="flex-1 flex items-center overflow-hidden">
                  <div className="animate-marquee whitespace-nowrap flex items-center gap-20 font-black text-2xl text-slate-100 italic">
                     {news.length > 0 ? news.map((n, i) => (
                       <span key={i} className="flex items-center gap-8 uppercase tracking-widest">
                          <span className="w-4 h-4 bg-[#d9534f] rounded-full"></span>
                          {n.title}: {n.excerpt.substring(0, 150)}...
                       </span>
                     )) : <span>SISTEM MONITORING SiRUP NTB 2026 - BIRO PENGADAAN BARANG DAN JASA</span>}
                     {news.map((n, i) => (
                       <span key={`dup-${i}`} className="flex items-center gap-8 uppercase tracking-widest">
                          <span className="w-4 h-4 bg-[#d9534f] rounded-full"></span>
                          {n.title}: {n.excerpt.substring(0, 150)}...
                       </span>
                     ))}
                  </div>
               </div>
            </div>
        </div>
      )}

      {/* LOGIN & PUBLIC CONTENT */}
      {activeView !== 'tv' && (
        <>
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center" 
            style={{ 
              backgroundImage: 'url("https://storage.ntbprov.go.id/biropbj/media/kantor-gubernur-ntb.jpg")', 
              filter: activeView === 'login' ? 'brightness(0.25) blur(4px)' : 'brightness(1) opacity(0.04)' 
            }} 
          />
          
          <nav className={`h-[80px] flex items-center justify-between px-10 shrink-0 z-50 border-b relative transition-all ${activeView === 'login' ? 'bg-black/40 backdrop-blur-2xl text-white border-white/10' : 'bg-slate-900 text-white border-slate-800'}`}>
            <div className="flex items-center h-full">
              <div className="bg-[#d9534f] h-full px-10 flex items-center skew-x-[-15deg] -ml-10 mr-12 cursor-pointer hover:bg-red-700 transition-all shadow-xl" onClick={() => setActiveView('login')}>
                <div className="skew-x-[15deg] font-black text-3xl tracking-tighter italic">SiRUP <span className="text-white/60">NTB</span></div>
              </div>
              <div className="hidden lg:flex items-center gap-10 text-xs font-black uppercase tracking-[0.25em] text-slate-400">
                <button onClick={() => setActiveView('rekap')} className={`hover:text-white transition-all py-2 border-b-4 ${activeView === 'rekap' ? 'text-white border-[#d9534f]' : 'border-transparent'}`}>Rekap Progres</button>
                <button onClick={() => setActiveView('tv')} className="hover:text-white transition-all py-2 flex items-center gap-2 group"><Monitor size={18} className="text-[#d9534f] group-hover:scale-125 transition-transform" /> TV Monitor</button>
                <button onClick={() => setActiveView('berita')} className={`hover:text-white transition-all py-2 border-b-4 ${activeView === 'berita' ? 'text-white border-[#d9534f]' : 'border-transparent'}`}>Pengumuman</button>
                <button onClick={() => setActiveView('kontak')} className={`hover:text-white transition-all py-2 border-b-4 ${activeView === 'kontak' ? 'text-white border-[#d9534f]' : 'border-transparent'}`}>Bantuan</button>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setActiveView('login')} 
                className="bg-[#d9534f] text-white px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-red-900/40 active:scale-95 transition-all hover:bg-red-700"
              >
                MASUK ADMIN
              </button>
            </div>
          </nav>

          <main className="flex-1 overflow-y-auto relative z-10 px-8 pt-16 pb-24 flex flex-col items-center custom-scrollbar">
            
            {activeView === 'login' && (
              <div className="w-full max-w-[460px] mt-16 animate-in zoom-in-95 duration-500">
                <div className="bg-black/70 backdrop-blur-3xl p-14 rounded-[3.5rem] border border-white/10 shadow-2xl relative overflow-hidden ring-1 ring-white/10">
                  <div className="absolute -top-10 -right-10 p-4 opacity-5 pointer-events-none"><ShieldCheck size={240} /></div>
                  <h2 className="text-5xl font-black text-white text-center mb-12 tracking-tight italic">LOG <span className="text-[#d9534f]">IN</span></h2>
                  {error && <div className="mb-8 p-5 bg-red-500/20 border border-red-500/30 text-white text-xs font-bold text-center rounded-2xl animate-pulse">{error}</div>}
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] ml-2">Username Administrator</label>
                       <input type="text" required placeholder="USERNAME" className="w-full px-8 py-6 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:bg-white/10 focus:border-[#d9534f] transition-all font-black text-lg tracking-wider" value={username} onChange={(e) => setUsername(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] ml-2">Kata Sandi Sistem</label>
                       <div className="relative">
                         <input type={showPassword ? "text" : "password"} required placeholder="PASSWORD" className="w-full px-8 py-6 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:bg-white/10 focus:border-[#d9534f] transition-all font-black text-lg tracking-wider" value={password} onChange={(e) => setPassword(e.target.value)} />
                         <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors">{showPassword ? <EyeOff size={24} /> : <Eye size={24} />}</button>
                       </div>
                    </div>
                    <button type="submit" className="w-full bg-[#d9534f] text-white py-6 rounded-2xl font-black text-2xl hover:bg-red-700 shadow-2xl shadow-red-950 transition-all active:scale-95 mt-6 border-b-4 border-red-900">MASUK Sesi</button>
                  </form>
                </div>
                
                <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-6">
                    <button onClick={() => setActiveView('rekap')} className="px-10 py-4 bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-3xl text-xs font-black hover:bg-white/15 transition-all uppercase tracking-[0.2em] shadow-lg">Data Monitoring</button>
                    <button onClick={() => setActiveView('tv')} className="px-10 py-4 bg-[#d9534f]/10 backdrop-blur-md border border-[#d9534f]/20 text-white rounded-3xl text-xs font-black hover:bg-[#d9534f]/25 transition-all uppercase tracking-[0.2em] flex items-center gap-3 shadow-lg"><Monitor size={18} className="text-[#d9534f]" /> Buka TV Monitor</button>
                </div>
              </div>
            )}

            {activeView === 'rekap' && (
              <div className="w-full max-w-7xl animate-in slide-in-from-bottom-12 duration-700">
                <div className="text-center mb-20">
                  <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-6 uppercase italic">REKAPITULASI PROGRES <span className="text-[#d9534f]">SiRUP NTB</span></h1>
                  <div className="inline-block px-12 py-3.5 bg-slate-900 text-white font-black text-sm rounded-[1.5rem] shadow-2xl tracking-[0.1em]">{getCurrentTimestamp()}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-20">
                  <StatCardPublic title="Pagu Terumumkan" value={`Rp ${formatCurrencyMillions(totalPaguTerinput)} Jt`} sub={`Pagu Murni: ${formatCurrencyMillions(totalPaguMurni)} Jt`} color="blue" />
                  <StatCardPublic title="Volume Paket" value={totalPaket.toLocaleString('id-ID')} sub="Penyedia + Swakelola + PdS" color="indigo" />
                  <StatCardPublic title="Progres Wilayah" value={formatPercent(avgPercent)} sub="Capaian Input Provinsi" color="emerald" />
                  <StatCardPublic title="Atensi Pimpinan" value={`${progress.filter(p => Math.round(((p.todayPenyediaPagu + p.todaySwakelolaPagu + p.todayPdSPagu) / (p.paguTarget || 1)) * 100) <= 50).length} SKPD`} sub="Progres di bawah 50%" color="rose" />
                </div>

                <div className="bg-white rounded-[3.5rem] shadow-2xl border border-slate-200 overflow-hidden">
                  <div className="p-10 border-b flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Filter Satker</span>
                      <div className="relative w-96">
                        <input type="text" placeholder="Ketik nama SKPD..." className="w-full pl-6 pr-14 py-4 border border-slate-200 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-[#d9534f]/10 font-black text-slate-800 tracking-tight" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        <Search size={22} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" />
                      </div>
                    </div>
                    <div className="flex items-center gap-4 font-black text-xs text-slate-400">
                      TAMPILKAN
                      <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-black text-slate-900">
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                      BARIS
                    </div>
                  </div>
                  <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-[#FFC000] text-slate-900 font-black uppercase text-center border-b border-slate-400">
                          <th rowSpan={3} className="p-5 border-r border-slate-400 w-16">No</th>
                          <th rowSpan={3} className="p-5 border-r border-slate-400 min-w-[360px] text-left">Nama Satuan Kerja</th>
                          <th rowSpan={3} className="p-5 border-r border-slate-400 w-36">Pagu Target (Jt)</th>
                          <th colSpan={8} className="p-5 border-r border-slate-400 bg-[#00B0F0] text-white">TERUMUMKAN DI SiRUP</th>
                          <th rowSpan={3} className="p-5 bg-[#00B0F0] text-white">PROGRES (%)</th>
                        </tr>
                        <tr className="bg-[#FFC000] text-center border-b border-slate-400">
                          <th colSpan={2} className="p-3 border-r border-slate-400">PENYEDIA</th>
                          <th colSpan={2} className="p-3 border-r border-slate-400">SWAKELOLA</th>
                          <th colSpan={2} className="p-3 border-r border-slate-400">PdS</th>
                          <th colSpan={2} className="p-3 border-r border-slate-400 bg-white/10">TOTAL</th>
                        </tr>
                        <tr className="bg-[#FFC000] text-[11px] text-center font-black">
                          <th className="p-2 border-r border-slate-400">PKT</th><th className="p-2 border-r border-slate-400">PAGU</th>
                          <th className="p-2 border-r border-slate-400">PKT</th><th className="p-2 border-r border-slate-400">PAGU</th>
                          <th className="p-2 border-r border-slate-400">PKT</th><th className="p-2 border-r border-slate-400">PAGU</th>
                          <th className="p-2 border-r border-slate-400">PKT</th><th className="p-2 border-r border-slate-400">PAGU</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedData.map((item, idx) => {
                          const opd = opds.find(o => o.id === item.opdId);
                          const totalPkt = (item.todayPenyediaPaket || 0) + (item.todaySwakelolaPaket || 0) + (item.todayPdSPaket || 0);
                          const totalPagu = (item.todayPenyediaPagu || 0) + (item.todaySwakelolaPagu || 0) + (item.todayPdSPagu || 0);
                          const pct = (totalPagu / (item.paguTarget || 1)) * 100;
                          return (
                            <tr key={item.opdId} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                              <td className="p-5 text-center font-black text-slate-300">{(currentPage-1)*pageSize+idx+1}</td>
                              <td className="p-5 font-black text-slate-800 uppercase tracking-tight text-base leading-tight">{opd?.name}</td>
                              <td className="p-5 text-right font-black text-blue-600 tabular-nums">{formatReportNumber(item.paguTarget)}</td>
                              <td className="p-5 text-center font-bold">{item.todayPenyediaPaket}</td><td className="p-5 text-right tabular-nums">{formatReportNumber(item.todayPenyediaPagu)}</td>
                              <td className="p-5 text-center font-bold">{item.todaySwakelolaPaket}</td><td className="p-5 text-right tabular-nums">{formatReportNumber(item.todaySwakelolaPagu)}</td>
                              <td className="p-5 text-center font-bold">{item.todayPdSPaket}</td><td className="p-5 text-right tabular-nums">{formatReportNumber(item.todayPdSPagu)}</td>
                              <td className="p-5 text-center font-black">{totalPkt}</td><td className="p-5 text-right font-black tabular-nums">{formatReportNumber(totalPagu)}</td>
                              <td className={`p-5 text-center font-black tabular-nums ${getStatusBgClass(pct)}`}>{formatReportDecimal(pct)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Pagination */}
                  <div className="p-10 border-t flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="text-sm font-black text-slate-400 uppercase tracking-widest">Showing {filteredProgress.length === 0 ? 0 : (currentPage-1)*pageSize+1} to {Math.min(currentPage*pageSize, filteredProgress.length)} of {filteredProgress.length} entries</div>
                    <div className="flex items-center gap-2">
                       <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="px-5 py-3 border rounded-xl font-black text-xs uppercase disabled:opacity-30">First</button>
                       <button onClick={() => setCurrentPage(prev => Math.max(1, prev-1))} disabled={currentPage === 1} className="px-5 py-3 border rounded-xl font-black text-xs uppercase disabled:opacity-30">Prev</button>
                       <div className="flex items-center gap-1 px-4 font-black text-sm">Page {currentPage} of {Math.max(1, Math.ceil(filteredProgress.length/pageSize))}</div>
                       <button onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredProgress.length/pageSize), prev+1))} disabled={currentPage >= Math.ceil(filteredProgress.length/pageSize)} className="px-5 py-3 border rounded-xl font-black text-xs uppercase disabled:opacity-30">Next</button>
                       <button onClick={() => setCurrentPage(Math.ceil(filteredProgress.length/pageSize))} disabled={currentPage >= Math.ceil(filteredProgress.length/pageSize)} className="px-5 py-3 border rounded-xl font-black text-xs uppercase disabled:opacity-30">Last</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Berita, Kontak, dll - Tambahan sesuai kebutuhan jika perlu diaktifkan */}

          </main>
        </>
      )}
    </div>
  );
};

const StatCardPublic: React.FC<{ title: string, value: string, sub: string, color: string }> = ({ title, value, sub, color }) => {
  const colors: Record<string, string> = { 
    blue: 'bg-blue-50 text-blue-600 border-blue-100', 
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100', 
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100', 
    rose: 'bg-rose-50 text-rose-600 border-rose-100' 
  };
  return (
    <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-200 flex items-center gap-8 group hover:translate-y-[-5px] transition-all">
      <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center border shadow-inner ${colors[color]}`}><Award size={40} /></div>
      <div>
        <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-2">{title}</p>
        <h4 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h4>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">{sub}</p>
      </div>
    </div>
  );
};

const StatCardTV: React.FC<{ label: string, value: string, sub: string, icon: React.ReactNode, color: string }> = ({ label, value, sub, icon, color }) => {
  const colors: Record<string, string> = {
    emerald: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500',
    blue: 'border-blue-500/20 bg-blue-500/10 text-blue-500',
    indigo: 'border-indigo-500/20 bg-indigo-500/10 text-indigo-500',
    amber: 'border-amber-500/20 bg-amber-500/10 text-amber-500',
  };
  return (
    <div className={`p-12 rounded-[3.5rem] border backdrop-blur-3xl shadow-2xl relative overflow-hidden group transition-all hover:bg-white/[0.08] ${colors[color]}`}>
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-15 transition-opacity translate-x-4 -translate-y-4">{icon}</div>
      <div className="relative z-10">
        <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-xs mb-5">{label}</p>
        <h4 className="text-6xl font-black tracking-tighter text-white mb-4 tabular-nums">{value}</h4>
        <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">{sub}</p>
      </div>
    </div>
  );
};

export default Login;
