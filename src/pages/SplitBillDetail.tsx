import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { formatIDR, cn } from '../lib/utils';
import { ArrowLeft, CheckCircle2, Circle, UserPlus, Trash2, Share2 } from 'lucide-react';

export function SplitBillDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, toggleSplitMemberPaid, addSplitMember, removeSplitMember, removeSplitSession } = useStore();
  const [newMemberName, setNewMemberName] = useState('');

  const session = state.splitSessions.find(s => s.id === id);

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-3xl border border-stone-200 text-center">
        <p className="text-stone-500 mb-4">Sesi patungan tidak ditemukan.</p>
        <button onClick={() => navigate('/patungan')} className="text-orange-600 font-semibold">Kembali</button>
      </div>
    );
  }

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    
    addSplitMember(session.id, {
      id: Date.now().toString(),
      name: newMemberName,
      hasPaid: false,
    });
    setNewMemberName('');
  };

  const handleDeleteSession = () => {
    removeSplitSession(session.id);
    navigate('/patungan');
  };

  const totalMembers = session.members.length;
  const costPerPerson = totalMembers > 0 ? session.totalAmount / totalMembers : 0;
  const paidCount = session.members.filter(m => m.hasPaid).length;
  const isSettled = totalMembers > 0 && paidCount === totalMembers;

  const handleShare = () => {
    // Generate a simple text to share
    const unpaid = session.members.filter(m => !m.hasPaid).map(m => m.name).join(', ');
    const text = `Patungan: ${session.title}\nTotal: ${formatIDR(session.totalAmount)}\nPer Orang: ${formatIDR(costPerPerson)}\n\nYang belum bayar: ${unpaid || '-'}\n\nDitunggu transferannya ya!`;
    navigator.clipboard.writeText(text);
    alert('Teks tagihan disalin ke clipboard!');
  };

  return (
    <div className="max-w-5xl mx-auto w-full space-y-6">
      <div className="flex items-center justify-between mb-6 border-b-2 border-[#1A1A1A] pb-4">
        <div className="flex items-center">
          <button onClick={() => navigate('/patungan')} className="p-2 -ml-2 rounded-none hover:bg-stone-200 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-display font-bold ml-2 text-[#1A1A1A] tracking-tight uppercase">Detail Patungan</h1>
        </div>
        <div className="flex space-x-2">
          <button onClick={handleShare} className="p-2 text-[#1A1A1A] hover:bg-[#FFE66D] brutal-border bg-white transition-colors">
            <Share2 className="h-5 w-5" />
          </button>
          <button onClick={handleDeleteSession} className="p-2 text-[#1A1A1A] hover:text-white hover:bg-[#FF6B6B] brutal-border bg-white transition-colors">
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Kolom Kiri: Ringkasan Sesi Patungan */}
        <div className={cn(
          "p-6 brutal-border text-center overflow-hidden transition-all",
          isSettled ? "bg-[#10B981] text-white" : "bg-[#FFE66D] text-[#1A1A1A] brutal-shadow"
        )}>
          <h2 className="text-3xl font-display font-bold leading-tight mb-2 uppercase">{session.title}</h2>
          <p className="text-sm font-bold opacity-80 uppercase tracking-widest mb-6 border-b-2 border-current pb-4 inline-block">Total: {formatIDR(session.totalAmount)}</p>
          
          <div className="bg-white brutal-border p-6 shadow-none max-w-sm mx-auto">
            <p className="text-xs text-[#1A1A1A] uppercase tracking-widest font-bold mb-2">Per Orang Bayar</p>
            <p className={cn("text-4xl md:text-5xl font-display font-bold", isSettled ? "text-[#10B981]" : "text-[#FF6B6B]")}>{formatIDR(costPerPerson)}</p>
          </div>
        </div>

        {/* Kolom Kanan: Pengelolaan Anggota */}
        <div className="bg-white brutal-border brutal-shadow p-6">
          <h3 className="font-bold text-[#1A1A1A] mb-4 flex justify-between items-center tracking-widest text-xs uppercase border-b-2 border-[#1A1A1A] pb-2">
            <span>Anggota Patungan</span>
            <span className="bg-[#1A1A1A] text-white px-3 py-1 brutal-border font-bold">
              {paidCount} / {totalMembers} LUNAS
            </span>
          </h3>
          
          <form onSubmit={handleAddMember} className="flex gap-2 mb-6">
            <input
              type="text"
              value={newMemberName}
              onChange={e => setNewMemberName(e.target.value)}
              placeholder="Tambah nama teman..."
              className="flex-1 bg-white brutal-border px-4 py-3 focus:outline-none focus:ring-4 focus:ring-[#4ECDC4] text-sm font-bold"
            />
            <button type="submit" className="bg-[#1A1A1A] text-white px-5 py-3 brutal-border hover:-translate-y-1 transition-transform flex items-center shrink-0">
              <UserPlus className="h-5 w-5" />
            </button>
          </form>

          {totalMembers === 0 ? (
            <p className="text-center text-sm font-bold uppercase py-10 opacity-50">Belum ada teman yang ditambahkan.</p>
          ) : (
            <div className="space-y-3">
              {session.members.map(m => (
                <div key={m.id} className={cn(
                  "flex items-center justify-between p-4 brutal-border transition-all group",
                  m.hasPaid ? "bg-stone-100 opacity-60 grayscale" : "bg-white brutal-shadow-sm hover:-translate-x-0.5 hover:-translate-y-0.5"
                )}
                >
                  <div className="flex items-center flex-1 cursor-pointer min-w-0 mr-2" onClick={() => toggleSplitMemberPaid(session.id, m.id)}>
                    <button 
                      className="mr-3 text-[#1A1A1A] focus:outline-none shrink-0"
                      aria-label="Tandai bayar"
                    >
                      {m.hasPaid ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                    </button>
                    <span className={cn("font-bold text-base uppercase tracking-wide truncate", m.hasPaid ? "line-through text-stone-500" : "text-[#1A1A1A]")}>
                      {m.name}
                    </span>
                  </div>
                  <div className="flex items-center shrink-0">
                    {m.hasPaid && <span className="text-[9px] font-bold text-white bg-[#1A1A1A] uppercase tracking-widest px-2 py-1 brutal-border mr-2.5">Lunas</span>}
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeSplitMember(session.id, m.id); }}
                      className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 p-2 bg-white brutal-border hover:bg-[#FF6B6B] hover:text-white transition-colors"
                      aria-label="Hapus anggota"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

