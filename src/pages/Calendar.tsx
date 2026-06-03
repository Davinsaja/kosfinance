import React, { useState } from 'react';
import { useStore } from '../store';
import { CalendarEvent, Transaction, Bill } from '../types';
import { ChevronLeft, ChevronRight, PlusCircle, Trash2, Edit2, Calendar as CalendarIcon, Info, Bell, Target, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export function Calendar() {
  const { state, addCalendarEvent, updateCalendarEvent, removeCalendarEvent } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState<'reminder' | 'target' | 'info'>('reminder');
  const [amount, setAmount] = useState('');

  const presets = [
    { label: 'Uang Kos BULANAN 🏠', title: 'Bayar uang kos bulanan', type: 'reminder' as const, amount: '1200000' },
    { label: 'Paket Internet 📶', title: 'Beli paket data/wifi', type: 'reminder' as const, amount: '150000' },
    { label: 'Token Listrik ⚡', title: 'Isi ulang token listrik kamar', type: 'reminder' as const, amount: '100000' },
    { label: 'Belanja Mingguan 🛒', title: 'Belanja mingguan pasar', type: 'info' as const, amount: '200000' },
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Helper date generators
  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay(); // 0 is Sunday

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month); // Adjust for Sunday index (0)
  
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Convert day number to YYYY-MM-DD
  const formatDateStr = (dayNum: number) => {
    const d = new Date(year, month, dayNum);
    const yStr = d.getFullYear();
    const mStr = String(d.getMonth() + 1).padStart(2, '0');
    const dStr = String(d.getDate()).padStart(2, '0');
    return `${yStr}-${mStr}-${dStr}`;
  };

  // Extract events, transactions, and bills for a specific date string (YYYY-MM-DD)
  const getDailyData = (dateStr: string) => {
    const txs = state.transactions.filter(t => t.date.split('T')[0] === dateStr);
    const evs = (state.calendarEvents || []).filter(e => e.date === dateStr);
    
    // Bills due date check
    const dayOnly = parseInt(dateStr.split('-')[2], 10);
    const dueBills = state.bills.filter(b => b.dueDate === dayOnly);

    return { txs, evs, dueBills };
  };

  const activeDailyData = getDailyData(selectedDateStr);

  const handleSubmitEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingEvent) {
      const updated: CalendarEvent = {
        ...editingEvent,
        title: title.trim(),
        type: eventType,
        amount: amount ? Number(amount) : undefined
      };
      await updateCalendarEvent(updated);
      setEditingEvent(null);
    } else {
      const newEvent: CalendarEvent = {
        id: 'ce_' + Date.now().toString(),
        title: title.trim(),
        date: selectedDateStr,
        type: eventType,
        amount: amount ? Number(amount) : undefined
      };
      await addCalendarEvent(newEvent);
    }

    // Reset form
    setTitle('');
    setAmount('');
    setShowForm(false);
  };

  const handleDeleteEvent = async (id: string) => {
    await removeCalendarEvent(id);
  };

  // Render month grid cells
  const daysArray = Array.from({ length: daysInMonth }, (_, index) => index + 1);
  const emptyPreCells = Array.from({ length: firstDayIndex }, (_, index) => null);
  const totalGridCells = [...emptyPreCells, ...daysArray];

  // Helper formats
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  const formatDateHeading = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="max-w-5xl mx-auto w-full space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-[#1A1A1A] pb-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-[#1A1A1A] tracking-tight">Kalender Kos</h1>
          <p className="text-xs text-stone-500 mt-1 uppercase font-bold tracking-widest flex items-center gap-1.5">
            <CalendarIcon className="h-3.5 w-3.5" /> Jadwal Kegiatan & Arus Kas Anak Kos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 brutal-border bg-white hover:bg-stone-50 active:scale-95 transition-all text-[#1A1A1A]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="font-display font-bold text-sm uppercase tracking-wide px-3 py-1.5 bg-[#FFE66D] text-[#1A1A1A] brutal-border">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-2 brutal-border bg-white hover:bg-stone-50 active:scale-95 transition-all text-[#1A1A1A]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Kolom Kiri: Tampilan Kalender Bulanan */}
        <div className="md:col-span-2">
          <div className="bg-white brutal-border brutal-shadow p-4">
            {/* Days of Week label */}
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs uppercase tracking-wider text-stone-500 mb-2 py-1">
              <span>Ming</span>
              <span>Sen</span>
              <span>Sel</span>
              <span>Rab</span>
              <span>Kam</span>
              <span>Jum</span>
              <span>Sab</span>
            </div>

            {/* Calendar Cells */}
            <div className="grid grid-cols-7 gap-2">
              {totalGridCells.map((dayNum, idx) => {
                if (dayNum === null) {
                  return <div key={`empty-${idx}`} className="aspect-square bg-stone-50/50 rounded-none border border-stone-200 border-dashed" />;
                }

                const thisCellDateStr = formatDateStr(dayNum);
                const isSelected = selectedDateStr === thisCellDateStr;
                const isToday = new Date().toISOString().split('T')[0] === thisCellDateStr;
                
                // Fetch details to paint circles/pills for active days
                const { txs, evs, dueBills } = getDailyData(thisCellDateStr);
                const hasActivity = txs.length > 0 || evs.length > 0 || dueBills.length > 0;

                return (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedDateStr(thisCellDateStr)}
                    key={`day-${dayNum}`}
                    className={`aspect-square p-1.5 relative flex flex-col justify-between transition-all outline-none text-left border-2
                      ${isSelected 
                        ? 'bg-[#FFE66D] border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] scale-102 z-10' 
                        : isToday
                          ? 'bg-[#FFE66D]/20 border-[#1A1A1A] font-extrabold'
                          : 'bg-white border-stone-200 hover:border-stone-500'}`}
                  >
                    <span className={`text-xs md:text-sm font-bold leading-none ${isToday ? 'text-[#FF6B6B]' : 'text-[#1A1A1A]'}`}>
                      {dayNum}
                    </span>

                    {/* Indicators */}
                    {hasActivity && (
                      <div className="flex flex-wrap gap-0.5 justify-end">
                        {txs.length > 0 && (
                          <span className="h-1.5 w-1.5 rounded-full bg-[#FF6B6B]" title="Ada Pengeluaran" />
                        )}
                        {dueBills.length > 0 && (
                          <span className="h-1.5 w-1.5 rounded-full bg-[#4ECDC4]" title="Jatuh Tempo Tagihan" />
                        )}
                        {evs.length > 0 && (
                          <span className="h-1.5 w-1.5 rounded-full bg-[#FFE66D] border border-stone-500" title="Ada Reminder" />
                        )}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Rincian Hari yang Dipilih */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white brutal-border brutal-shadow p-5">
            <h3 className="font-bold text-[#1A1A1A] uppercase tracking-wider text-xs border-b-2 border-[#1A1A1A] pb-2 mb-4">
              Agenda Hari Ini
            </h3>
            
            <p className="text-xs font-black uppercase text-stone-500 mb-4 bg-stone-100 p-2 border border-stone-300">
              {formatDateHeading(selectedDateStr)}
            </p>

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {activeDailyData.txs.length === 0 && 
               activeDailyData.dueBills.length === 0 && 
               activeDailyData.evs.length === 0 ? (
                <div className="text-stone-400 py-6 text-center">
                  <Info className="h-8 w-8 mx-auto stroke-1.5 mb-2" />
                  <p className="text-[11px] font-bold uppercase tracking-widest">Tidak ada jadwal atau transaksi</p>
                </div>
              ) : (
                <>
                  {/* Due Bills Section */}
                  {activeDailyData.dueBills.map(b => (
                    <div key={b.id} className="bg-[#4ECDC4]/10 border-2 border-[#4ECDC4] p-3 flex flex-col gap-1">
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-black uppercase text-white bg-[#4ECDC4] px-1.5 py-0.5 mt-0.5">Jatuh Tempo</span>
                        <span className="text-xs font-extrabold text-[#1A1A1A]">{formatIDR(b.amount)}</span>
                      </div>
                      <h4 className="font-bold text-xs uppercase text-[#1A1A1A] mt-1 line-clamp-1">{b.name}</h4>
                      <p className="text-[9px] font-bold text-stone-500">Status: {b.isPaid ? 'SUDAH DIBAYAR' : 'BELUM DIBAYAR'}</p>
                    </div>
                  ))}

                  {/* Transactions Section */}
                  {activeDailyData.txs.map(tx => {
                    const isIncome = tx.category === 'pemasukan';
                    return (
                      <div 
                        key={tx.id} 
                        className={cn(
                          "border-2 p-2.5 flex flex-col gap-1",
                          isIncome ? "bg-[#10B981]/10 border-[#10B981]" : "bg-[#FF6B6B]/10 border-[#FF6B6B]"
                        )}
                      >
                        <div className="flex justify-between items-start">
                          <span className={cn(
                            "text-[9px] font-black uppercase text-white px-1.5 py-0.5",
                            isIncome ? "bg-[#10B981]" : "bg-[#FF6B6B]"
                          )}>
                            {isIncome ? "Pemasukan" : "Pengeluaran"}
                          </span>
                          <span className={cn(
                            "text-xs font-bold",
                            isIncome ? "text-[#10B981]" : "text-[#FF6B6B]"
                          )}>
                            {isIncome ? "+" : "-"}{formatIDR(tx.amount)}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs uppercase text-[#1A1A1A] mt-1 line-clamp-1">{tx.description}</h4>
                        <div className="flex gap-1 items-center mt-1">
                          <span className="text-[8px] font-bold px-1 py-0.5 bg-stone-200 text-stone-700 uppercase">
                            {isIncome ? "Uang Masuk" : tx.category}
                          </span>
                          {tx.tag && <span className="text-[8px] font-bold px-1 py-0.5 bg-stone-800 text-white uppercase">{tx.tag}</span>}
                        </div>
                      </div>
                    );
                  })}

                  {/* User Reminders/Notes Section */}
                  {activeDailyData.evs.map(ev => (
                    <div key={ev.id} className="bg-[#FFE66D]/15 border-2 border-[#1A1A1A] p-2.5 flex justify-between items-center gap-2 hover:bg-[#FFE66D]/20 transition-colors">
                      <div className="flex gap-2 items-start">
                        <div className="p-1 bg-[#FFE66D] border border-[#1A1A1A] shrink-0 text-stone-800 mt-0.5">
                          {ev.type === 'reminder' ? <Bell className="h-3 w-3" /> : ev.type === 'target' ? <Target className="h-3 w-3" /> : <Info className="h-3 w-3" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs uppercase text-[#1A1A1A] leading-tight break-all">{ev.title}</h4>
                          {ev.amount ? <p className="text-[10px] font-bold text-[#1A1A1A] mt-0.5">Rencana: {formatIDR(ev.amount)}</p> : null}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            setEditingEvent(ev);
                            setTitle(ev.title);
                            setEventType(ev.type);
                            setAmount(ev.amount ? String(ev.amount) : '');
                            setShowForm(true);
                          }}
                          title="Edit Agenda"
                          className="text-stone-500 hover:text-blue-600 p-1.5 bg-white border border-[#1A1A1A] hover:shadow-[1px_1px_0px_#1A1A1A] transition-all"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(ev.id)}
                          title="Hapus Agenda"
                          className="text-stone-500 hover:text-red-500 p-1.5 bg-white border border-[#1A1A1A] hover:shadow-[1px_1px_0px_#1A1A1A] transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Quick Add Toggle with Presets & Editing Status */}
            <div className="mt-5 border-t border-stone-200 pt-4">
              {!showForm ? (
                <button
                  onClick={() => {
                    setEditingEvent(null);
                    setTitle('');
                    setEventType('reminder');
                    setAmount('');
                    setShowForm(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-[#FFE66D] border-2 border-[#1A1A1A] py-2.5 font-bold text-xs uppercase tracking-wider shadow-[2px_2px_0px_#1A1A1A] hover:-translate-y-0.5 active:translate-y-0.5 transition-all text-[#1A1A1A]"
                >
                  <PlusCircle className="h-4 w-4" /> Pengingat Kegiatan
                </button>
              ) : (
                <form onSubmit={handleSubmitEvent} className="space-y-4 bg-stone-50 border-2 border-[#1A1A1A] p-4 shadow-[3px_3px_0px_#1A1A1A]">
                  <div className="flex justify-between items-center border-b border-stone-200 pb-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5 text-[#FF6B6B]" /> {editingEvent ? 'Ubah Agenda Kegiatan' : 'Tambah Agenda Kegiatan'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingEvent(null);
                        setTitle('');
                        setAmount('');
                      }}
                      className="text-[#FF6B6B] font-extrabold hover:underline text-[10px] uppercase tracking-wider"
                    >
                      Batal [X]
                    </button>
                  </div>

                  {/* Templates / Presets (Displayed only when not editing) */}
                  {!editingEvent && (
                    <div className="space-y-1.5">
                      <p className="text-[9px] font-bold text-stone-500 uppercase tracking-wider">Isian Cepat Preset:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {presets.map((p, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setTitle(p.title);
                              setEventType(p.type);
                              setAmount(p.amount);
                            }}
                            className="text-[9px] font-bold bg-white text-stone-700 hover:bg-[#FFE66D]/30 border border-stone-400 py-1 px-1.5 transition-colors uppercase"
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {editingEvent && (
                    <div className="bg-[#FFE66D]/20 border border-dashed border-[#FFE66D] p-2 text-[10px] font-bold uppercase text-stone-600">
                      Anda sedang mengedit agenda: <span className="text-[#1A1A1A] italic">"{editingEvent.title}"</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider mb-1 text-stone-500">Nama Pengingat</label>
                    <input
                      required
                      type="text"
                      className="w-full bg-white brutal-border p-2 focus:outline-none focus:ring-2 focus:ring-[#FFE66D] font-bold text-xs border border-stone-400"
                      placeholder="Contoh: Belanja kuota harian"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider mb-1 text-stone-500">Jenis Jurnal</label>
                      <select
                        className="w-full bg-white brutal-border p-2 focus:outline-none focus:ring-2 focus:ring-[#FFE66D] font-bold text-xs border border-stone-400"
                        value={eventType}
                        onChange={(e) => setEventType(e.target.value as any)}
                      >
                        <option value="reminder">🔔 Alarm/Sewa</option>
                        <option value="target">🎯 Rencana Tabung</option>
                        <option value="info">📝 Kegiatan Lain</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider mb-1 text-stone-500">Estimasi Uang (Rp)</label>
                      <input
                        type="number"
                        className="w-full bg-white brutal-border p-2 focus:outline-none focus:ring-2 focus:ring-[#FFE66D] font-bold text-xs border border-stone-400"
                        placeholder="Rp"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#1A1A1A] text-white py-2.5 font-bold text-xs uppercase tracking-widest brutal-border hover:bg-black transition-colors"
                  >
                    {editingEvent ? 'Simpan Perubahan' : 'Simpan Agenda'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
