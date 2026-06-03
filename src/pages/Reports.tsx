import React, { useRef, useMemo, useState } from 'react';
import { useStore } from '../store';
import { formatIDR, cn } from '../lib/utils';
import { getCurrentCycle, getTransactionsInCycle, groupTransactionsByWeek, getPreviousCycle } from '../lib/cycleUtils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Download, FileText, ChevronDown, CheckCircle2, AlertTriangle, TrendingDown, Info, Calendar, Printer, X, FileSpreadsheet } from 'lucide-react';
import { generateProfessionalPdf, generateParentPdf, getReportCategory } from '../lib/pdfGenerator';

export function Reports() {
  const { state, user } = useStore();
  const { transactions, settings, bills } = state;
  const reportRef = useRef<HTMLDivElement>(null);
  
  const [showPdfModal, setShowPdfModal] = useState(false);

  const cycle = useMemo(() => getCurrentCycle(settings.cycleStartDate), [settings.cycleStartDate]);
  const prevCycle = useMemo(() => getPreviousCycle(settings.cycleStartDate), [settings.cycleStartDate]);
  
  const currentTxs = useMemo(() => getTransactionsInCycle(transactions, cycle.start, cycle.end), [transactions, cycle]);
  const prevTxs = useMemo(() => getTransactionsInCycle(transactions, prevCycle.start, prevCycle.end), [transactions, prevCycle]);
  
  const totalIncome = useMemo(() => currentTxs.filter(t => t.category === 'pemasukan').reduce((acc, t) => acc + t.amount, 0), [currentTxs]);
  const prevTotalIncome = useMemo(() => prevTxs.filter(t => t.category === 'pemasukan').reduce((acc, t) => acc + t.amount, 0), [prevTxs]);

  const totalSpent = useMemo(() => currentTxs.filter(t => t.category !== 'pemasukan').reduce((acc, t) => acc + t.amount, 0), [currentTxs]);
  const prevTotalSpent = useMemo(() => prevTxs.filter(t => t.category !== 'pemasukan').reduce((acc, t) => acc + t.amount, 0), [prevTxs]);
  
  const remaining = state.current_balance !== undefined ? state.current_balance : ((settings.allowanceAmount + totalIncome) - totalSpent);
  const daysPassed = cycle.daysTotal - cycle.daysRemaining;
  const avgPerDay = daysPassed > 0 ? totalSpent / daysPassed : 0;
  const safeAvgPerDay = cycle.daysRemaining > 0 ? remaining / cycle.daysRemaining : 0;
  const projectedDepletion = avgPerDay > 0 ? Math.floor(remaining / avgPerDay) : 999;
  
  const spendDiff = prevTotalSpent > 0 ? ((totalSpent - prevTotalSpent) / prevTotalSpent) * 100 : 0;
  
  const totalsByCategory = useMemo(() => currentTxs.filter(t => t.category !== 'pemasukan').reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>), [currentTxs]);

  const data = [
    { name: 'Wajib', value: totalsByCategory['wajib'] || 0, color: '#FFE66D' }, 
    { name: 'Fleksibel', value: totalsByCategory['fleksibel'] || 0, color: '#4ECDC4' }, 
    { name: 'Darurat', value: totalsByCategory['darurat'] || 0, color: '#1A1A1A' }, 
  ].filter(d => d.value > 0);

  const totalsByTag = useMemo(() => currentTxs.filter(t => t.category !== 'pemasukan').reduce((acc, t) => {
    const tag = t.tag || t.category;
    acc[tag] = (acc[tag] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>), [currentTxs]);
  
  const prevTotalsByTag = useMemo(() => prevTxs.filter(t => t.category !== 'pemasukan').reduce((acc, t) => {
    const tag = t.tag || t.category;
    acc[tag] = (acc[tag] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>), [prevTxs]);

  const tagData = Object.entries(totalsByTag)
    .map(([name, value]) => ({ 
      name, 
      value: value as number, 
      prevValue: (prevTotalsByTag[name] || 0) as number,
      diff: prevTotalsByTag[name] ? (( (value as number) - (prevTotalsByTag[name] as number) ) / (prevTotalsByTag[name] as number)) * 100 : 0
    }))
    .sort((a,b) => b.value - a.value);

  const weeklyData = useMemo(() => groupTransactionsByWeek(currentTxs, cycle.start), [currentTxs, cycle.start]);

  const currentMonthKey = new Date().toISOString().slice(0, 7);
  const unpaidBills = bills.filter(b => !(b.isPaid && b.lastPaidMonth === currentMonthKey));

  // Insights generation
  const insights = useMemo(() => {
    const items = [];
    
    // Bills insight
    if (bills.length > 0) {
      if (unpaidBills.length === 0) {
        items.push({ type: 'good', text: 'Semua tagihan bulan ini sudah lunas sebelum jatuh tempo.' });
      } else {
        items.push({ type: 'warning', text: `Ada ${unpaidBills.length} tagihan yang belum dibayar bulan ini.` });
      }
    }
    
    // Projection insight
    if (cycle.daysRemaining > 0 && remaining < 0) {
      items.push({ type: 'danger', text: 'Saldo sudah minus! Kurangi pengeluaran segera.' });
    } else if (remaining > 0 && projectedDepletion < cycle.daysRemaining) {
      items.push({ type: 'warning', text: `Dengan pola saat ini, saldo akan habis ${cycle.daysRemaining - projectedDepletion} hari sebelum kiriman tiba.` });
    } else if (remaining > 0 && projectedDepletion >= cycle.daysRemaining) {
      items.push({ type: 'good', text: 'Pola pengeluaran aman. Saldo cukup sampai kiriman berikutnya.' });
    }
    
    // Diff insight
    if (spendDiff > 20) {
      items.push({ type: 'danger', text: `Total pengeluaran naik ${spendDiff.toFixed(0)}% dibanding bulan lalu di periode yang sama.` });
    } else if (spendDiff < -10) {
      items.push({ type: 'good', text: `Super! Pengeluaran turun ${Math.abs(spendDiff).toFixed(0)}% dibanding bulan lalu.` });
    }
    
    return items;
  }, [remaining, projectedDepletion, cycle.daysRemaining, spendDiff, unpaidBills.length, bills.length]);

  const capitalizedUserName = useMemo(() => {
    const rawName = user?.displayName || user?.email?.split('@')[0] || 'Davin';
    return rawName.charAt(0).toUpperCase() + rawName.slice(1);
  }, [user]);

  const dateOptions = useMemo<Intl.DateTimeFormatOptions>(() => ({ day: '2-digit', month: 'long', year: 'numeric' }), []);
  
  const periodText = useMemo(() => {
    const startStr = cycle.start.toLocaleDateString('id-ID', dateOptions);
    const endStr = cycle.end.toLocaleDateString('id-ID', dateOptions);
    return `${startStr} - ${endStr}`;
  }, [cycle, dateOptions]);

  const dateCetakText = useMemo(() => {
    return new Date().toLocaleDateString('id-ID', dateOptions);
  }, [dateOptions]);

  const previewCategoriesMap = useMemo(() => {
    const categoriesMap: Record<string, number> = {
      'Makan': 0,
      'Kos': 0,
      'Transportasi': 0,
      'Pulsa & Internet': 0,
      'Top Up Game': 0,
      'Belanja': 0,
      'Lainnya': 0,
    };
    currentTxs.forEach((t) => {
      const matchedCategory = getReportCategory(t.category, t.tag || '');
      if (categoriesMap[matchedCategory] !== undefined) {
        categoriesMap[matchedCategory] += t.amount;
      } else {
        categoriesMap['Lainnya'] += t.amount;
      }
    });
    return categoriesMap;
  }, [currentTxs]);

  const highestTxAmount = useMemo(() => {
    return currentTxs.length > 0 ? Math.max(...currentTxs.map(t => t.amount)) : 0;
  }, [currentTxs]);

  const topCategoryName = useMemo(() => {
    let topName = '-';
    let topVal = 0;
    Object.entries(previewCategoriesMap).forEach(([name, val]) => {
      const value = val as number;
      if (value > topVal) {
        topVal = value;
        topName = name;
      }
    });
    return topName;
  }, [previewCategoriesMap]);

  const handleDownloadStandard = () => {
    try {
      const pdf = generateProfessionalPdf(state, currentTxs, capitalizedUserName, cycle);
      pdf.save(`Laporan_Keuangan_KosMate_${capitalizedUserName}_${new Date().toLocaleDateString('id-ID').replace(/\//g, '-')}.pdf`);
      setShowPdfModal(false);
    } catch (err) {
      console.error('Failed to generate PDF', err);
      alert('Gagal mengunduh laporan PDF.');
    }
  };

  const handleDownloadParent = () => {
    try {
      const pdf = generateParentPdf(state, currentTxs, capitalizedUserName, cycle);
      pdf.save(`Laporan_Keuangan_OrangTua_${capitalizedUserName}_${new Date().toLocaleDateString('id-ID').replace(/\//g, '-')}.pdf`);
      setShowPdfModal(false);
    } catch (err) {
      console.error('Failed to generate PDF', err);
      alert('Gagal mengunduh laporan PDF.');
    }
  };

  const handleDownloadCSV = () => {
    try {
      // 1. Define CSV headers matching transaction attributes clearly
      const headers = ['ID Transaksi', 'Tanggal', 'Jenis', 'Deskripsi', 'Kategori Keranjang', 'Tag/Kategori Spesifik', 'Nominal (Rp)', 'Nominal Angka Raw'];
      
      const escapeCSV = (val: string | number | undefined) => {
        if (val === undefined || val === null) return '';
        const str = String(val);
        if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      // 2. Format rows
      const rows = currentTxs.map(t => {
        let formattedDate = t.date;
        try {
          const d = new Date(t.date);
          formattedDate = d.toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' }) + ' ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        } catch (_) {}

        const isIncome = t.category === 'pemasukan';

        return [
          escapeCSV(t.id),
          escapeCSV(formattedDate),
          escapeCSV(isIncome ? 'Pemasukan' : 'Pengeluaran'),
          escapeCSV(t.description),
          escapeCSV(t.category.toUpperCase()),
          escapeCSV(t.tag || '-'),
          escapeCSV(`${isIncome ? '+' : '-'} Rp ${t.amount.toLocaleString('id-ID')}`),
          escapeCSV(isIncome ? t.amount : -t.amount)
        ];
      });

      // 3. Assemble CSV string
      const csvStr = [
        headers.join(','),
        ...rows.map(r => r.join(','))
      ].join('\r\n');

      // 4. Download file with UTF-8 BOM so Excel decodes it correctly
      const blob = new Blob(['\uFEFF' + csvStr], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Transaksi_Bulanan_KosFinance_${capitalizedUserName}_${new Date().toLocaleDateString('id-ID').replace(/\//g, '-')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setShowPdfModal(false);
    } catch (err) {
      console.error('Failed to export CSV', err);
      alert('Gagal mengekspor data ke format CSV.');
    }
  };

  const handleExportClick = () => {
    setShowPdfModal(true);
  };

  const InsightIcon = ({ type }: { type: string }) => {
    switch (type) {
      case 'good': return <CheckCircle2 className="h-5 w-5 text-[#10B981]" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-[#F59E0B]" />;
      case 'danger': return <TrendingDown className="h-5 w-5 text-[#FF6B6B]" />;
      default: return <Info className="h-5 w-5 text-[#4ECDC4]" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto w-full space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-4 border-[#1A1A1A] pb-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-[#1A1A1A] tracking-tight uppercase">Analisis Keuangan</h1>
          <p className="text-xs font-bold uppercase tracking-widest mt-1 opacity-70">Periode: {cycle.start.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - {cycle.end.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button 
            onClick={handleExportClick}
            className="bg-[#1A1A1A] text-white brutal-border px-5 py-2.5 font-bold uppercase tracking-widest text-xs flex items-center hover:-translate-y-1 hover:-translate-x-1 hover:brutal-shadow transition-all whitespace-nowrap"
          >
            <FileText className="h-4 w-4 mr-2" />
            Export PDF Laporan
          </button>
        </div>
      </div>

      <div ref={reportRef} className="space-y-8 bg-[#FDFCF8] p-4 -m-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#4ECDC4] p-4 brutal-border brutal-shadow-sm flex flex-col justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest bg-white px-2 py-0.5 inline-block brutal-border mb-2 self-start">Total Masuk</p>
            <p className="font-display font-bold text-xl">{formatIDR(settings.allowanceAmount + totalIncome)}</p>
            {totalIncome > 0 && (
              <p className="text-[9px] font-bold mt-1 uppercase text-stone-800">
                Kiriman + {formatIDR(totalIncome)} Gaji/Lainnya
              </p>
            )}
          </div>
          <div className="bg-[#FFE66D] p-4 brutal-border brutal-shadow-sm flex flex-col justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest bg-white px-2 py-0.5 inline-block brutal-border mb-2 self-start">Total Keluar</p>
            <p className="font-display font-bold text-xl">{formatIDR(totalSpent)}</p>
            {spendDiff !== 0 && (
              <p className="text-[9px] font-bold mt-1 uppercase">
                {spendDiff > 0 ? '+' : ''}{spendDiff.toFixed(0)}% dari bln lalu
              </p>
            )}
          </div>
          <div className={cn("p-4 brutal-border brutal-shadow-sm flex flex-col justify-between text-white", remaining < 0 ? "bg-[#1A1A1A]" : remaining < settings.survivalThreshold ? "bg-[#FF6B6B]" : "bg-[#10B981]")}>
            <p className="text-[10px] font-bold uppercase tracking-widest bg-white text-[#1A1A1A] px-2 py-0.5 inline-block brutal-border mb-2 self-start">Sisa Saldo</p>
            <p className="font-display font-bold text-xl">{formatIDR(remaining)}</p>
            <p className="text-[9px] font-bold mt-1 uppercase">{cycle.daysRemaining} hari lagi</p>
          </div>
          <div className="bg-white p-4 brutal-border brutal-shadow-sm flex flex-col justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest bg-[#1A1A1A] text-white px-2 py-0.5 inline-block brutal-border mb-2 self-start">Rata Harian</p>
            <p className="font-display font-bold text-xl">{formatIDR(avgPerDay)}</p>
            <p className="text-[9px] font-bold mt-1 uppercase opacity-60">Batas: {formatIDR(safeAvgPerDay)}</p>
          </div>
        </div>

        <div className="bg-white brutal-border p-6">
           <h3 className="font-bold text-[#1A1A1A] mb-4 uppercase tracking-widest text-xs border-b-2 border-[#1A1A1A] pb-2 inline-block">Insight & Analisa</h3>
           <div className="space-y-3">
             {insights.map((insight, idx) => (
               <div key={idx} className={cn(
                 "flex items-start gap-3 p-3 brutal-border border-b-4", 
                 insight.type === 'good' ? "bg-green-50" : insight.type === 'danger' ? "bg-red-50" : insight.type === 'warning' ? "bg-amber-50" : "bg-stone-50"
               )}>
                 <div className="mt-0.5 shrink-0"><InsightIcon type={insight.type} /></div>
                 <p className="text-sm font-bold leading-snug">{insight.text}</p>
               </div>
             ))}
             {insights.length === 0 && (
               <p className="text-sm font-bold opacity-50 uppercase tracking-widest">Belum ada insight yang cukup dari data transaksimu.</p>
             )}
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 brutal-border">
            <h3 className="font-bold text-[#1A1A1A] mb-4 uppercase tracking-widest text-xs border-b-2 border-[#1A1A1A] pb-2 inline-block">Proporsi Keranjang</h3>
            <div className="h-64 relative mt-4">
              {data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%" cy="50%"
                      innerRadius={60} outerRadius={90}
                      paddingAngle={0} dataKey="value"
                      stroke="#1A1A1A" strokeWidth={2}
                      isAnimationActive={false}
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value: any) => formatIDR(value as number)} itemStyle={{ color: '#1A1A1A', fontWeight: 'bold' }} contentStyle={{ border: '2px solid #1A1A1A', borderRadius: '0', boxShadow: '4px 4px 0 #1A1A1A', fontFamily: 'Space Grotesk' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                 <div className="w-full h-full flex items-center justify-center font-bold uppercase tracking-widest text-[#1A1A1A] text-xs">Data Kosong</div>
              )}
              {data.length > 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Total</span>
                  <span className="font-display font-bold text-lg leading-none mt-1">{formatIDR(totalSpent)}</span>
                </div>
              )}
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {data.map(d => (
                <div key={d.name} className="flex items-center text-[10px] font-bold uppercase tracking-widest bg-stone-50 px-2 py-1 brutal-border">
                  <div className="w-3 h-3 brutal-border mr-1.5" style={{ backgroundColor: d.color }} />
                  {d.name}: {((d.value / totalSpent) * 100).toFixed(0)}%
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 brutal-border">
            <h3 className="font-bold text-[#1A1A1A] mb-4 uppercase tracking-widest text-xs border-b-2 border-[#1A1A1A] pb-2 inline-block">Tren Mingguan</h3>
            <div className="h-64 mt-4">
               {weeklyData.length > 0 ? (
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={weeklyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                     <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#1A1A1A', fontWeight: 'bold' }} stroke="#1A1A1A" />
                     <YAxis tickFormatter={(val) => `Rp${val/1000}k`} tick={{ fontSize: 10, fill: '#1A1A1A', fontWeight: 'bold' }} stroke="#1A1A1A" />
                     <Tooltip cursor={{ fill: '#F3F4F6' }} formatter={(val: number) => formatIDR(val)} contentStyle={{ border: '2px solid #1A1A1A', borderRadius: '0', boxShadow: '4px 4px 0 #1A1A1A', fontFamily: 'Space Grotesk' }} />
                     <Bar dataKey="amount" fill="#1A1A1A" stroke="#1A1A1A" strokeWidth={2} isAnimationActive={false} />
                   </BarChart>
                 </ResponsiveContainer>
               ) : (
                 <div className="w-full h-full flex items-center justify-center font-bold uppercase tracking-widest text-[#1A1A1A] text-xs">Data Kosong</div>
               )}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 brutal-border w-full overflow-hidden">
           <h3 className="font-bold text-[#1A1A1A] mb-4 sm:mb-6 uppercase tracking-widest text-xs border-b-2 border-[#1A1A1A] pb-2 inline-block">Rincian per Kategori (Tag)</h3>
           <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
             <table className="w-full text-left min-w-[450px]">
               <thead>
                 <tr className="border-b-2 border-[#1A1A1A]">
                   <th className="pb-3 text-[10px] sm:text-xs font-bold uppercase tracking-widest w-1/3">Kategori</th>
                   <th className="pb-3 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-right">Bulan Lalu</th>
                   <th className="pb-3 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-right">Bulan Ini</th>
                   <th className="pb-3 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-right">Tren</th>
                 </tr>
               </thead>
               <tbody>
                 {tagData.length === 0 ? (
                   <tr><td colSpan={4} className="py-8 text-center text-xs font-bold opacity-50 uppercase tracking-widest">Belum ada data</td></tr>
                 ) : (
                   tagData.map((d) => {
                     const isUp = d.diff > 0;
                     return (
                       <tr key={d.name} className="border-b border-stone-200 hover:bg-stone-50 transition-colors">
                         <td className="py-3 sm:py-4 font-bold uppercase tracking-wider text-xs sm:text-sm whitespace-nowrap pr-4">{d.name}</td>
                         <td className="py-3 sm:py-4 font-display font-medium text-right text-stone-500 whitespace-nowrap text-sm pr-4">{d.prevValue > 0 ? formatIDR(d.prevValue) : '-'}</td>
                         <td className="py-3 sm:py-4 font-display font-bold text-right whitespace-nowrap text-sm pr-4">{formatIDR(d.value)}</td>
                         <td className="py-3 sm:py-4 text-right whitespace-nowrap">
                           <span className={cn(
                             "inline-block px-1.5 sm:px-2 py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest brutal-border",
                             d.diff === 0 ? "bg-stone-100" : isUp ? "bg-[#FF6B6B] text-white" : "bg-[#10B981] text-white"
                           )}>
                             {d.diff === 0 ? 'SAMA' : `${isUp ? '+' : ''}${d.diff.toFixed(0)}%`}
                           </span>
                         </td>
                       </tr>
                     )
                   })
                 )}
               </tbody>
             </table>
           </div>
        </div>

        <div className="bg-[#FFE66D] p-6 brutal-border border-b-8">
          <h3 className="font-bold text-[#1A1A1A] mb-4 uppercase tracking-widest text-xs border-b-2 border-[#1A1A1A] pb-2 inline-block">Proyeksi Saldo (Sisa {cycle.daysRemaining} Hari)</h3>
          {avgPerDay === 0 ? (
             <p className="text-sm font-bold opacity-60 uppercase tracking-widest py-4">Belum ada pengeluaran harian yang bisa diproyeksikan.</p>
          ) : (
             <div>
               <div className="flex justify-between items-end mb-2">
                 <div>
                   <span className="text-3xl font-display font-bold">
                     {projectedDepletion >= cycle.daysRemaining ? `${formatIDR(remaining - (avgPerDay * cycle.daysRemaining))}` : 'HABIS'}
                   </span>
                   <p className="text-[10px] uppercase font-bold tracking-widest opacity-80 mt-1">Estimasi Sisa Akhir Siklus</p>
                 </div>
                 <div className="text-right">
                   <p className="text-xs font-bold uppercase tracking-widest">
                     Max Harian: <span className="bg-white px-2 py-1 brutal-border">{formatIDR(safeAvgPerDay)}</span>
                   </p>
                 </div>
               </div>
               
               <div className="mt-6 relative pt-4">
                 <div className="h-4 bg-white brutal-border w-full relative overflow-hidden">
                   <div 
                     className={cn("h-full transition-all duration-500", projectedDepletion < cycle.daysRemaining ? "bg-[#FF6B6B]" : "bg-[#4ECDC4]")}
                     style={{ width: `${Math.min(100, Math.max(0, (daysPassed / cycle.daysTotal) * 100))}%` }}
                   />
                   <div className="absolute top-0 bottom-0 w-1 bg-[#1A1A1A]" style={{ left: `${Math.min(100, (daysPassed / cycle.daysTotal) * 100)}%` }} />
                 </div>
                 <div className="flex justify-between mt-2 text-[9px] font-bold uppercase tracking-widest">
                   <span>HARI 1</span>
                   <span className="bg-[#1A1A1A] text-white px-2 py-0.5 mt-[-24px] z-10 transition-all" style={{ marginLeft: `calc(${Math.min(100, (daysPassed / cycle.daysTotal) * 100)}% - 20px)` }}>HARI INI</span>
                   <span>HR {cycle.daysTotal}</span>
                 </div>
               </div>
             </div>
          )}
        </div>
      </div>

      {showPdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A1A]/80 backdrop-blur-sm">
          <div className="bg-white brutal-border brutal-shadow w-full max-w-sm md:max-w-md p-6 relative flex flex-col">
            <button 
              onClick={() => setShowPdfModal(false)} 
              className="absolute top-4 right-4 p-1.5 brutal-border bg-[#FDFCF8] hover:bg-stone-200 transition-colors"
              aria-label="Tutup"
            >
              <X className="h-4 w-4 text-[#1A1A1A]" />
            </button>
            
            <div className="mb-6 mt-2">
              <h3 className="text-lg font-display font-bold uppercase text-[#1A1A1A] tracking-tight">Unduh Laporan Keuangan</h3>
              <p className="text-[10px] font-bold text-stone-500 mt-1 uppercase tracking-wider">
                Pilih format laporan yang Anda butuhkan
              </p>
            </div>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={handleDownloadStandard}
                className="w-full text-left bg-white border-2 border-[#1A1A1A] p-4 font-display flex items-start gap-3 hover:-translate-y-1 hover:-translate-x-1 hover:brutal-shadow-sm transition-all focus:outline-none"
              >
                <div className="p-2.5 bg-[#FFE66D] border-2 border-[#1A1A1A] shrink-0 text-[#1A1A1A] mt-0.5 flex items-center justify-center">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs md:text-sm uppercase text-[#1A1A1A] tracking-tight">Laporan Keuangan Biasa</h4>
                  <p className="text-[11px] text-stone-600 mt-1 leading-normal">
                    Laporan keuangan lengkap dengan statistik, grafik, dan analisis harian terperinci.
                  </p>
                </div>
              </button>

              <button
                onClick={handleDownloadParent}
                className="w-full text-left bg-white border-2 border-[#1A1A1A] p-4 font-display flex items-start gap-3 hover:-translate-y-1 hover:-translate-x-1 hover:brutal-shadow-sm transition-all focus:outline-none"
              >
                <div className="p-2 bg-[#4ECDC4] border-2 border-[#1A1A1A] shrink-0 text-[#1A1A1A] mt-0.5 flex items-center justify-center font-bold text-base leading-none">
                  👨‍👩‍👦
                </div>
                <div>
                  <h4 className="font-bold text-xs md:text-sm uppercase text-[#1A1A1A] tracking-tight">Laporan Orang Tua</h4>
                  <p className="text-[11px] text-stone-600 mt-1 leading-normal">
                    Laporan transparan ramah orang tua berisi ringkasan uang masuk/keluar serta rincian barang.
                  </p>
                </div>
              </button>

              <button
                onClick={handleDownloadCSV}
                className="w-full text-left bg-white border-2 border-[#1A1A1A] p-4 font-display flex items-start gap-3 hover:-translate-y-1 hover:-translate-x-1 hover:brutal-shadow-sm transition-all focus:outline-none"
              >
                <div className="p-2.5 bg-[#FF6B6B] border-2 border-[#1A1A1A] shrink-0 text-white mt-0.5 flex items-center justify-center">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs md:text-sm uppercase text-[#1A1A1A] tracking-tight">Ekspor Data CSV / Excel</h4>
                  <p className="text-[11px] text-stone-600 mt-1 leading-normal">
                    Format spreadsheet (.csv) berisi rincian semua transaksi bulanan. Cocok untuk diolah mandiri di Microsoft Excel atau Google Sheets.
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pb-10" />
    </div>
  );
}

