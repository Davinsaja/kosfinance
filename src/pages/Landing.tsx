import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { formatIDR, formatNumberWithDots, parseNumberFromDots } from '../lib/utils';
import { motion } from 'motion/react';
import { Wallet, Calendar, AlertTriangle } from 'lucide-react';

export function Landing() {
  const navigate = useNavigate();
  const { state, updateSettings, markConfigured } = useStore();
  const [step, setStep] = useState(1);
  const [allowance, setAllowance] = useState(formatNumberWithDots(state.settings.allowanceAmount));
  const [cycleDate, setCycleDate] = useState(state.settings.cycleStartDate.toString());
  const [survival, setSurvival] = useState(formatNumberWithDots(state.settings.survivalThreshold));

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else {
      updateSettings({
        ...state.settings,
        allowanceAmount: parseNumberFromDots(allowance) || 1500000,
        cycleStartDate: Number(cycleDate) || 1,
        survivalThreshold: parseNumberFromDots(survival) || 100000,
      });
      markConfigured();
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white brutal-border brutal-shadow overflow-hidden"
      >
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-[#FFE66D] brutal-border flex items-center justify-center">
              <Wallet className="h-8 w-8 text-[#1A1A1A]" />
            </div>
          </div>
          <h1 className="text-3xl font-display font-bold text-center text-[#1A1A1A] mb-2 tracking-tight">Halo Anak Kos! 👋</h1>
          <p className="text-center text-stone-500 mb-8 font-medium">
            Selamat datang di KosFinance. Kita setup dulu biar duit kiriman aman.
          </p>

          <div className="space-y-6">
            {step === 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <label className="block text-sm font-bold text-[#1A1A1A] uppercase tracking-widest">Biasanya dapat kiriman berapa sebulan?</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 font-bold">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={allowance}
                    onChange={(e) => setAllowance(formatNumberWithDots(e.target.value))}
                    className="w-full bg-white brutal-border py-3 pl-12 pr-4 text-xl font-display font-bold focus:outline-none focus:ring-4 focus:ring-[#FFE66D]"
                    placeholder="1.500.000"
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <label className="block text-sm font-bold text-[#1A1A1A] uppercase tracking-widest flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-[#4ECDC4]" />
                  Tanggal berapa biasanya kiriman masuk?
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={cycleDate}
                  onChange={(e) => setCycleDate(e.target.value)}
                  className="w-full bg-white brutal-border py-3 px-4 text-xl font-display font-bold focus:outline-none focus:ring-4 focus:ring-[#4ECDC4]"
                  placeholder="1"
                />
                <p className="text-xs text-stone-500 font-medium">Siklus keuanganmu akan dihitung dari tanggal ini, bukan tanggal 1 kalender.</p>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <label className="block text-sm font-bold text-[#1A1A1A] uppercase tracking-widest flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2 text-[#FF6B6B]" />
                  Batas Modus Survival (Sisa Saldo)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 font-bold">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={survival}
                    onChange={(e) => setSurvival(formatNumberWithDots(e.target.value))}
                    className="w-full bg-white brutal-border py-3 pl-12 pr-4 text-xl font-display font-bold focus:outline-none focus:ring-4 focus:ring-[#FF6B6B]"
                    placeholder="100.000"
                  />
                </div>
                <p className="text-xs text-stone-500 font-medium">Bila saldo menyentuh angka ini sebelum kiriman berikutnya, Modus Survival akan aktif untuk menghemat.</p>
              </motion.div>
            )}

            <button
              onClick={handleNext}
              className="w-full bg-[#1A1A1A] text-white brutal-border font-bold py-4 uppercase tracking-widest hover:-translate-y-1 transition-transform"
            >
              {step < 3 ? 'Lanjut' : 'Mulai Sekarang'}
            </button>
          </div>
          
          <div className="flex justify-center mt-6 space-x-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-2 transition-all brutal-border ${step === s ? 'w-6 bg-[#1A1A1A]' : 'w-2 bg-white'}`} />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
