import React, { useState } from 'react';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet, Mail, Lock, AlertCircle, CheckCircle, Chrome } from 'lucide-react';
import { useStore } from '../store';

export function Login() {
  const { simulateLogin } = useStore();
  const [view, setView] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const resetFormState = () => {
    setError(null);
    setSuccess(null);
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
        if (!userCred.user.emailVerified) {
          setSuccess('Silakan verifikasi email Anda jika belum dilakukan. Anda tetap bisa masuk.');
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
          setSuccess('Daftar berhasil! Link verifikasi telah dikirim ke email Anda.');
        } catch (vErr) {
          console.error('Email verification error', vErr);
          setSuccess('Daftar berhasil! Tetapi gagal mengirim link verifikasi.');
        }
        setView('login');
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Email atau password tidak valid.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Email sudah terdaftar.');
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
      setError('Masukkan email Anda terlebih dahulu.');
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess('Tautan untuk mengatur ulang password berhasil dikirim ke email Anda.');
      setView('login');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal mengirim link reset password.');
    } finally {
      setLoading(false);
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
          <h1 className="text-3xl font-display font-bold text-center text-[#1A1A1A] mb-1 tracking-tight">KOSFINANCE</h1>
          <p className="text-center text-stone-500 mb-8 font-medium">
            Catat keuangan kosmu, simpan selamanya
          </p>

          {/* Error and Success Banners */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                className="bg-[#FF6B6B]/15 text-[#FF6B6B] border-2 border-[#1A1A1A] p-3 mb-6 font-bold flex items-start gap-2 text-xs uppercase"
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
                className="bg-[#4ECDC4]/15 text-[#1a6e66] border-2 border-[#1A1A1A] p-3 mb-6 font-bold flex items-start gap-2 text-xs uppercase"
              >
                <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {view !== 'forgot' ? (
            <div className="space-y-4">
              {/* Google Sign-In (Utama) */}
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-[#FFE66D] text-[#1A1A1A] brutal-border font-bold py-4.5 uppercase tracking-widest hover:-translate-y-1 hover:-translate-x-0.5 hover:brutal-shadow active:translate-y-0.5 active:translate-x-0.2 px-4 transition-all flex items-center justify-center gap-3"
              >
                <Chrome className="h-5 w-5 stroke-[2.5]" />
                {loading ? 'Memproses...' : 'Masuk dengan Google'}
              </button>

              {/* Tombol Simulasikan / Demo Mode */}
              <button
                onClick={simulateLogin}
                type="button"
                className="w-full bg-stone-100 hover:bg-stone-200 text-[#1A1A1A] brutal-border font-bold py-3 uppercase tracking-wider text-xs hover:-translate-y-0.5 transition-transform"
              >
                ⚡ Simulasikan Aplikasi (Mode Demo/Tanpa DB) ⚡
              </button>

              <div className="flex items-center gap-3 py-2 text-stone-400 font-bold uppercase tracking-wider text-xs">
                <div className="flex-1 h-0.5 bg-stone-200" />
                <span>atau</span>
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
                      className="w-full bg-white brutal-border py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-[#FFE66D]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                    <input
                      type="password"
                      value={password}
                      required
                      placeholder={view === 'signup' ? 'Minimal 8 karakter' : 'Password anda'}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white brutal-border py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-[#FFE66D]"
                    />
                  </div>
                </div>

                {view === 'signup' && (
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">Konfirmasi Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                      <input
                        type="password"
                        value={confirmPassword}
                        required
                        placeholder="Ketik ulang password"
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-white brutal-border py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-[#FFE66D]"
                      />
                    </div>
                  </div>
                )}

                {view === 'login' && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => { setView('forgot'); resetFormState(); }}
                      className="text-xs font-bold text-[#FF6B6B] hover:underline uppercase tracking-wider"
                    >
                      Lupa password?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1A1A1A] text-white brutal-border font-bold py-4 uppercase tracking-widest hover:-translate-y-1 transition-all"
                >
                  {loading ? 'Memproses...' : view === 'login' ? 'Masuk' : 'Daftar Sekarang'}
                </button>
              </form>

              <div className="text-center pt-2 text-xs">
                {view === 'login' ? (
                  <p className="text-stone-500 font-medium">
                    Belum punya akun?{' '}
                    <button
                      onClick={() => { setView('signup'); resetFormState(); }}
                      className="font-bold text-[#4ECDC4] hover:underline"
                    >
                      Daftar
                    </button>
                  </p>
                ) : (
                  <p className="text-stone-500 font-medium">
                    Sudah punya akun?{' '}
                    <button
                      onClick={() => { setView('login'); resetFormState(); }}
                      className="font-bold text-[#4ECDC4] hover:underline"
                    >
                      Masuk
                    </button>
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-bold uppercase tracking-tight text-[#1A1A1A]">Lupa Password</h2>
              <p className="text-xs text-stone-500 leading-relaxed font-medium">
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
                      className="w-full bg-white brutal-border py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-[#FFE66D]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1A1A1A] text-white brutal-border font-bold py-4 uppercase tracking-widest hover:-translate-y-1 transition-all"
                >
                  {loading ? 'Mengirim...' : 'Kirim Tautan Atur Ulang'}
                </button>
              </form>

              <div className="text-center pt-2">
                <button
                  onClick={() => { setView('login'); resetFormState(); }}
                  className="text-xs font-bold text-stone-500 hover:underline uppercase tracking-wide"
                >
                  Kembali ke halaman login
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
