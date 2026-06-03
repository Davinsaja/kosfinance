import React, { useState } from 'react';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet, Mail, Lock, AlertCircle, CheckCircle, Chrome, Eye, EyeOff } from 'lucide-react';
import { useStore } from '../store';

export function Login({ onBack }: { onBack?: () => void }) {
  const [view, setView] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const resetFormState = () => {
    setError(null);
    setSuccess(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleGoogleSignIn = async () => {
    resetFormState();
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal login menggunakan Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAction = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFormState();
    if (!email || !password) {
      setError('Email dan Password wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      if (view === 'login') {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        // Verify user email
        if (!userCred.user.emailVerified) {
          // Re-send verification link to make it foolproof
          await sendEmailVerification(userCred.user);
          // Sign them out immediately so they cannot bypass the gateway
          await auth.signOut();
          setError('Email Anda belum diverifikasi! Kami baru saja mengirimkan tautan verifikasi baru ke email Anda. Silakan klik link verifikasi tersebut di kotak masuk (inbox) atau spam Anda sebelum melakukan login.');
          setLoading(false);
          return;
        }
      } else if (view === 'signup') {
        if (password.length < 8) {
          setError('Password minimal harus terdiri dari 8 karakter.');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('Konfirmasi password tidak cocok.');
          setLoading(false);
          return;
        }
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        try {
          await sendEmailVerification(userCred.user);
          // Sign out newly registered user so they cannot bypass verification
          await auth.signOut();
          setSuccess('Pendaftaran berhasil! Tautan verifikasi telah dikirim ke email Anda. Harap verifikasi akun Anda terlebih dahulu, kemudian silakan masuk.');
          setView('login');
          // Clear passwords
          setPassword('');
          setConfirmPassword('');
        } catch (vErr) {
          console.error('Email verification error', vErr);
          setSuccess('Daftar berhasil! Tetapi gagal mengirim tautan verifikasi otomatis.');
          setView('login');
        }
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Email atau password tidak valid atau belum terdaftar.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Email sudah digunakan oleh pengguna lain.');
      } else {
        setError(err.message || 'Terjadi kesalahan sistem.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFormState();
    if (!email) {
      setError('Masukkan alamat email Anda terlebih dahulu.');
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess('Tautan untuk mengatur ulang password berhasil dikirim! Silakan periksa kotak masuk email Anda.');
      setView('login');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal mengirim link reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full bg-white brutal-border brutal-shadow overflow-hidden flex flex-col md:flex-row min-h-[600px] rounded-xl"
      >
        {/* Left Side: Visual/Branding Panel (Desktop & Tablet) */}
        <div className="hidden md:flex md:w-1/2 bg-[#FFE66D] border-r-4 border-[#1A1A1A] p-10 flex-col justify-between relative overflow-hidden">
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#1A1A1A_1px,transparent_1px),linear-gradient(to_bottom,#1A1A1A_1px,transparent_1px)] bg-[size:16px_16px]"></div>
          
          <div className="relative z-10">
            <div className="inline-block bg-[#1A1A1A] text-[#FFE66D] font-display font-black uppercase text-[10px] tracking-widest px-3 py-1.5 mb-6 brutal-border">
              KOSFINANCE v1.0
            </div>
            <h2 className="text-4xl font-display font-black text-[#1A1A1A] leading-tight tracking-tight uppercase">
              Sobat<br />Finansial<br />Anak Kos.
            </h2>
            <p className="text-stone-800 font-medium text-sm mt-4 leading-relaxed max-w-xs">
              Udah bukan jamannya akhir bulan makan mie instan dua bungkus sehari. Catat, pantau, dan amankan kiriman bulanan secara cerdas!
            </p>
          </div>

          <div className="space-y-4 relative z-10">
            {/* mini status cards */}
            <div className="bg-[#FDFCF8] brutal-border p-4 shadow-[3px_3px_0px_#1A1A1A] max-w-xs -rotate-1">
              <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Status Kantong Akhir Bulan</div>
              <div className="text-sm font-display font-black text-[#FF6B6B] uppercase mt-0.5">⚠️ SIAGA I SURVIVAL</div>
            </div>
            
            <div className="bg-[#4ECDC4] brutal-border p-4 shadow-[3px_3px_0px_#1A1A1A] max-w-xs rotate-1 translate-x-2">
              <div className="text-[10px] font-bold text-[#1A1A1A]/70 uppercase tracking-wider">Tabungan Celengan</div>
              <div className="text-sm font-display font-black text-[#1A1A1A] uppercase mt-0.5">💰 AMAN & MANDIRI</div>
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Forms */}
        <div className="w-full md:w-1/2 p-6 sm:p-10 flex flex-col justify-center">
          {/* Mobile Elegant Branding Header */}
          <div className="flex flex-col items-center mb-6 md:hidden">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 2 }}
              className="h-16 w-16 bg-[#FFE66D] brutal-border flex items-center justify-center shadow-[4px_4px_0px_#1A1A1A] rounded-lg mb-3"
            >
              <Wallet className="h-8 w-8 text-[#1A1A1A]" />
            </motion.div>
            <h1 className="text-2xl font-display font-bold text-[#1A1A1A] tracking-tight">KOSFINANCE</h1>
            <p className="text-xs text-stone-500 text-center font-medium mt-1">
              Catat keuangan kosmu, aman tersimpan selamanya
            </p>
          </div>

          <div className="hidden md:block">
            <h1 className="text-3xl font-display font-bold text-[#1A1A1A] mb-1 tracking-tight">KOSFINANCE</h1>
            <p className="text-stone-500 mb-6 font-medium">
              Catat keuangan kosmu, aman tersimpan selamanya
            </p>
          </div>

          {/* Secure DB Info Pill */}
          <div className="inline-flex items-center gap-1.5 bg-[#4ECDC4]/10 text-[#1a6e66] border-2 border-[#1A1A1A] py-1.5 px-3 self-center md:self-start text-[10px] font-black uppercase tracking-wider mb-6 shadow-[2px_2px_0px_#1A1A1A] rounded">
            <span className="w-2 h-2 rounded-full bg-[#4ECDC4] animate-ping" />
            🔒 CLOUD STORAGE AKTIF & AMAN
          </div>

          {/* New Interactive Segmented Tab Control (Mobile-Friendly) */}
          {view !== 'forgot' && (
            <div className="grid grid-cols-2 p-1 bg-stone-100 border-4 border-[#1A1A1A] mb-6 rounded-lg font-bold">
              <button
                type="button"
                onClick={() => { setView('login'); resetFormState(); }}
                className={`py-2.5 text-xs uppercase font-extrabold tracking-wider transition-all rounded ${
                  view === 'login'
                    ? 'bg-[#1A1A1A] text-white shadow-[2px_2px_0px_#FFE66D]'
                    : 'text-stone-600 hover:bg-stone-200'
                }`}
              >
                Masuk
              </button>
              <button
                type="button"
                onClick={() => { setView('signup'); resetFormState(); }}
                className={`py-2.5 text-xs uppercase font-extrabold tracking-wider transition-all rounded ${
                  view === 'signup'
                    ? 'bg-[#1A1A1A] text-white shadow-[2px_2px_0px_#4ECDC4]'
                    : 'text-stone-600 hover:bg-stone-200'
                }`}
              >
                Daftar Baru
              </button>
            </div>
          )}

          {/* Error and Success Banners */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                className="bg-[#FF6B6B]/15 text-[#FF6B6B] border-4 border-[#1A1A1A] p-3 mb-6 font-extrabold flex items-start gap-2.5 text-xs uppercase rounded-lg shadow-[3px_3px_0px_rgba(0,0,0,0.15)]"
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}
            {success && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                className="bg-[#4ECDC4]/15 text-[#1a6e66] border-4 border-[#1A1A1A] p-3 mb-6 font-extrabold flex items-start gap-2.5 text-xs uppercase rounded-lg shadow-[3px_3px_0px_rgba(0,0,0,0.15)]"
              >
                <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {view !== 'forgot' ? (
            <div className="space-y-4">
              {/* Google Sign-In */}
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-[#FFE66D] text-[#1A1A1A] brutal-border shadow-[4px_4px_0px_#1A1A1A] font-black py-4 uppercase tracking-widest hover:-translate-y-1 hover:shadow-[5px_5px_0px_#1A1A1A] active:translate-y-0.5 px-4 transition-all flex items-center justify-center gap-3 text-xs rounded-lg"
              >
                <Chrome className="h-4 w-4 stroke-[2.5]" />
                {loading ? 'Memproses...' : 'Masuk dengan Google'}
              </button>

              <div className="flex items-center gap-3 py-2 text-stone-400 font-bold uppercase tracking-wider text-[10px]">
                <div className="flex-1 h-0.5 bg-stone-200" />
                <span>atau gunakan email</span>
                <div className="flex-1 h-0.5 bg-stone-200" />
              </div>

              {/* Email + Password Form */}
              <form onSubmit={handleEmailAction} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                    <input
                      type="email"
                      value={email}
                      required
                      placeholder="contoh@alamat.com"
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white border-3 border-[#1A1A1A] rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-[#FFE66D] font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      required
                      placeholder={view === 'signup' ? 'Minimal 8 karakter' : 'Password Anda'}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white border-3 border-[#1A1A1A] rounded-lg py-3 pl-10 pr-12 text-sm focus:outline-none focus:ring-4 focus:ring-[#FFE66D] font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#1A1A1A] transition-colors p-1"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4 stroke-[2]" /> : <Eye className="h-4 w-4 stroke-[2]" />}
                    </button>
                  </div>
                </div>

                {view === 'signup' && (
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">Konfirmasi Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        required
                        placeholder="Ketik ulang password"
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-white border-3 border-[#1A1A1A] rounded-lg py-3 pl-10 pr-12 text-sm focus:outline-none focus:ring-4 focus:ring-[#FFE66D] font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#1A1A1A] transition-colors p-1"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4 stroke-[2]" /> : <Eye className="h-4 w-4 stroke-[2]" />}
                      </button>
                    </div>
                  </div>
                )}

                {view === 'login' && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => { setView('forgot'); resetFormState(); }}
                      className="text-[10px] font-bold text-[#FF6B6B] hover:underline uppercase tracking-wider font-sans"
                    >
                      Lupa password?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1A1A1A] text-white brutal-border shadow-[4px_4px_0px_#FFE66D] font-black py-4 uppercase tracking-widest hover:-translate-y-1 hover:shadow-[5px_5px_0px_#FFE66D] active:translate-y-0.5 transition-all text-xs rounded-lg mt-2 disabled:bg-stone-400"
                >
                  {loading ? 'Memproses...' : view === 'login' ? 'Masuk Sekarang' : 'Daftar Sekarang'}
                </button>
              </form>

              <div className="text-center pt-2 text-xs">
                {view === 'login' ? (
                  <p className="text-stone-500 font-medium">
                    Belum punya akun?{' '}
                    <button
                      onClick={() => { setView('signup'); resetFormState(); }}
                      className="font-black text-[#4ECDC4] hover:underline"
                    >
                      Daftar Gratis
                    </button>
                  </p>
                ) : (
                  <p className="text-stone-500 font-medium">
                    Sudah punya akun?{' '}
                    <button
                      onClick={() => { setView('login'); resetFormState(); }}
                      className="font-black text-[#4ECDC4] hover:underline"
                    >
                      Masuk Di Sini
                    </button>
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-bold uppercase tracking-tight text-[#1A1A1A]">Lupa Password</h2>
              <p className="text-xs text-stone-500 leading-relaxed font-semibold">
                Masukkan email terdaftar Anda. Kami akan mengirimkan tautan untuk mengatur ulang password Anda.
              </p>
              
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">Email Anda</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                    <input
                      type="email"
                      value={email}
                      required
                      placeholder="nama@alamat.com"
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white border-3 border-[#1A1A1A] rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-[#FFE66D] font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1A1A1A] text-white brutal-border shadow-[4px_4px_0px_#4ECDC4] font-black py-4 uppercase tracking-widest hover:-translate-y-1 hover:shadow-[5px_5px_0px_#4ECDC4] active:translate-y-0.5 transition-all text-xs rounded-lg"
                >
                  {loading ? 'Mengirim...' : 'Kirim Tautan Atur Ulang'}
                </button>
              </form>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setView('login'); resetFormState(); }}
                  className="text-xs font-black text-stone-500 hover:underline uppercase tracking-wider"
                >
                  Kembali ke halaman login
                </button>
              </div>
            </div>
          )}

          {onBack && (
            <div className="text-center pt-5 border-t-2 border-dashed border-stone-200 mt-5">
              <button
                type="button"
                onClick={onBack}
                className="text-xs font-black text-[#1A1A1A] hover:text-stone-700 uppercase tracking-widest font-sans inline-flex items-center gap-1 hover:underline"
              >
                ← Kembali ke Beranda
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
