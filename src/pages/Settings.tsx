import React, { useState } from 'react';
import { useStore } from '../store';
import { Settings as SettingsIcon, Save, LogOut, Trash2, User as UserIcon, AlertTriangle } from 'lucide-react';
import { formatNumberWithDots, parseNumberFromDots } from '../lib/utils';

export function Settings() {
  const { state, updateSettings, user, logout, deleteAccount } = useStore();
  const [settings, setSettings] = useState(state.settings);
  const [allowanceInput, setAllowanceInput] = useState(formatNumberWithDots(state.settings.allowanceAmount));
  const [survivalInput, setSurvivalInput] = useState(formatNumberWithDots(state.settings.survivalThreshold));

  const handleAllowanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNumberWithDots(e.target.value);
    setAllowanceInput(formatted);
    setSettings(s => ({ ...s, allowanceAmount: parseNumberFromDots(formatted) }));
  };

  const handleSurvivalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNumberWithDots(e.target.value);
    setSurvivalInput(formatted);
    setSettings(s => ({ ...s, survivalThreshold: parseNumberFromDots(formatted) }));
  };

  // Deletion States
  const [confirmEmail, setConfirmEmail] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (settings.allocations.wajib + settings.allocations.fleksibel + settings.allocations.darurat !== 100) {
      alert('Total alokasi harus berjumlah tepat 100%!');
      return;
    }
    updateSettings(settings);
    alert('Pengaturan berhasil disimpan!');
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError(null);
    if (!user) return;

    if (confirmEmail.trim().toLowerCase() !== user.email?.toLowerCase()) {
      setDeleteError('Email yang dimasukkan tidak cocok.');
      return;
    }

    setDeleteLoading(true);
    try {
      await deleteAccount();
      alert('Akun Anda berhasil dihapus sepenuhnya.');
    } catch (err: any) {
      console.error(err);
      setDeleteError(err.message || 'Gagal menghapus akun. Sesi Anda mungkin memerlukan masuk ulang kredo sensitif.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const loginProvider = user?.providerData[0]?.providerId === 'google.com' ? 'Google Sign-In' : 'Email & Password';

  return (
    <div className="max-w-5xl mx-auto w-full space-y-6">
      <div className="flex items-center mb-6 border-b-2 border-[#1A1A1A] pb-4">
        <SettingsIcon className="h-8 w-8 mr-3 text-[#1A1A1A]" />
        <h1 className="text-2xl font-display font-bold text-[#1A1A1A] tracking-tight uppercase">Pengaturan</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Kolom Kiri: Profil & Zona Bahaya */}
        <div className="space-y-6 w-full">
          {/* Profil Akun Section */}
          <div className="bg-white brutal-border brutal-shadow p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="h-24 w-24 shrink-0 rounded-full brutal-border border-4 bg-[#FFE66D] overflow-hidden flex items-center justify-center">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <UserIcon className="h-10 w-10 text-[#1A1A1A]" />
              )}
            </div>
            
            <div className="flex-1 w-full text-center sm:text-left flex flex-col justify-center sm:justify-start">
              <h2 className="text-xl font-display font-bold text-[#1A1A1A] tracking-tight">
                {user?.displayName || 'Sobat Kos'}
              </h2>
              <p className="text-xs font-bold text-stone-500 uppercase tracking-widest break-all mt-1">{user?.email}</p>
              
              <div className="mt-3 inline-flex items-center justify-center sm:justify-start mb-4">
                <span className="text-[10px] font-bold text-white bg-[#4ECDC4] px-2.5 py-1 brutal-border inline-block uppercase tracking-wider">
                  {loginProvider}
                </span>
              </div>
              
              <div className="flex justify-center sm:justify-start">
                <button
                  type="button"
                  onClick={() => {
                    logout();
                  }}
                  className="bg-white border-2 border-[#1A1A1A] px-4 py-2 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-stone-50 hover:-translate-y-0.5 active:translate-y-0 transition-all w-full sm:w-auto"
                >
                  <LogOut className="h-4 w-4 text-[#FF6B6B]" /> Keluar
                </button>
              </div>
            </div>
          </div>

          {/* Bahaya / Hapus Akun Section */}
          <div className="bg-[#FF6B6B]/10 brutal-border border-[#FF6B6B] p-6 space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-[#FF6B6B]" />
              <h2 className="font-bold text-[#FF6B6B] uppercase tracking-wider text-sm">Zona Bahaya</h2>
            </div>
            <p className="text-xs font-semibold text-stone-700 leading-relaxed uppercase">
              Menghapus akun Anda akan menghapus seluruh data transaksi, tagihan bulanan, pencatatan patungan, dan kustomisasi profilitas secara permanen dari server cloud rls. Tindakan ini tidak dapat dibatalkan.
            </p>

            {!showDeleteModal ? (
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="bg-[#FF6B6B] border-2 border-[#1A1A1A] text-white font-bold py-2.5 px-4 text-xs uppercase tracking-wider flex items-center gap-2 hover:-translate-y-0.5 transition-transform"
              >
                <Trash2 className="h-4 w-4" /> Hapus Akun KosFinance Saya
              </button>
            ) : (
              <form onSubmit={handleDeleteAccount} className="space-y-4 bg-white brutal-border p-4">
                <p className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wide">
                  Untuk mengonfirmasi, ketik email Anda yang terdaftar <span className="underline select-all bg-yellow-100 px-1 font-mono font-black">{user?.email}</span> di bawah ini:
                </p>
                <input
                  type="text"
                  required
                  value={confirmEmail}
                  onChange={e => setConfirmEmail(e.target.value)}
                  placeholder="Ketik email Anda di sini"
                  className="w-full p-2.5 bg-white brutal-border focus:outline-none focus:ring-4 focus:ring-[#FF6B6B] text-xs font-bold"
                />
                {deleteError && (
                  <p className="text-xs font-bold text-[#FF6B6B] uppercase">{deleteError}</p>
                )}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={deleteLoading}
                    className="bg-[#FF6B6B] text-white font-bold py-2 px-4 brutal-border text-xs uppercase hover:-translate-y-0.5 active:translate-y-0 transition-transform"
                  >
                    {deleteLoading ? 'Menghapus...' : 'Konfirmasi Hapus Akun'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setConfirmEmail('');
                      setDeleteError(null);
                    }}
                    className="bg-stone-100 text-stone-700 font-bold py-2 px-4 brutal-border text-xs uppercase hover:-translate-y-0.5"
                  >
                    Batal
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Kolom Kanan: Pengaturan Keuangan Form */}
        <div>
          <form onSubmit={handleSave} className="bg-white brutal-border brutal-shadow p-6 space-y-8">
            <div>
              <h2 className="font-bold text-[#1A1A1A] mb-4 border-b-2 border-[#1A1A1A] pb-2 uppercase tracking-widest text-sm inline-block">Siklus & Saldo</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#1A1A1A] mb-1 uppercase tracking-widest">Nominal Kiriman Rutin</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1A1A1A] font-bold">Rp</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={allowanceInput}
                      onChange={handleAllowanceChange}
                      className="w-full bg-white brutal-border p-3 pl-10 focus:outline-none focus:ring-4 focus:ring-[#FFE66D] font-bold"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1A1A1A] mb-1 uppercase tracking-widest">Tanggal Kiriman</label>
                    <input
                      type="number"
                      min="1" max="31"
                      value={settings.cycleStartDate}
                      onChange={e => setSettings(s => ({ ...s, cycleStartDate: Number(e.target.value) }))}
                      className="w-full bg-white brutal-border p-3 focus:outline-none focus:ring-4 focus:ring-[#FFE66D] font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#1A1A1A] mb-1 uppercase tracking-widest text-[#FF6B6B]">Batas Survival Mode</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={survivalInput}
                      onChange={handleSurvivalChange}
                      className="w-full bg-white brutal-border p-3 focus:outline-none focus:ring-4 focus:ring-[#FF6B6B] font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="font-bold text-[#1A1A1A] mb-2 border-b-2 border-[#1A1A1A] pb-2 uppercase tracking-widest text-sm inline-block">Alokasi Keranjang (%)</h2>
              <p className="text-xs font-bold opacity-70 mb-4 uppercase text-stone-500">Atur pembagian uang berdasarkan persentase. Harus berjumlah 100%.</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-[#1A1A1A] mb-1 bg-[#FFE66D] px-1 sm:px-2 py-1 brutal-border border-b-4 w-full text-center uppercase">Wajib</label>
                  <input
                    type="number"
                    value={settings.allocations.wajib}
                    onChange={e => setSettings(s => ({ ...s, allocations: { ...s.allocations, wajib: Number(e.target.value) } }))}
                    className="w-full bg-white brutal-border p-2 sm:p-3 focus:outline-none focus:ring-4 focus:ring-[#FFE66D] font-bold text-center border-2 border-[#1A1A1A] text-xs sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-white mb-1 bg-[#4ECDC4] px-1 sm:px-2 py-1 brutal-border border-b-4 w-full text-center uppercase">Fleksibel</label>
                  <input
                    type="number"
                    value={settings.allocations.fleksibel}
                    onChange={e => setSettings(s => ({ ...s, allocations: { ...s.allocations, fleksibel: Number(e.target.value) } }))}
                    className="w-full bg-white brutal-border p-2 sm:p-3 focus:outline-none focus:ring-4 focus:ring-[#4ECDC4] font-bold text-center border-2 border-[#1A1A1A] text-xs sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-white mb-1 bg-[#FF6B6B] px-1 sm:px-2 py-1 brutal-border border-b-4 w-full text-center uppercase border-[#1A1A1A]">Darurat</label>
                  <input
                    type="number"
                    value={settings.allocations.darurat}
                    onChange={e => setSettings(s => ({ ...s, allocations: { ...s.allocations, darurat: Number(e.target.value) } }))}
                    className="w-full bg-white brutal-border p-2 sm:p-3 focus:outline-none focus:ring-4 focus:ring-[#FF6B6B] font-bold text-center border-2 border-[#1A1A1A] text-xs sm:text-base"
                  />
                </div>
              </div>
              {settings.allocations.wajib + settings.allocations.fleksibel + settings.allocations.darurat !== 100 && (
                <p className="text-xs text-white bg-[#FF6B6B] brutal-border p-2 mt-4 font-bold uppercase inline-block w-full text-center">⚠️ Total alokasi harus 100%</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-[#1A1A1A] text-white brutal-border p-4 text-sm font-bold flex justify-center items-center hover:-translate-y-1 transition-transform uppercase tracking-widest mt-4"
            >
              <Save className="h-5 w-5 mr-2" />
              Simpan Pengaturan
            </button>
          </form>
        </div>
      </div>
      <div className="pb-10" />
    </div>
  );
}

