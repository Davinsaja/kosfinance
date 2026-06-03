import React, { useMemo } from 'react';
import { useStore } from '../store';
import { getCurrentCycle, getTransactionsInCycle } from '../lib/cycleUtils';
import { formatIDR, cn } from '../lib/utils';
import { motion } from 'motion/react';
import { AlertTriangle, TrendingDown, TrendingUp, Target, Bell, Coins, Calendar, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const { state } = useStore();
  const { settings, transactions, bills } = state;
  const cycle = useMemo(() => getCurrentCycle(settings.cycleStartDate), [settings.cycleStartDate]);
  
  const currentTxs = useMemo(() => getTransactionsInCycle(transactions, cycle.start, cycle.end), [transactions, cycle]);
  
  const totalIncome = useMemo(() => currentTxs.filter(t => t.category === 'pemasukan').reduce((acc, t) => acc + t.amount, 0), [currentTxs]);
  const totalSpent = currentTxs.filter(t => t.category !== 'pemasukan').reduce((acc, t) => acc + t.amount, 0);
  const remaining = state.current_balance !== undefined ? state.current_balance : ((settings.allowanceAmount + totalIncome) - totalSpent);
  const isSurvivalMode = remaining <= settings.survivalThreshold;

  const totalsByCategory = currentTxs.filter(t => t.category !== 'pemasukan').reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const activeSavings = useMemo(() => {
    return (state.savingsTargets || []).filter(s => s.currentAmount < s.targetAmount);
  }, [state.savingsTargets]);

  const upcomingAgenda = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setDate(today.getDate() + 14); // Tampilkan 14 hari ke depan
    end.setHours(23, 59, 59, 999);

    const events = (state.calendarEvents || []).filter(e => {
      try {
        const evDate = new Date(e.date);
        return evDate >= today && evDate <= end;
      } catch (_) { return false; }
    });

    const dayToday = today.getDate();
    const billsDueSoon = (state.bills || []).filter(b => {
      const daysDiff = b.dueDate - dayToday;
      return !b.isPaid && daysDiff >= 0 && daysDiff <= 7;
    });

    return {
      events: events.slice(0, 4),
      bills: billsDueSoon.slice(0, 3)
    };
  }, [state.calendarEvents, state.bills]);

  const buckets = [
    { id: 'wajib', title: 'Wajib', pct: settings.allocations.wajib },
    { id: 'fleksibel', title: 'Fleksibel', pct: settings.allocations.fleksibel },
    { id: 'darurat', title: 'Darurat', pct: settings.allocations.darurat },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-display font-bold text-[#1A1A1A] tracking-tight">Ringkasan</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Hero & Buckets */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Card */}
          <motion.div 
            initial={{ y: 5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "brutal-border brutal-shadow p-6 md:p-8 relative overflow-hidden flex flex-col justify-between",
              isSurvivalMode ? "bg-[#FF6B6B] text-white survival-glow" : "bg-white text-[#1A1A1A]"
            )}
          >
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#4ECDC4] opacity-20 rounded-full"></div>
            <div className="relative z-10">
              <span className="px-3 py-1 bg-[#1A1A1A] text-white text-[10px] font-bold uppercase tracking-widest">Sisa Uang Hari Ini</span>
              <div className="flex items-baseline gap-4 mt-4 mb-6">
                <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tighter">
                  {formatIDR(remaining)}
                </h2>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
                <div className="bg-[#1A1A1A] text-white px-4 py-2 brutal-border text-xs uppercase font-bold tracking-tight">
                  ⏳ {cycle.daysRemaining} hari lagi sampai kiriman
                </div>
                {isSurvivalMode && (
                  <div className="bg-white text-[#FF6B6B] px-4 py-2 brutal-border text-xs uppercase flex items-center font-bold">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Modus Survival Aktif!
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Buckets */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {buckets.map((b, i) => {
              const allocated = (settings.allowanceAmount * b.pct) / 100;
              const spent = totalsByCategory[b.id] || 0;
              const left = allocated - spent;
              const percentSpent = Math.min(100, (spent / allocated) * 100);

              let bgClass = "bg-white";
              let textClass = "text-[#1A1A1A]";
              if (b.id === 'wajib') bgClass = "bg-[#FFE66D]";
              if (b.id === 'darurat') { bgClass = "bg-[#1A1A1A]"; textClass = "text-white"; };

              return (
                <motion.div 
                  key={b.id}
                  initial={{ y: 5, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05, duration: 0.15 }}
                  className={cn("brutal-border brutal-shadow p-5 hover:-translate-y-0.5 hover:brutal-shadow-sm transition-all duration-200", bgClass, textClass)}
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider">{b.title}</span>
                    <span className="text-xs font-bold opacity-70">{b.pct}%</span>
                  </div>
                  <p className="text-2xl font-display font-bold mb-1">{formatIDR(left)}</p>
                  <p className="text-[10px] opacity-70 mb-4 font-bold uppercase">sisa dari {formatIDR(allocated)}</p>
                  
                  <div className="h-2 w-full bg-[#1A1A1A] brutal-border bg-opacity-10">
                    <div 
                      className={cn(
                        "h-full transition-all duration-300",
                        percentSpent > 90 ? "bg-[#FF6B6B]" : percentSpent > 75 ? "bg-[#FFE66D]" : "bg-[#4ECDC4]"
                      )}
                      style={{ width: `${percentSpent}%` }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Active Savings Targets Widget */}
          <motion.div
            initial={{ y: 5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="bg-white border-2 border-[#1A1A1A] p-5 brutal-shadow relative overflow-hidden"
          >
            <div className="flex justify-between items-center border-b border-stone-200 pb-3 mb-4">
              <span className="text-xs font-black uppercase tracking-widest text-[#1A1A1A] flex items-center gap-1.5 font-display">
                <Coins className="h-4.5 w-4.5 text-[#FFE66D]" /> Celengan Target Impian
              </span>
              <Link
                to="/celengan"
                className="text-[10px] font-black uppercase text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 brutal-border hover:bg-[#10B981] hover:text-white transition-all flex items-center gap-1"
              >
                Ke Celengan <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            {activeSavings.length === 0 ? (
              <div className="text-center py-4 text-stone-500 text-xs font-bold uppercase tracking-wider">
                Belum ada celengan target aktif. Yuk buat celengan impian Anda! 🎯
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeSavings.slice(0, 2).map((s) => {
                  const percent = Math.min(100, Math.round((s.currentAmount / s.targetAmount) * 100));
                  return (
                    <div key={s.id} className="bg-stone-50 border border-stone-300 p-3.5 space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-xs uppercase text-[#1A1A1A] leading-tight line-clamp-1">{s.title}</h4>
                        <span className="text-[10px] font-black text-[#1A1A1A] bg-[#FFE66D] px-1.5 py-0.5 border border-[#1A1A1A]">{percent}%</span>
                      </div>
                      
                      {/* Slim progress bar */}
                      <div className="w-full h-2 bg-stone-200 border border-stone-400 overflow-hidden">
                        <div className="h-full bg-[#10B981]" style={{ width: `${percent}%` }} />
                      </div>
                      
                      <div className="flex justify-between text-[9px] font-bold text-stone-500 uppercase">
                        <span>{formatIDR(s.currentAmount)}</span>
                        <span>Target: {formatIDR(s.targetAmount)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {isSurvivalMode && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#FF6B6B] brutal-border brutal-shadow p-6 text-white"
            >
               <div className="flex justify-between items-center mb-2">
                 <h3 className="font-display font-bold text-lg uppercase italic">Survival Mode Aktif</h3>
                 <div className="w-3 h-3 rounded-full bg-white animate-pulse"></div>
               </div>
               <p className="text-sm leading-snug">
                 <span className="font-bold underline">Tips:</span> Masak nasi sendiri, kurangi nongkrong, dan gunakan sisa saldo darurat dengan bijak.
               </p>
            </motion.div>
          )}
        </div>

        {/* Right Column: Recent Activity */}
        <div className="lg:col-span-1">
          <div className="bg-white brutal-border brutal-shadow p-5">
            <div className="flex justify-between items-center border-b-2 border-[#1A1A1A] pb-2 mb-4">
              <h3 className="font-bold text-xs uppercase tracking-widest">Transaksi Terakhir</h3>
              <Link to="/catat" className="text-xs text-[#1A1A1A] font-bold uppercase hover:underline">+ Catat Baru</Link>
            </div>
            {currentTxs.length === 0 ? (
              <p className="opacity-50 font-bold text-xs uppercase text-center py-8">Belum ada transaksi siklus ini.</p>
            ) : (
              <div className="space-y-3 mt-2">
                {currentTxs.slice(0, 6).map((t, idx) => {
                  const isIncome = t.category === 'pemasukan';
                  return (
                    <motion.div 
                      key={t.id} 
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03, duration: 0.15 }}
                      className="flex justify-between items-center p-3 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-transform brutal-border bg-white brutal-shadow-sm"
                    >
                      <div className="flex items-center min-w-0 mr-2">
                        <div className={cn(
                          "h-8 w-8 brutal-border flex justify-center items-center mr-3 shrink-0",
                          isIncome ? "bg-[#4ECDC4]" : "bg-[#FFE66D]"
                        )}>
                          {isIncome ? <TrendingUp className="h-4 w-4 text-white" /> : <TrendingDown className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm truncate text-[#1A1A1A]">{t.description}</p>
                          <p className="text-[10px] opacity-60 uppercase font-bold truncate">
                            {isIncome ? "Pemasukan / Gaji" : (t.tag || t.category)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={cn(
                          "font-display font-bold text-sm",
                          isIncome ? "text-[#10B981]" : "text-[#FF6B6B]"
                        )}>
                          {isIncome ? "+" : "-"}{formatIDR(t.amount)}
                        </p>
                        <p className="text-[10px] opacity-60 font-bold uppercase">
                          {new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Upcoming Agenda (Calendar Events & Unpaid Bills) Widget */}
          <div className="bg-white brutal-border brutal-shadow p-5 mt-6">
            <div className="flex justify-between items-center border-b-2 border-[#1A1A1A] pb-2 mb-4">
              <h3 className="font-bold text-xs uppercase tracking-widest flex items-center gap-1.5 font-display">
                <Calendar className="h-4 w-4" /> Agenda & Tagihan Terdekat
              </h3>
              <Link to="/kalender" className="text-xs text-[#1A1A1A] font-bold uppercase hover:underline">Lihat Kalender</Link>
            </div>

            {upcomingAgenda.events.length === 0 && upcomingAgenda.bills.length === 0 ? (
              <p className="opacity-50 font-bold text-[#1A1A1A] text-xs uppercase text-center py-8">Agenda Aman & Bersih!</p>
            ) : (
              <div className="space-y-3">
                {/* Due Bills Soon */}
                {upcomingAgenda.bills.map((b) => (
                  <div key={`soon-bill-${b.id}`} className="bg-[#4ECDC4]/10 border border-[#4ECDC4] p-3 flex justify-between items-center gap-2">
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold uppercase text-[#1A1A1A] truncate">{b.name}</h4>
                      <p className="text-[9px] font-bold text-[#4ECDC4] uppercase mt-0.5">Jatuh Tempo: Tanggal {b.dueDate}</p>
                    </div>
                    <span className="text-[11px] font-black text-[#1A1A1A] bg-white border border-[#1A1A1A] px-2 py-1 shrink-0">
                      {formatIDR(b.amount)}
                    </span>
                  </div>
                ))}

                {/* Calendar Events Soon */}
                {upcomingAgenda.events.map((e) => {
                  let formattedDate = e.date;
                  try {
                    const d = new Date(e.date);
                    formattedDate = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                  } catch (_) {}

                  return (
                    <div key={`soon-event-${e.id}`} className="bg-stone-50 border border-stone-300 p-3 flex justify-between items-center gap-2">
                      <div className="min-w-0 flex gap-2 items-start">
                        <div className="p-1 bg-[#FFE66D] border border-stone-400 shrink-0 text-stone-800 mt-0.5">
                          {e.type === 'reminder' ? <Bell className="h-3 w-3" /> : e.type === 'target' ? <Target className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold uppercase text-[#1A1A1A] truncate">{e.title}</h4>
                          <p className="text-[9px] font-bold text-stone-500 uppercase mt-0.5">Rencana: {formattedDate}</p>
                        </div>
                      </div>
                      {e.amount && (
                        <span className="text-[10px] font-extrabold text-stone-800 shrink-0">
                          {formatIDR(e.amount)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
