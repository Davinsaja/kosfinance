import React, { useState } from 'react';
import { useStore } from '../store';
import { formatIDR, cn, formatNumberWithDots, parseNumberFromDots } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Users, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function SplitBill() {
  const { state, addSplitSession } = useStore();
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(formatNumberWithDots(e.target.value));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseNumberFromDots(amount);
    if (!title || !parsedAmount) return;
    
    const newSession = {
      id: Date.now().toString(),
      title,
      totalAmount: parsedAmount,
      date: new Date().toISOString(),
      members: [], // Start with no members, user adds themselves in detail view or adds others
    };
    
    addSplitSession(newSession);
    setIsAdding(false);
    navigate(`/patungan/${newSession.id}`);
  };

  return (
    <div className="max-w-5xl mx-auto w-full space-y-6">
      <div className="flex justify-between items-center mb-6 border-b-2 border-[#1A1A1A] pb-4">
        <h1 className="text-2xl font-display font-bold text-[#1A1A1A] tracking-tight uppercase">Patungan</h1>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-[#FFE66D] text-[#1A1A1A] brutal-border px-4 py-2 font-bold uppercase tracking-widest text-xs flex items-center hover:-translate-y-1 transition-transform"
        >
          <Plus className="h-4 w-4 mr-1" />
          Bikin Sesi
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleCreate}
            className="bg-white p-5 brutal-border brutal-shadow overflow-hidden mb-6"
          >
            <h3 className="font-bold text-[#1A1A1A] mb-4 uppercase tracking-widest text-xs border-b-2 border-[#1A1A1A] pb-2 inline-block">Sesi Patungan Baru</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-widest mb-1">Nama Patungan (Misal: Uang Galon & Gas)</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-white brutal-border p-3 focus:outline-none focus:ring-4 focus:ring-[#FFE66D] font-bold" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-widest mb-1">Total Biaya Keseluruhan</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 font-bold text-sm">Rp</span>
                  <input type="text" inputMode="numeric" value={amount} onChange={handleAmountChange} className="w-full bg-white brutal-border p-3 pl-10 focus:outline-none focus:ring-4 focus:ring-[#FFE66D] font-bold" required />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-xs font-bold text-stone-500 hover:text-[#1A1A1A] uppercase">Batal</button>
                <button type="submit" className="px-6 py-2 bg-[#1A1A1A] text-white brutal-border text-xs font-bold uppercase tracking-widest hover:-translate-y-1 transition-transform">Lanjut</button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {state.splitSessions.length === 0 && !isAdding ? (
          <div className="col-span-full text-center py-12 px-4 bg-[#FDFCF8] brutal-border border-dashed border-2">
            <div className="h-12 w-12 bg-[#FFE66D] brutal-border flex items-center justify-center mx-auto mb-3">
              <Users className="h-6 w-6 text-[#1A1A1A]" />
            </div>
            <p className="text-[#1A1A1A] font-bold uppercase tracking-widest text-sm">Belum ada patungan</p>
            <p className="text-[#1A1A1A] opacity-60 font-bold text-[10px] uppercase mt-1">Bikin sesi baru untuk bagi-bagi bayaran sama teman kos.</p>
          </div>
        ) : null}

        {state.splitSessions.map((session) => {
          const paidCount = session.members.filter(m => m.hasPaid).length;
          const totalMembers = session.members.length;
          const isSettled = totalMembers > 0 && paidCount === totalMembers;

          return (
            <Link 
              to={`/patungan/${session.id}`} 
              key={session.id}
              className="block"
            >
              <div className={cn(
                "p-5 brutal-border flex flex-col hover:-translate-y-1 hover:-translate-x-1 hover:brutal-shadow transition-all group h-full",
                isSettled ? "bg-[#10B981] text-white" : "bg-white text-[#1A1A1A] brutal-shadow-sm"
              )}>
                <div className="flex justify-between items-start w-full gap-3 h-full">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-lg leading-snug line-clamp-2">{session.title}</h3>
                    <div className="text-[10px] font-bold uppercase tracking-widest flex flex-wrap items-center gap-3 mt-2 opacity-80">
                      <span className="flex items-center"><Users className="h-3 w-3 mr-1" /> {totalMembers} orang terlibat</span>
                      {isSettled ? (
                        <span className="bg-white text-[#10B981] px-1 rounded-sm">LUNAS</span>
                      ) : (
                        <span className="bg-[#FFE66D] text-[#1A1A1A] px-1 rounded-sm">{paidCount}/{totalMembers} TERKUMPUL</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0 flex flex-col justify-between h-full items-end min-h-[60px]">
                    <p className={cn("font-display font-bold text-xl", !isSettled && "text-[#FF6B6B]")}>{formatIDR(session.totalAmount)}</p>
                    <p className="text-[9px] font-bold mt-2 tracking-widest flex items-center justify-end group-hover:underline">
                      DETAIL <ChevronRight className="h-3 w-3 ml-1 inline" />
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
