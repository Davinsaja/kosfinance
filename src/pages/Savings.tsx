import React, { useState } from 'react';
import { useStore } from '../store';
import { SavingsTarget } from '../types';
import { Target, TrendingUp, Calendar, Trash2, Edit2, Plus, Sparkles, AlertCircle, Coins, ArrowRightLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function Savings() {
  const { state, addSavingsTarget, updateSavingsTarget, removeSavingsTarget } = useStore();

  // Active States
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Deposit/Withdrawal Modal State
  const [selectedTarget, setSelectedTarget] = useState<SavingsTarget | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustType, setAdjustType] = useState<'deposit' | 'withdraw'>('deposit');

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetAmount) return;

    const newTarget: SavingsTarget = {
      id: 'st_' + Date.now().toString(),
      title: title.trim(),
      targetAmount: Number(targetAmount),
      currentAmount: 0,
      dueDate: dueDate || undefined
    };

    await addSavingsTarget(newTarget);
    // Reset Form
    setTitle('');
    setTargetAmount('');
    setDueDate('');
    setShowAddForm(false);
  };

  const handleAdjustSavings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTarget || !adjustAmount) return;

    const amt = Number(adjustAmount);
    let newAmount = selectedTarget.currentAmount;

    if (adjustType === 'deposit') {
      newAmount += amt;
    } else {
      newAmount = Math.max(0, newAmount - amt);
    }

    const updated: SavingsTarget = {
      ...selectedTarget,
      currentAmount: newAmount
    };

    await updateSavingsTarget(updated);
    // Reset variables
    setAdjustAmount('');
    setSelectedTarget(null);
  };

  const handleDeleteGoal = async (id: string, name: string) => {
    await removeSavingsTarget(id);
  };

  const formatDueDate = (dateStr?: string) => {
    if (!dateStr) return 'Tanpa Batas Waktu';
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Recommendations: calculate total savings in active goals vs emergency allocations
  const activeTargets = state.savingsTargets || [];
  const totalSavedSoFar = activeTargets.reduce((acc, t) => acc + t.currentAmount, 0);
  const totalGoalsAmount = activeTargets.reduce((acc, t) => acc + t.targetAmount, 0);

  // Suggested emergency base from allowances
  const computedEmergencySavings = (state.settings.allowanceAmount * (state.settings.allocations.darurat / 100));

  return (
    <div className="max-w-5xl mx-auto w-full space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-[#1A1A1A] pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-[#1A1A1A] tracking-tight">Celengan Target</h1>
          <p className="text-xs text-stone-500 mt-1 uppercase font-bold tracking-widest flex items-center gap-1.5 animate-pulse">
            <Coins className="h-4 w-4 text-[#FFE66D]" /> Menabung disiplin demi keinginan impian anak kos
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-[#FFE66D] text-[#1A1A1A] border-2 border-[#1A1A1A] px-4 py-2.5 font-bold text-xs uppercase tracking-wider shadow-[3px_3px_0px_#1A1A1A] hover:bg-white active:translate-y-0.5 active:shadow-[1px_1px_0px_#1A1A1A] transition-all flex items-center gap-1.5 shrink-0"
        >
          <Sparkles className="h-4 w-4 text-[#FF6B6B]" /> Buat Target Baru
        </button>
      </div>

      {/* Info Recommendation Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2 bg-[#FDFCF8] border-2 border-[#1A1A1A] p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
          <div className="space-y-1 z-10">
            <span className="text-[10px] bg-[#10B981] text-white font-bold px-2 py-0.5 brutal-border uppercase tracking-widest">Saran KosFinance</span>
            <h3 className="font-bold text-[#1A1A1A] uppercase tracking-wide text-sm mt-1.5">Tabungan dari Alokasi Keranjang Darurat</h3>
            <p className="text-xs text-stone-600 leading-relaxed max-w-lg mt-1">
              Dengan alokasi <b>Keranjang Darurat sebesar {state.settings.allocations.darurat}%</b>, Anda menyisihkan secara otomatis <b>{formatIDR(computedEmergencySavings)}</b> setiap bulan. Gunakan dana ini untuk mewujudkan celengan target di bawah!
            </p>
          </div>
          <div className="bg-white brutal-border p-4 shrink-0 text-center uppercase min-w-[150px] z-10 shadow-[3px_3px_0px_#1A1A1A]">
            <p className="text-[9px] font-black tracking-widest text-[#1A1A1A]">Dana Tersimpan</p>
            <p className="font-display font-black text-lg text-[#1A1A1A] tracking-tight mt-1">{formatIDR(totalSavedSoFar)}</p>
          </div>
          {/* Subtle decorative background detail */}
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 h-24 w-24 bg-[#4ECDC4]/10 rounded-full border border-dashed border-[#4ECDC4]" />
        </div>

        {/* Small stats card */}
        <div className="lg:col-span-1 bg-white brutal-border brutal-shadow p-5 flex flex-col justify-between">
          <span className="text-stone-500 font-bold uppercase text-[9px] tracking-widest">Progres Finansial Target</span>
          <div className="mt-2">
            <h4 className="font-display font-black text-2xl text-[#1A1A1A] tracking-tight">
              {totalGoalsAmount > 0 ? Math.round((totalSavedSoFar / totalGoalsAmount) * 100) : 0}%
            </h4>
            <div className="w-full h-3.5 bg-stone-100 border-2 border-[#1A1A1A] mt-2 relative">
              <div 
                className="h-full bg-[#4ECDC4] border-r-2 border-[#1A1A1A]" 
                style={{ width: `${totalGoalsAmount > 0 ? Math.min(100, (totalSavedSoFar / totalGoalsAmount) * 100) : 0}%` }}
              />
            </div>
          </div>
          <p className="text-[10px] font-bold text-stone-500 mt-2 uppercase tracking-wide">
            Kekurangan Dana Total: {formatIDR(Math.max(0, totalGoalsAmount - totalSavedSoFar))}
          </p>
        </div>
      </div>

      {/* Pop-up Form: Add New Target */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleCreateGoal}
            className="bg-white brutal-border brutal-shadow p-5 md:p-6 space-y-4"
          >
            <div className="flex justify-between items-center border-b border-stone-200 pb-2">
              <h3 className="font-bold text-xs uppercase tracking-widest text-[#1A1A1A] flex items-center gap-1.5">
                <Target className="h-4 w-4" /> Desain Rencana Celengan Baru
              </h3>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-stone-400 hover:text-red-500 font-bold text-xs uppercase tracking-widest"
              >
                Tutup [X]
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-widest mb-1.5">Nama Impian / Barang</label>
                <input
                  required
                  type="text"
                  placeholder="Contoh: Beli Tiket Konser, Kado Ibu"
                  className="w-full bg-white brutal-border py-2.5 px-3 text-[#1A1A1A] font-bold text-xs focus:ring-4 focus:ring-[#FFE66D] focus:outline-none"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-widest mb-1.5">Target Nominal (Rp)</label>
                <input
                  required
                  type="number"
                  placeholder="Contoh: 1500000"
                  className="w-full bg-white brutal-border py-2.5 px-3 text-[#1A1A1A] font-bold text-xs focus:ring-4 focus:ring-[#FFE66D] focus:outline-none"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-widest mb-1.5">Target Tanggal Dicapai (Opsional)</label>
                <input
                  type="date"
                  className="w-full bg-white brutal-border py-2.5 px-3 text-[#1A1A1A] font-bold text-xs focus:ring-4 focus:ring-[#FFE66D] focus:outline-none"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#1A1A1A] text-white uppercase tracking-widest font-bold py-3.5 text-xs hover:bg-stone-900 transition-colors brutal-border shadow-[3px_3px_0px_#4ECDC4]"
            >
              Simpan Target Impian
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Saving deposit/withdrawal Adjustment Drawer / Form Box */}
      <AnimatePresence>
        {selectedTarget && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 pointer-events-auto"
          >
            <form 
              onSubmit={handleAdjustSavings}
              className="bg-white brutal-border brutal-shadow p-6 max-w-sm w-full space-y-4"
            >
              <div className="flex justify-between items-center border-b border-[#1A1A1A] pb-2">
                <span className="font-bold text-[10px] uppercase tracking-wider text-stone-500">Mutasi Tabungan Target</span>
                <button 
                  type="button" 
                  onClick={() => setSelectedTarget(null)}
                  className="text-stone-400 hover:text-stone-800 text-xs uppercase font-extrabold"
                >
                  X
                </button>
              </div>

              <div>
                <h4 className="font-bold text-sm uppercase text-[#1A1A1A]">{selectedTarget.title}</h4>
                <p className="text-[10px] font-bold text-stone-500 uppercase mt-0.5">Terkumpul: {formatIDR(selectedTarget.currentAmount)} / {formatIDR(selectedTarget.targetAmount)}</p>
              </div>

              {/* Adjust type filter selection */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustType('deposit')}
                  className={`py-2 text-[10px] font-bold uppercase tracking-wider border-2 border-[#1A1A1A] transition-all flex items-center justify-center gap-1
                    ${adjustType === 'deposit' ? 'bg-[#10B981] text-white shadow-[2px_2px_0px_#1A1A1A]' : 'bg-white text-stone-700 hover:bg-stone-50'}`}
                >
                  📥 Masukkan (Nabungkan)
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('withdraw')}
                  className={`py-2 text-[10px] font-bold uppercase tracking-wider border-2 border-[#1A1A1A] transition-all flex items-center justify-center gap-1
                    ${adjustType === 'withdraw' ? 'bg-[#FF6B6B] text-white shadow-[2px_2px_0px_#1A1A1A]' : 'bg-white text-stone-700 hover:bg-stone-50'}`}
                >
                  📤 Ambil Tabungan
                </button>
              </div>

              {/* Amount input */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-1">Nominal Uang (Rp)</label>
                <input
                  required
                  type="number"
                  placeholder="0"
                  className="w-full bg-white brutal-border py-2.5 px-3 font-bold focus:outline-none focus:ring-4 focus:ring-[#FFE66D]"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#1A1A1A] text-white uppercase text-xs tracking-widest font-bold py-3.5 border-2 border-[#1A1A1A] hover:bg-black transition-colors"
              >
                Konfirmasi Mutasi {adjustType === 'deposit' ? 'Simpanan' : 'Pengambilan'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Target Grid */}
      {activeTargets.length === 0 ? (
        <div className="bg-white brutal-border p-12 text-center text-[#1A1A1A] relative">
          <Target className="h-12 w-12 mx-auto stroke-1.5 text-stone-300 mb-3 animate-bounce" />
          <p className="font-display font-medium text-sm uppercase tracking-wide">Belum ada target menabung</p>
          <p className="text-xs text-stone-500 mt-1 uppercase tracking-wider max-w-sm mx-auto leading-normal">
            Anak kos sejati selalu punya celengan impian. Klik tombol <b>Buat Target Baru</b> di sudut kanan atas untuk memulainya!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {activeTargets.map((target) => {
            const percent = Math.min(100, Math.round((target.currentAmount / target.targetAmount) * 100));
            const isCompleted = target.currentAmount >= target.targetAmount;

            return (
              <div 
                key={target.id}
                className={`bg-white border-2 border-[#1A1A1A] p-5 relative flex flex-col justify-between hover:brutal-shadow transition-shadow
                  ${isCompleted ? 'border-[#10B981] bg-[#10B981]/5' : ''}`}
              >
                {/* Header labels */}
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-display text-sm md:text-base font-extrabold text-[#1A1A1A] uppercase tracking-wide leading-tight mt-0.5">
                      {target.title}
                    </h3>
                    <p className="text-[10px] font-bold text-stone-500 uppercase flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3 shrink-0" /> Target: {formatDueDate(target.dueDate)}
                    </p>
                  </div>
                  
                  {isCompleted ? (
                    <span className="text-[9px] font-black text-white bg-[#10B981] px-2 py-0.5 uppercase tracking-widest brutal-border rounded-none shadow-[1px_1px_0px_#1A1A1A]">
                      🎯 Terpenuhi
                    </span>
                  ) : (
                    <span className="text-[9px] font-black text-[#1A1A1A] bg-[#FFE66D] px-2 py-0.5 uppercase tracking-widest border border-[#1A1A1A]">
                      🎯 Aktif
                    </span>
                  )}
                </div>

                {/* Progress Visuals */}
                <div className="mt-4">
                  <div className="flex justify-between text-[11px] font-bold mb-1">
                    <span className="text-stone-500 uppercase">Terkumpul</span>
                    <span className="font-display text-[#1A1A1A]">{percent}% ({formatIDR(target.currentAmount)})</span>
                  </div>
                  
                  {/* Progress bar background */}
                  <div className="w-full h-3 border-2 border-[#1A1A1A] bg-stone-100 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 
                        ${isCompleted ? 'bg-[#10B981]' : percent > 60 ? 'bg-[#4ECDC4]' : 'bg-[#FFE66D]'}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-stone-500 mt-1 uppercase">
                    <span>Mulai</span>
                    <span>Target: {formatIDR(target.targetAmount)}</span>
                  </div>
                </div>

                {/* Card Action footer button */}
                <div className="mt-5 border-t border-stone-200 pt-3.5 flex justify-between items-center gap-3">
                  <button
                    onClick={() => setSelectedTarget(target)}
                    className="flex-1 bg-[#1A1A1A] text-white hover:bg-neutral-800 py-2.5 font-bold text-[10px] uppercase tracking-widest brutal-border"
                  >
                    Adjust / Mutasi Celengan
                  </button>
                  <button
                    onClick={() => handleDeleteGoal(target.id, target.title)}
                    className="p-2.5 border-2 border-[#1A1A1A] text-stone-500 hover:text-white hover:bg-[#FF6B6B] transition-all flex items-center justify-center bg-white"
                    title="Hapus Target"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
