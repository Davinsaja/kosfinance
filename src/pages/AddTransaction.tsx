import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { ExpenseCategory } from '../types';
import { motion } from 'motion/react';
import { ArrowLeft, TrendingDown } from 'lucide-react';
import { formatIDR, formatNumberWithDots, parseNumberFromDots, cn } from '../lib/utils';

const COMMON_TAGS = ['Makan', 'Jajan', 'Transport', 'Kos', 'Listrik/Air', 'Belanja', 'Hiburan', 'Sakit', 'Lainnya'];
const INCOME_TAGS = ['Gaji', 'Transfer Ortu', 'Sampingan', 'Beasiswa', 'Kembalian', 'Lainnya'];

export function AddTransaction() {
  const navigate = useNavigate();
  const { state, addTransaction } = useStore();
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [txType, setTxType] = useState<'expense' | 'income'>('expense');
  const [category, setCategory] = useState<ExpenseCategory>('wajib');
  const [tag, setTag] = useState<string>('Makan');

  const activeTags = useMemo(() => {
    return txType === 'income' ? INCOME_TAGS : COMMON_TAGS;
  }, [txType]);

  const handleTypeChange = (newType: 'expense' | 'income') => {
    setTxType(newType);
    if (newType === 'income') {
      setCategory('pemasukan');
      setTag('Gaji');
    } else {
      setCategory('wajib');
      setTag('Makan');
    }
  };

  const handleCategorySelect = (id: ExpenseCategory) => {
    setCategory(id);
  };

  const todayTxs = useMemo(() => {
    const todayStr = new Date().toDateString();
    return state.transactions.filter(
      (t) => new Date(t.date).toDateString() === todayStr
    );
  }, [state.transactions]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const formatted = formatNumberWithDots(rawVal);
    setAmount(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseNumberFromDots(amount);
    if (!parsedAmount || !desc) return;
    
    addTransaction({
      id: Date.now().toString(),
      amount: parsedAmount,
      description: desc,
      category,
      tag,
      date: new Date().toISOString(),
    });
    navigate('/dashboard');
  };

  return (
    <div className="max-w-5xl mx-auto w-full space-y-6 pb-20 lg:pb-0">
      <div className="flex items-center border-b-2 border-[#1A1A1A] pb-4">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-none hover:bg-stone-200 transition-colors brutal-border bg-white mr-2">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-display font-bold text-[#1A1A1A] tracking-tight">
          {txType === 'income' ? 'Catat Pemasukan' : 'Catat Pengeluaran'}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* Panel Kiri: Form Input */}
        <div className="lg:col-span-2">
          <motion.form 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onSubmit={handleSubmit} 
            className="bg-white brutal-border brutal-shadow p-5 md:p-6 space-y-5"
          >
            <div className="grid grid-cols-2 gap-3 p-1.5 bg-stone-100 brutal-border border-2 border-[#1A1A1A]">
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={cn(
                  "py-3 font-display font-bold text-xs md:text-sm uppercase tracking-widest transition-all duration-150 text-center",
                  txType === 'expense'
                    ? "bg-[#FF6B6B] text-white brutal-border border-2 border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A] translate-x-[-2px] translate-y-[-2px]"
                    : "bg-stone-200 text-stone-400 border border-stone-300 opacity-60 hover:opacity-100 hover:text-stone-600 transition-opacity"
                )}
              >
                Pengeluaran
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={cn(
                  "py-3 font-display font-bold text-xs md:text-sm uppercase tracking-widest transition-all duration-150 text-center",
                  txType === 'income'
                    ? "bg-[#10B981] text-white brutal-border border-2 border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A] translate-x-[-2px] translate-y-[-2px]"
                    : "bg-stone-200 text-stone-400 border border-stone-300 opacity-60 hover:opacity-100 hover:text-stone-600 transition-opacity"
                )}
              >
                Pemasukan
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-widest mb-2">Nominal</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 font-bold">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={amount}
                  onChange={handleAmountChange}
                  className="w-full bg-white brutal-border py-4 pl-12 pr-4 text-xl md:text-2xl font-display font-bold text-[#1A1A1A] focus:outline-none focus:ring-4 focus:ring-[#FFE66D] transition-all"
                  placeholder="0"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-widest mb-2">
                {txType === 'income' ? 'Sumber Pemasukan / Keterangan' : 'Untuk Apa?'}
              </label>
              <input
                type="text"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full bg-white brutal-border py-3 px-4 text-[#1A1A1A] font-bold focus:outline-none focus:ring-4 focus:ring-[#FFE66D] transition-all"
                placeholder={txType === 'income' ? 'Gaji bulanan atau uang transferan' : 'Makan siang trus bayar parkir'}
                required
              />
            </div>

            {txType === 'expense' && (
              <div>
                <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-widest mb-2">Masuk Keranjang Mana?</label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {[
                    { id: 'wajib', label: 'Wajib', desc: 'Kos, Listrik', color: 'bg-[#FFE66D]' },
                    { id: 'fleksibel', label: 'Fleksibel', desc: 'Jajan, Main', color: 'bg-[#4ECDC4]' },
                    { id: 'darurat', label: 'Darurat', desc: 'Sakit, Rusak', color: 'bg-[#FF6B6B] text-white' },
                  ].map((c) => (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      key={c.id}
                      type="button"
                      onClick={() => handleCategorySelect(c.id as ExpenseCategory)}
                      className={`p-2 sm:p-3 brutal-border border-2 border-[#1A1A1A] text-center sm:text-left transition-colors flex flex-col justify-center items-center sm:items-start
                        ${category === c.id 
                          ? `${c.color} shadow-[inset_0px_0px_0px_2px_#1A1A1A]` 
                          : 'bg-white hover:bg-stone-50'} `}
                    >
                      <div className={`font-bold text-[10px] sm:text-xs uppercase tracking-wider ${category === c.id && c.id === 'darurat' ? 'text-white' : 'text-[#1A1A1A]'}`}>
                        {c.label}
                      </div>
                      <div className={`text-[8px] sm:text-[9px] mt-1 line-clamp-1 uppercase font-bold opacity-70 ${category === c.id && c.id === 'darurat' ? 'text-white' : 'text-[#1A1A1A]'}`}>
                        {c.desc}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-widest mb-2 mt-4">Kategori (Tag)</label>
              <div className="flex flex-wrap gap-2">
                {activeTags.map(t => (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    key={t}
                    type="button"
                    onClick={() => setTag(t)}
                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border-2 border-[#1A1A1A] transition-colors
                      ${tag === t 
                        ? 'bg-[#1A1A1A] text-white' 
                        : 'bg-white text-[#1A1A1A] hover:bg-stone-50'}`}
                  >
                    {t}
                  </motion.button>
                ))}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-[#1A1A1A] text-white font-bold py-4 text-sm sm:text-base uppercase tracking-widest brutal-border hover:bg-black transition-colors mt-6 shadow-[4px_4px_0px_#FFE66D]"
            >
              {txType === 'income' ? 'Simpan Pemasukan' : 'Simpan Transaksi'}
            </motion.button>
          </motion.form>
        </div>

        {/* Panel Kanan: Riwayat Transaksi Hari Ini */}
        <div className="lg:col-span-1">
          <div className="bg-white brutal-border p-5">
            <div className="border-b-2 border-[#1A1A1A] pb-2 mb-4">
              <h3 className="font-bold text-xs uppercase tracking-widest text-[#1A1A1A]">Transaksi Hari Ini</h3>
              <p className="text-[10px] font-bold text-stone-500 uppercase mt-1">Yang baru saja dicatat</p>
            </div>
            {todayTxs.length === 0 ? (
              <div className="py-12 text-center text-stone-400">
                <p className="font-bold uppercase tracking-widest text-xs">Belum ada catatan</p>
                <p className="text-[9px] font-semibold uppercase mt-1">Transaksi yang anda buat hari ini akan muncul di sini</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {todayTxs.map((t, idx) => {
                  const isIncome = t.category === 'pemasukan';
                  return (
                    <motion.div 
                      key={t.id}
                      initial={{ opacity: 0, x: 5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03, duration: 0.15 }}
                      className="p-3 brutal-border bg-white brutal-shadow-sm flex justify-between items-center text-xs"
                    >
                      <div className="min-w-0 mr-2">
                        <p className="font-bold text-[#1A1A1A] truncate">{t.description}</p>
                        <p className="text-[9px] opacity-60 uppercase font-bold">
                          {isIncome ? 'Pemasukan' : (t.tag || t.category)}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={cn(
                          "font-display font-bold text-xs",
                          isIncome ? "text-[#10B981]" : "text-[#FF6B6B]"
                        )}>
                          {isIncome ? "+" : "-"}{formatIDR(t.amount)}
                        </p>
                      </div>
                    </motion.div>
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
