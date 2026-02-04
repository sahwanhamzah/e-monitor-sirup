
import React, { useState, useMemo } from 'react';
import { LogIn, User as UserIcon, Eye, EyeOff, Calendar, ChevronDown, Search, TrendingUp, Package, Percent, AlertCircle, Newspaper, Phone, Mail, MapPin, ExternalLink, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { OPD, ProgressData, NewsItem } from '../types';
import { formatReportNumber, formatReportDecimal, getStatusBgClass, getCurrentTimestamp, formatCurrencyMillions, formatPercent } from '../utils';

interface LoginProps {
  onLogin: (username: string, password: string) => void;
  error?: string | null;
  opds: OPD[];
  progress: ProgressData[];
  news: NewsItem[];
}

type ViewState = 'login' | 'rekap' | 'berita' | 'kontak';

const Login: React.FC<LoginProps> = ({ onLogin, error, opds, progress, news }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeView, setActiveView] = useState<ViewState>('login');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination State
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  // Filter & Pagination Logic
  const filteredProgress = useMemo(() => {
    return progress.filter(p => {
      const opd = opds.find(o => o.id === p.opdId);
      return opd?.name.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [progress, opds, searchTerm]);

  const totalEntries = filteredProgress.length;
  const totalPages = Math.ceil(totalEntries / pageSize);
  
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProgress.slice(start, start + pageSize);
  }, [filteredProgress, currentPage, pageSize]);

  const startEntry = totalEntries === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endEntry = Math.min(currentPage * pageSize, totalEntries);

  // Reset pagination when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, pageSize]);

  // Kalkulasi Data Dashboard Publik
  const totalPaguMurni = opds.reduce((acc, curr) => acc + curr.paguMurni, 0);
  const totalPaguTerinput = progress.reduce((acc, curr) => 
    acc + curr.todayPenyediaPagu + curr.todaySwakelolaPagu + curr.todayPdSPagu, 0
  );
  const totalPaket = progress.reduce((acc, curr) => 
    acc + curr.todayPenyediaPaket + curr.todaySwakelolaPaket + curr.todayPdSPaket, 0
  );
  const avgPercent = totalPaguMurni > 0 ? (totalPaguTerinput / totalPaguMurni) * 100 : 0;
  const criticalCount = progress.filter(p => {
    const totalPaguRow = p.todaySwakelolaPagu + p.todayPenyediaPagu + p.todayPdSPagu;
    const pct = (totalPaguRow / (p.paguTarget || 1) * 100);
    return Math.round(pct) <= 50;
  }).length;

  // Pagination Pages Generator
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className={`min-h-screen font-sans flex flex-col relative overflow-hidden transition-colors duration-500 ${activeView === 'login' ? 'bg-slate-900' : 'bg-slate-50'}`}>
      
      {/* Background Image: Only shown during login */}
      {activeView === 'login' && (
        <>
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center animate-in fade-in duration-1000"
            style={{ 
              backgroundImage: 'url("https://storage.ntbprov.go.id/biropbj/media/kantor-gubernur-ntb.jpg")',
              filter: 'brightness(0.35) saturate(0.8)'
            }}
          />
          <div className="absolute inset-0 z-[1] opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        </>
      )}

      {/* Content Wrapper */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Navbar Atas */}
        <nav className={`h-[60px] flex items-center justify-between px-6 shrink-0 shadow-xl border-b sticky top-0 z-50 transition-all ${activeView === 'login' ? 'bg-black/60 backdrop-blur-xl text-white border-white/5' : 'bg-slate-900 text-white border-slate-800'}`}>
          <div className="flex items-center h-full">
            <div className="bg-[#d9534f] h-full px-6 flex items-center skew-x-[-20deg] -ml-6 mr-8 cursor-pointer group hover:bg-red-700 transition-colors" onClick={() => setActiveView('login')}>
              <div className="skew-x-[20deg] flex items-center gap-2">
                <span className="font-black text-2xl tracking-tighter">SiRUP</span>
                <div className="w-5 h-5 bg-white/20 rounded flex items-center justify-center group-hover:scale-110 transition-transform">
                  <div className="w-0 h-0 border-l-[8px] border-l-white border-y-[5px] border-y-transparent ml-0.5"></div>
                </div>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-8 text-[14px] font-bold text-slate-300">
              <button onClick={() => setActiveView('rekap')} className={`hover:text-white transition-all py-2 px-1 relative ${activeView === 'rekap' ? 'text-white' : ''}`}>
                Rekap Progres
                {activeView === 'rekap' && <span className="absolute bottom-[-14px] left-0 right-0 h-1 bg-[#d9534f] rounded-full"></span>}
              </button>
              <a 
                href="https://sirup.inaproc.id/sirup/rekap/klpd/D301" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white transition-all py-2 px-1 flex items-center gap-1.5"
              >
                Rekap RUP NTB
                <ExternalLink size={14} className="opacity-60" />
              </a>
              <button onClick={() => setActiveView('berita')} className={`hover:text-white transition-all py-2 px-1 relative ${activeView === 'berita' ? 'text-white' : ''}`}>
                Pengumuman
                {activeView === 'berita' && <span className="absolute bottom-[-14px] left-0 right-0 h-1 bg-[#d9534f] rounded-full"></span>}
              </button>
              <button onClick={() => setActiveView('kontak')} className={`hover:text-white transition-all py-2 px-1 relative ${activeView === 'kontak' ? 'text-white' : ''}`}>
                Kontak Kami
                {activeView === 'kontak' && <span className="absolute bottom-[-14px] left-0 right-0 h-1 bg-[#d9534f] rounded-full"></span>}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-8 text-[14px]">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${activeView === 'login' ? 'text-slate-300 bg-white/10 border-white/5' : 'text-slate-400 bg-slate-800 border-slate-700'}`}>
              <Calendar size={16} />
              <span className="font-bold">TA 2026</span>
            </div>
            <button 
              onClick={() => setActiveView('login')}
              className={`flex items-center gap-2 font-black tracking-widest uppercase transition-all px-4 py-2 rounded-xl ${activeView === 'login' ? 'bg-[#d9534f] text-white shadow-lg shadow-red-900/50' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
            >
              <UserIcon size={18} />
              Login
            </button>
          </div>
        </nav>

        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col items-center ${activeView === 'login' ? 'justify-start pt-16' : 'justify-start pt-12'} px-4 overflow-y-auto custom-scrollbar pb-12`}>
          
          {/* VIEW: LOGIN */}
          {activeView === 'login' && (
            <>
              <div className="flex flex-col items-center mb-12 animate-in fade-in slide-in-from-top-4 duration-1000">
                <div className="flex items-center gap-1 drop-shadow-2xl mb-4">
                  <span className="text-7xl font-black text-white tracking-tighter">Si</span>
                  <span className="text-7xl font-black text-[#d9534f] tracking-tighter">RUP</span>
                  <div className="bg-[#d9534f] w-12 h-12 flex items-center justify-center rounded-lg mt-4 ml-1 shadow-2xl shadow-red-900/40">
                    <div className="w-0 h-0 border-l-[14px] border-l-white border-y-[10px] border-y-transparent ml-1"></div>
                  </div>
                </div>
                <div className="px-8 py-3 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl">
                  <p className="text-white text-[15px] font-black tracking-[0.2em] uppercase text-center flex items-center gap-3">
                    <span className="w-8 h-[2px] bg-[#d9534f]"></span>
                    Monitoring Progres NTB
                    <span className="w-8 h-[2px] bg-[#d9534f]"></span>
                  </p>
                </div>
              </div>

              <div className="w-full max-w-[460px] bg-white/75 backdrop-blur-2xl rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] p-12 flex flex-col items-center mb-8 border border-white/30 animate-in zoom-in-95 duration-700 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-blue-500/20 transition-colors"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-500/10 rounded-full -ml-16 -mb-16 blur-3xl group-hover:bg-red-500/20 transition-colors"></div>

                <div className="w-28 h-28 bg-slate-900 rounded-[2rem] flex items-center justify-center mb-10 shadow-2xl -rotate-6 group-hover:rotate-0 transition-all duration-700 border border-slate-700 p-4 relative">
                  <img 
                    src="https://storage.ntbprov.go.id/biropbj/media/logo.png" 
                    alt="Logo NTB" 
                    className="w-full h-full object-contain filter drop-shadow-lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 rounded-[2rem]"></div>
                </div>

                <div className="text-center mb-10">
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Login Pengelola</h2>
                  <p className="text-slate-600 text-sm font-bold uppercase tracking-widest opacity-60">Akses Terbatas Internal</p>
                </div>

                {error && (
                  <div className="w-full mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-700 text-xs font-black text-center rounded-2xl animate-pulse backdrop-blur-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="w-full space-y-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Username</label>
                    <div className="relative">
                      <input 
                        type="text" required placeholder="Masukkan Nama Pengguna"
                        className="w-full pl-5 pr-3 py-4 bg-white/50 border border-slate-300/50 rounded-2xl focus:ring-4 focus:ring-red-500/20 focus:border-[#d9534f] outline-none text-sm font-bold text-slate-800 transition-all shadow-sm"
                        value={username} onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Kata Sandi</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} required placeholder="············"
                        className="w-full pl-5 pr-12 py-4 bg-white/50 border border-slate-300/50 rounded-2xl focus:ring-4 focus:ring-red-500/20 focus:border-[#d9534f] outline-none text-sm font-bold text-slate-800 transition-all shadow-sm"
                        value={password} onChange={(e) => setPassword(e.target.value)}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-[#d9534f] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-900/30 active:scale-95 transform mt-4 border border-red-400/20">
                    Akses Sistem
                  </button>
                </form>
              </div>
            </>
          )}

          {/* VIEW: REKAP PUBLIK (WHITE BACKGROUND) */}
          {activeView === 'rekap' && (
            <div className="w-full max-w-7xl animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
              <div className="text-center mb-10">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">DATA REALTIME PROGRES RUP PROVINSI NTB</h1>
                <div className="bg-[#d9534f] text-white inline-block px-6 py-2 mt-4 font-black text-sm rounded-xl shadow-lg border border-red-400/30">
                  {getCurrentTimestamp()}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <StatBox title="Total Pagu Terinput" value={`Rp ${formatCurrencyMillions(totalPaguTerinput)} Jt`} icon={<TrendingUp size={24}/>} color="blue" isLight />
                <StatBox title="Total Paket" value={totalPaket.toLocaleString('id-ID')} icon={<Package size={24}/>} color="indigo" isLight />
                <StatBox title="Rata-rata Progres" value={formatPercent(avgPercent)} icon={<Percent size={24}/>} color="emerald" isLight />
                <StatBox title="OPD Perlu Atensi" value={`${criticalCount} SKPD`} icon={<AlertCircle size={24}/>} color="rose" isLight />
              </div>

              <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                {/* Header Tabel ala DataTables (Gambar 2) */}
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    Tampilkan 
                    <select 
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                      className="mx-1 px-2 py-1.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500/20 transition-all cursor-pointer bg-white"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    entri
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
                    Cari:
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="..." 
                        className="pl-3 pr-10 py-1.5 border border-slate-300 rounded-lg outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-400 transition-all shadow-sm w-full md:w-64"
                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                      />
                      <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-[11px] border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-[#FFC000] text-slate-900 text-center font-black uppercase">
                        <th rowSpan={3} className="border border-slate-400 p-4 w-12">No</th>
                        <th rowSpan={3} className="border border-slate-400 p-4 min-w-[320px] text-left">Satuan Kerja</th>
                        <th rowSpan={3} className="border border-slate-400 p-4 w-32">Pagu Pengadaan</th>
                        <th colSpan={8} className="border border-slate-400 p-4 bg-[#00B0F0] text-white">TERUMUMKAN DI SIRUP</th>
                        <th rowSpan={3} className="border border-slate-400 p-4 w-28 bg-[#00B0F0] text-white">Persentase Sebelumnya</th>
                        <th rowSpan={3} className="border border-slate-400 p-4 w-28 bg-[#00B0F0] text-white">Persentase Hari Ini</th>
                      </tr>
                      <tr className="bg-[#FFC000] text-slate-900 text-center font-black uppercase border-b border-slate-400">
                        <th colSpan={2} className="border border-slate-400 p-2">Penyedia</th>
                        <th colSpan={2} className="border border-slate-400 p-2">Swakelola</th>
                        <th colSpan={2} className="border border-slate-400 p-2">Penyedia Dlm Swa</th>
                        <th colSpan={2} className="border border-slate-400 p-2">Total</th>
                      </tr>
                      <tr className="bg-[#FFC000] text-slate-900 text-center font-black text-[9px] uppercase border-b border-slate-400">
                        <th className="border border-slate-400 p-2">Paket</th>
                        <th className="border border-slate-400 p-2">Pagu</th>
                        <th className="border border-slate-400 p-2">Paket</th>
                        <th className="border border-slate-400 p-2">Pagu</th>
                        <th className="border border-slate-400 p-2">Paket</th>
                        <th className="border border-slate-400 p-2">Pagu</th>
                        <th className="border border-slate-400 p-2">Pkt</th>
                        <th className="border border-slate-400 p-2">Pagu</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300">
                      {paginatedData.length > 0 ? paginatedData.map((item, index) => {
                        const opd = opds.find(o => o.id === item.opdId);
                        const totalPkt = item.todayPenyediaPaket + item.todaySwakelolaPaket + item.todayPdSPaket;
                        const totalPagu = item.todayPenyediaPagu + item.todaySwakelolaPagu + item.todayPdSPagu;
                        const pctToday = (totalPagu / (item.paguTarget || 1)) * 100;
                        const globalIndex = (currentPage - 1) * pageSize + index + 1;

                        return (
                          <tr key={item.opdId} className="hover:bg-slate-50 transition-colors group">
                            <td className="p-4 text-center font-black text-slate-400 border-r border-slate-300 group-hover:text-[#d9534f]">{globalIndex}</td>
                            <td className="p-4 font-bold text-slate-700 border-r border-slate-300">{opd?.name}</td>
                            <td className="p-4 text-right font-black text-blue-600 border-r border-slate-300">{formatReportNumber(item.paguTarget)}</td>
                            <td className="p-4 text-center border-r border-slate-300">{formatReportNumber(item.todayPenyediaPaket)}</td>
                            <td className="p-4 text-right border-r border-slate-300">{formatReportNumber(item.todayPenyediaPagu)}</td>
                            <td className="p-4 text-center border-r border-slate-300">{formatReportNumber(item.todaySwakelolaPaket)}</td>
                            <td className="p-4 text-right border-r border-slate-300">{formatReportNumber(item.todaySwakelolaPagu)}</td>
                            <td className="p-4 text-center border-r border-slate-300">{formatReportNumber(item.todayPdSPaket)}</td>
                            <td className="p-4 text-right border-r border-slate-300">{formatReportNumber(item.todayPdSPagu)}</td>
                            <td className="p-4 text-center font-black border-r border-slate-300">{formatReportNumber(totalPkt)}</td>
                            <td className="p-4 text-right font-black border-r border-slate-300">{formatReportNumber(totalPagu)}</td>
                            <td className={`p-4 text-center font-black border-r border-slate-300 ${getStatusBgClass(item.prevPercent)}`}>
                              {formatReportDecimal(item.prevPercent)}
                            </td>
                            <td className={`p-4 text-center font-black ${getStatusBgClass(pctToday)}`}>
                              {formatReportDecimal(pctToday)}
                            </td>
                          </tr>
                        );
                      }) : (
                        <tr>
                          <td colSpan={13} className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest bg-slate-50 italic border border-slate-300">Data tidak ditemukan...</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Footer Pagination ala DataTables (Gambar 1) */}
                <div className="p-6 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="text-sm font-medium text-slate-600">
                    Menampilkan {startEntry} sampai {endEntry} dari {totalEntries} entri
                  </div>
                  
                  <div className="flex items-center -space-x-px">
                    <button 
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-sm font-medium bg-white border border-slate-300 rounded-l-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Pertama
                    </button>
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-sm font-medium bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Sebelumnya
                    </button>
                    
                    {getPageNumbers().map(num => (
                      <button
                        key={num}
                        onClick={() => setCurrentPage(num)}
                        className={`px-4 py-2 text-sm font-bold border transition-all ${
                          currentPage === num 
                          ? 'bg-[#d9534f] border-[#d9534f] text-white z-10' 
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                    
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <span className="px-4 py-2 text-sm font-medium bg-white border border-slate-300 text-slate-500">...</span>
                    )}
                    
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className={`px-4 py-2 text-sm font-bold border ${
                          currentPage === totalPages ? 'bg-[#d9534f] text-white' : 'bg-white border-slate-300 text-slate-700'
                        }`}
                      >
                        {totalPages}
                      </button>
                    )}

                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="px-4 py-2 text-sm font-medium bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Selanjutnya
                    </button>
                    <button 
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="px-4 py-2 text-sm font-medium bg-white border border-slate-300 rounded-r-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Terakhir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: BERITA (WHITE BACKGROUND) */}
          {activeView === 'berita' && (
            <div className="w-full max-w-6xl animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 border-b border-slate-200 pb-8">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-[#d9534f] text-white rounded-3xl shadow-lg">
                    <Newspaper size={40} />
                  </div>
                  <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Pengumuman & Update</h1>
                    <p className="text-sm text-slate-500 font-bold uppercase tracking-[0.3em]">Informasi Terkini Biro Pengadaan</p>
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-2 px-6 py-2 bg-white rounded-full border border-slate-200 shadow-sm">
                   <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                   <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Sistem Publik Aktif</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {news.length > 0 ? news.map((newsItem) => (
                  <div key={newsItem.id} className="bg-white border border-slate-200 p-8 rounded-[2rem] shadow-md hover:shadow-xl hover:translate-y-[-8px] transition-all duration-500 group cursor-pointer relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-[#d9534f] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="flex justify-between items-start mb-6">
                      <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest ${
                        newsItem.tag === 'Penting' ? 'bg-rose-500 text-white shadow-lg shadow-rose-900/20' :
                        newsItem.tag === 'Kegiatan' ? 'bg-blue-500 text-white shadow-lg shadow-blue-900/20' :
                        newsItem.tag === 'Update' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/20' : 'bg-amber-500 text-white shadow-lg shadow-amber-900/20'
                      }`}>{newsItem.tag}</span>
                      <span className="text-xs text-slate-400 font-black tracking-tighter flex items-center gap-1.5">
                        <Calendar size={12} />
                        {newsItem.date}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-slate-800 mb-4 group-hover:text-[#d9534f] transition-colors leading-tight">{newsItem.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium line-clamp-4 mb-6">{newsItem.excerpt}</p>
                    <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                        Selengkapnya <ExternalLink size={14} className="text-[#d9534f]" />
                      </span>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full py-32 text-center text-slate-500 font-black uppercase tracking-widest bg-white border border-dashed border-slate-300 rounded-[3rem]">
                    Belum ada pengumuman baru untuk ditampilkan.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW: KONTAK (WHITE BACKGROUND) */}
          {activeView === 'kontak' && (
            <div className="w-full max-w-5xl animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
               <div className="text-center mb-16">
                  <h1 className="text-5xl font-black text-slate-900 mb-4">Layanan Bantuan</h1>
                  <p className="text-slate-500 font-bold uppercase tracking-[0.4em]">Biro Pengadaan Barang dan Jasa Provinsi NTB</p>
                  <div className="w-24 h-2 bg-[#d9534f] mx-auto mt-8 rounded-full shadow-lg shadow-red-900/20"></div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-10">
                     <ContactItem icon={<MapPin size={28} />} title="Kantor Pusat" text="Kantor Gubernur NTB, Jl. Pejanggik No. 12, Mataram, Nusa Tenggara Barat" color="blue" isLight />
                     <ContactItem icon={<Phone size={28} />} title="Hotline Monitoring" text="(0370) 6211234 • Senin - Jumat: 08:00 - 16:00 WITA" color="emerald" isLight />
                     <ContactItem icon={<Mail size={28} />} title="Surel Elektronik" text="biropbj@ntbprov.go.id • helpdesk.sirup@ntbprov.go.id" color="rose" isLight />
                  </div>

                  <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-200 space-y-8 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full -mr-12 -mt-12 blur-2xl"></div>
                     <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                       <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                         <AlertCircle size={28} />
                       </div>
                       <h3 className="text-2xl font-black text-slate-800">Helpdesk WA</h3>
                     </div>
                     <p className="text-slate-600 font-medium leading-relaxed">
                       Butuh bantuan teknis terkait penginputan RUP atau integrasi SIPD? Hubungi admin pendamping kami melalui WhatsApp.
                     </p>
                     <a 
                      href="https://wa.me/6281234567890" 
                      target="_blank" 
                      className="flex items-center justify-center gap-3 w-full bg-[#25D366] text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-[#1fae53] transition-all shadow-xl shadow-green-900/20 active:scale-95 transform border-b-4 border-green-700"
                     >
                       Chat WhatsApp Sekarang
                     </a>
                     <div className="flex items-center justify-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Pesan akan dibalas di jam kerja</p>
                     </div>
                  </div>
               </div>
            </div>
          )}

          <div className={`mt-auto py-8 text-center text-[11px] font-black uppercase tracking-[0.2em] max-w-2xl no-print ${activeView === 'login' ? 'text-slate-400 drop-shadow-lg' : 'text-slate-500'}`}>
            Sistem Informasi Monitoring Progres Rencana Umum Pengadaan <br/>
            Pemerintah Provinsi Nusa Tenggara Barat • Hak Cipta &copy; 2026
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const StatBox: React.FC<{ title: string, value: string, icon: React.ReactNode, color: string, isLight?: boolean }> = ({ title, value, icon, color, isLight }) => {
  const darkColors: Record<string, string> = {
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/20',
    indigo: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/20',
    emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20',
    rose: 'bg-rose-500/20 text-rose-400 border-rose-500/20',
  };

  const lightColors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
  };

  const bgClass = isLight ? 'bg-white border-slate-200 shadow-lg' : 'bg-black/40 backdrop-blur-md border-white/10 shadow-xl';
  const textTitleClass = isLight ? 'text-slate-500' : 'text-slate-400';
  const textValueClass = isLight ? 'text-slate-900' : 'text-white';

  return (
    <div className={`border p-6 rounded-[1.5rem] flex items-center gap-5 transition-all duration-300 ${bgClass}`}>
      <div className={`p-4 rounded-2xl border ${isLight ? lightColors[color] : darkColors[color]}`}>
        {icon}
      </div>
      <div>
        <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${textTitleClass}`}>{title}</p>
        <p className={`text-xl font-black tracking-tight ${textValueClass}`}>{value}</p>
      </div>
    </div>
  );
};

const ContactItem: React.FC<{ icon: React.ReactNode, title: string, text: string, color: string, isLight?: boolean }> = ({ icon, title, text, color, isLight }) => {
  const darkColors: Record<string, string> = {
    blue: 'bg-blue-500/20 text-blue-400',
    emerald: 'bg-emerald-500/20 text-emerald-400',
    rose: 'bg-rose-500/20 text-rose-400',
  };

  const lightColors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    rose: 'bg-rose-50 text-rose-600',
  };

  return (
    <div className="flex gap-6 group">
      <div className={`shrink-0 w-16 h-16 ${isLight ? lightColors[color] : darkColors[color]} rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div className="flex flex-col justify-center">
        <h3 className={`font-black text-xl mb-1 tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>{title}</h3>
        <p className={`text-sm font-medium leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{text}</p>
      </div>
    </div>
  );
};

export default Login;
