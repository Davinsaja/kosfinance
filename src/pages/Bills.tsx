import React, { useState } from 'react';
import { useStore } from '../store';
import { formatIDR, cn, formatNumberWithDots, parseNumberFromDots } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react';

export function Bills() {
  const { state, addBill, toggleBillPaid, removeBill } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('1');

  const currentMonthKey = new Date().toISOString().slice(0, 7); // YYYY-MM

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(formatNumberWithDots(e.target.value));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseNumberFromDots(amount);
    if (!name || !parsedAmount) return;
    addBill({
      id: Date.now().toString(),
      name,
      amount: parsedAmount,
      dueDate: Number(dueDate) || 1,
      isPaid: false,
    });
    setIsAdding(false);
    setName('');
    setAmount('');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full">
      <div className="flex justify-between items-center mb-6 border-b-2 border-[#1A1A1A] pb-4">
        <h1 className="text-2xl font-display font-bold text-[#1A1A1A] tracking-tight uppercase">Dinding Tagihan</h1>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-[#FFE66D] text-[#1A1A1A] brutal-border px-4 py-2 font-bold uppercase tracking-widest text-xs flex items-center hover:-translate-y-1 transition-transform"
        >
          <Plus className="h-4 w-4 mr-1" />
          Tagihan Baru
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAdd}
            className="bg-white p-5 brutal-border brutal-shadow overflow-hidden mb-6"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-widest mb-1">Nama Tagihan (Kos, Wi-Fi, dll)</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-white brutal-border p-2 focus:outline-none focus:ring-4 focus:ring-[#FFE66D] font-bold" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-widest mb-1">Nominal</label>
                  <input type="text" inputMode="numeric" value={amount} onChange={handleAmountChange} className="w-full bg-white brutal-border p-2 focus:outline-none focus:ring-4 focus:ring-[#FFE66D] font-bold" required />
                 </div>
                 <div>
                  <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-widest mb-1">Jatuh Tempo</label>
                  <input type="number" min="1" max="31" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full bg-white brutal-border p-2 focus:outline-none focus:ring-4 focus:ring-[#FFE66D] font-bold" required />
                 </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-xs font-bold text-stone-500 hover:text-[#1A1A1A] uppercase">Batal</button>
                <button type="submit" className="px-6 py-2 bg-[#1A1A1A] text-white brutal-border text-xs font-bold uppercase tracking-widest hover:-translate-y-1 transition-transform">Simpan</button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.bills.length === 0 && !isAdding ? (
          <div className="col-span-full text-center py-12 bg-[#FDFCF8] brutal-border border-dashed border-2">
            <p className="text-[#1A1A1A] font-bold uppercase tracking-widest text-xs opacity-50">Belum ada tagihan rutin</p>
          </div>
        ) : null}

        {state.bills.map((bill) => {
          const isPaidThisMonth = bill.isPaid && bill.lastPaidMonth === currentMonthKey;
          const today = new Date().getDate();
          const isDueSoon = !isPaidThisMonth && bill.dueDate >= today && bill.dueDate - today <= 3;

          return (
            <motion.div
              key={bill.id}
              layout
              className={cn(
                "p-5 brutal-border transition-all flex items-center justify-between group",
                isPaidThisMonth ? "bg-stone-100 opacity-60 grayscale shadow-none" : "bg-[#4ECDC4] brutal-shadow hover:-translate-y-0.5 hover:brutal-shadow-sm",
                isDueSoon && "bg-[#FF6B6B] text-white survival-glow"
              )}
            >
              <div className="flex items-center flex-1 cursor-pointer min-w-0" onClick={() => toggleBillPaid(bill.id, currentMonthKey)}>
                <button className="mr-3 text-[#1A1A1A] focus:outline-none shrink-0" aria-label="Tandai lunas">
                  {isPaidThisMonth ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    <Circle className="h-6 w-6" />
                  )}
                </button>
                <div className="flex-1 min-w-0 mr-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="text-[9px] font-bold uppercase tracking-widest bg-[#1A1A1A] text-white px-1.5 py-0.5 truncate">
                      Tgl: {bill.dueDate}
                    </p>
                    {isDueSoon && (
                      <span className="text-[9px] font-bold uppercase tracking-widest bg-white text-[#FF6B6B] px-1.5 py-0.5 animate-pulse shrink-0">
                        DARURAT!
                      </span>
                    )}
                  </div>
                  <h3 className="font-display font-bold text-lg mt-1 mb-0.5 truncate leading-tight">{bill.name}</h3>
                  <div className="text-xl font-bold italic font-accent">
                    {formatIDR(bill.amount)}
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => removeBill(bill.id)}
                className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 p-2.5 bg-white brutal-border hover:bg-[#FF6B6B] hover:text-white transition-all text-[#1A1A1A] shrink-0"
                aria-label="Hapus tagihan"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
