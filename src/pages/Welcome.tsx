import React from 'react';
import { motion } from 'motion/react';
import { Wallet, ShieldCheck, Flame, PieChart, Users, PiggyBank, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

interface WelcomeProps {
  onGetStarted: () => void;
}

export function Welcome({ onGetStarted }: WelcomeProps) {
  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#1A1A1A] font-sans overflow-x-hidden selection:bg-[#FFE66D]">
      {/* 1. Header Navigation Bar */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between border-b-4 border-[#1A1A1A]">
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: -3 }}
            className="h-10 w-10 bg-[#FFE66D] border-3 border-[#1A1A1A] flex items-center justify-center shadow-[3px_3px_0px_#1A1A1A] rounded"
          >
            <Wallet className="h-5 w-5 text-[#1A1A1A]" />
          </motion.div>
          <div>
            <span className="font-display font-black text-xl tracking-tight text-[#1A1A1A]">KOSFINANCE</span>
            <span className="hidden sm:inline-block ml-2 text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-[#4ECDC4] border-2 border-[#1A1A1A] rounded">FOR ANAK KOS</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={onGetStarted}
            className="bg-white hover:bg-stone-50 text-[#1A1A1A] border-3 border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A] active:translate-y-0.5 active:shadow-[1px_1px_0px_#1A1A1A] py-1.5 px-4 text-xs font-black uppercase tracking-wider transition-all rounded"
          >
            Masuk
          </button>
          <button 
            onClick={onGetStarted}
            className="hidden sm:inline-block bg-[#1A1A1A] text-white hover:bg-[#2A2A2A] border-3 border-[#1A1A1A] shadow-[3px_3px_0px_#FFE66D] active:translate-y-0.5 py-1.5 px-4 text-xs font-black uppercase tracking-wider transition-all rounded animate-pulse"
          >
            Daftar Gratis
          </button>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 flex flex-col lg:flex-row items-center gap-12 border-b-4 border-[#1A1A1A]">
        {/* Left HERO Content */}
        <div className="w-full lg:w-1/2 space-y-6">
          <div className="inline-flex items-center gap-2 bg-[#FFE66D]/20 text-[#9e7616] border-2 border-[#1A1A1A] py-2 px-3 text-xs font-black uppercase tracking-wider rounded-lg">
            <Sparkles className="h-4 w-4 text-[#9e7616] animate-bounce" />
            Keuangan Selamat, Akhir Bulan Tenang!
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-black text-[#1A1A1A] leading-tight tracking-tight uppercase">
            Atur Uang Kos <br />
            <span className="bg-[#FFE66D] px-2 border-3 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] inline-block my-1.5 transform -rotate-1">Tanpa Drama</span> <br />
            Akhir Bulan!
          </h1>

          <p className="text-[#1A1A1A] text-base sm:text-lg font-medium leading-relaxed max-w-xl">
            Aplikasi pembukuan keuangan personal tercanggih yang dirancang khusus untuk mahasiswa dan anak kos. Amankan kiriman bulanan, pantau dana darurat, hitung jatuh tempo tagihan kost, hingga patungan (split bill) makan bareng se-geng!
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
            <button
              onClick={onGetStarted}
              className="group bg-[#4ECDC4] text-[#1A1A1A] border-3 border-[#1A1A1A] shadow-[5px_5px_0px_#1A1A1A] hover:-translate-y-1 hover:shadow-[7px_7px_0px_#1A1A1A] active:translate-y-0.5 active:shadow-[1px_1px_0px_#1A1A1A] py-4 px-8 text-sm font-black uppercase tracking-wider transition-all rounded-xl text-center flex items-center justify-center gap-2"
            >
              Mulai Sekarang Gratis
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="#fitur"
              className="bg-white text-[#1A1A1A] border-3 border-[#1A1A1A] shadow-[5px_5px_0px_#1A1A1A] hover:-translate-y-0.5 active:translate-y-0.5 py-4 px-8 text-sm font-black uppercase tracking-wider rounded-xl text-center transition-all"
            >
              Lihat Fitur Unggulan
            </a>
          </div>

          <div className="flex items-center gap-6 pt-4 text-xs font-bold text-stone-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-[#4ECDC4]" />
              Cloud Database Aman & Sinkron
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-[#FFE66D]" />
              Terverifikasi Email OTP
            </div>
          </div>
        </div>

        {/* Right HERO Bento Grid Illustration */}
        <div className="w-full lg:w-1/2 flex justify-center">
          <div className="relative w-full max-w-[500px] h-[400px]">
            {/* Background decorative Grid */}
            <div className="absolute inset-4 opacity-20 bg-[linear-gradient(to_right,#1A1A1A_2px,transparent_2px),linear-gradient(to_bottom,#1A1A1A_2px,transparent_2px)] bg-[size:20px_20px] border-4 border-dashed border-stone-400 -z-10 rounded-2xl"></div>

            {/* Float Card 1: Balance & Survival Alert */}
            <motion.div 
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute left-6 top-8 bg-white border-3 border-[#1A1A1A] p-4 shadow-[4px_4px_0px_#1A1A1A] w-[260px] rounded-lg rotate-[-2deg] z-20"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">STATUS SALDO</span>
                <span className="bg-[#FF6B6B] text-white text-[9px] font-black px-1.5 py-0.5 uppercase rounded-full">DARURAT</span>
              </div>
              <h4 className="text-2xl font-display font-black text-[#1A1A1A]">Rp 45.000</h4>
              <p className="text-[10px] text-stone-500 font-bold mt-1">Sisa 5 hari menuju kiriman berikutnya</p>
              
              <div className="mt-3 bg-[#FF6B6B]/10 p-2 border-2 border-stone-300 rounded text-[9px] text-[#FF6B6B] font-extrabold flex gap-1 items-start">
                <Flame className="h-3 w-3 shrink-0 mt-0.5 text-[#FF6B6B] animate-pulse" />
                <span>Modus Survival Aktif! Kunci pengeluaran sekunder Anda.</span>
              </div>
            </motion.div>

            {/* Float Card 2: Safe target widget */}
            <motion.div 
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 0.5 }}
              className="absolute right-4 top-24 bg-white border-3 border-[#1A1A1A] p-4 shadow-[5px_5px_0px_#FFE66D] w-[220px] rounded-lg rotate-[3deg] z-10"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="h-6 w-6 bg-[#FFE66D] border-2 border-[#1A1A1A] rounded flex items-center justify-center">
                  <PiggyBank className="h-3.5 w-3.5 text-[#1A1A1A]" />
                </div>
                <span className="text-[11px] font-black tracking-tight text-[#1A1A1A]">CELENGAN IMPIAN</span>
              </div>
              <p className="text-xs text-stone-500 font-bold">🎯 Beli Sepatu Baru</p>
              <div className="w-full bg-stone-100 h-3 border-2 border-[#1A1A1A] rounded-full mt-2 overflow-hidden">
                <div className="bg-[#4ECDC4] h-full w-[78%] border-r-2 border-[#1A1A1A]" />
              </div>
              <div className="flex justify-between text-[9px] font-black text-stone-600 mt-1">
                <span>Rp 390K</span>
                <span>78%</span>
              </div>
            </motion.div>

            {/* Float Card 3: Quick Overview */}
            <motion.div 
              animate={{ x: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1 }}
              className="absolute left-10 bottom-8 bg-[#4ECDC4] border-3 border-[#1A1A1A] p-4 shadow-[4px_4px_0px_#1A1A1A] w-[200px] rounded-lg rotate-[1deg] z-30"
            >
              <h5 className="text-xs font-black text-[#1A1A1A] tracking-wider uppercase">Patungan Wifi</h5>
              <div className="flex justify-between items-center mt-2">
                <span className="text-[10px] font-medium text-stone-800">Udin, Sela, +3</span>
                <span className="bg-white text-[9px] font-black px-1 border-2 border-[#1A1A1A] rounded">Lunas 🟢</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. Core Features Section (Bento Grid) */}
      <section id="fitur" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 border-b-4 border-[#1A1A1A]">
        <div className="text-center md:text-left mb-12 sm:mb-16">
          <span className="bg-[#FFE66D] text-[#1A1A1A] border-2 border-[#1A1A1A] px-3 py-1 font-black uppercase text-xs tracking-widest rounded shadow-[2px_2px_0px_#1A1A1A]">
            FITUR UNGGULAN
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-black text-[#1A1A1A] mt-4 tracking-tight uppercase">
            DIRANCANG AGAR KAMU TIDAK KETETERAN KEUANGAN
          </h2>
          <p className="text-stone-500 font-semibold max-w-2xl mt-2">
            Nikmati fitur finansial yang disesuaikan 100% untuk kebutuhan, kebiasaan, dan siklus hidup anak kos Indonesia.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Fitur 1: Siklus Kiriman Bulanan */}
          <div className="bg-white border-3 border-[#1A1A1A] shadow-[5px_5px_0px_#1A1A1A] p-8 rounded-xl flex flex-col justify-between hover:-translate-y-1 transition-transform">
            <div className="space-y-4">
              <div className="h-12 w-12 bg-[#FFE66D] border-3 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] flex items-center justify-center rounded-lg">
                <PieChart className="h-6 w-6 text-[#1A1A1A]" />
              </div>
              <h3 className="text-lg font-display font-black uppercase tracking-tight text-[#1A1A1A]">SIKLUS KIRIMAN CUSTOM</h3>
              <p className="text-stone-500 font-medium text-xs leading-relaxed">
                Tanggal dapet duit kiriman ortu bukan tanggal 1? Santai! KosFinance menghitung siklus budget bulananmu mulai dari tanggal gajian/kiriman kustom yang kamu pilih sendiri.
              </p>
            </div>
            <div className="pt-6 border-t border-stone-100 flex items-center gap-1.5 text-xs font-bold text-[#FFE66D] bg-stone-900 mx-[-32px] mb-[-32px] p-4 rounded-b-lg mt-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFE66D]" />
              <span>Dukung Tanggal Kiriman Custom</span>
            </div>
          </div>

          {/* Fitur 2: Emergency Survival alerts */}
          <div className="bg-white border-3 border-[#1A1A1A] shadow-[5px_5px_0px_#4ECDC4] p-8 rounded-xl flex flex-col justify-between hover:-translate-y-1 transition-transform">
            <div className="space-y-4">
              <div className="h-12 w-12 bg-[#4ECDC4] border-3 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] flex items-center justify-center rounded-lg">
                <Flame className="h-6 w-6 text-[#1A1A1A]" />
              </div>
              <h3 className="text-lg font-display font-black uppercase tracking-tight text-[#1A1A1A]">MODUS SURVIVAL OTOMATIS</h3>
              <p className="text-stone-500 font-medium text-xs leading-relaxed">
                Ketika sisa saldo menyentuh batas kritis yang kamu setel, sistem akan otomatis merubah UI menjadi format survival merah-darurat serta memberikan kalkulasi budget harian super minimalis agar kamu bisa bertahan hidup.
              </p>
            </div>
            <div className="pt-6 border-t border-stone-100 flex items-center gap-1.5 text-xs font-bold text-[#4ECDC4] bg-stone-900 mx-[-32px] mb-[-32px] p-4 rounded-b-lg mt-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ECDC4]" />
              <span>Pemberitahuan Ototmatis Survival</span>
            </div>
          </div>

          {/* Fitur 3: Split Bill & Bill management */}
          <div className="bg-white border-3 border-[#1A1A1A] shadow-[5px_5px_0px_#FF6B6B] p-8 rounded-xl flex flex-col justify-between hover:-translate-y-1 transition-transform md:col-span-2 lg:col-span-1">
            <div className="space-y-4">
              <div className="h-12 w-12 bg-[#FF6B6B] border-3 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] flex items-center justify-center rounded-lg">
                <Users className="h-6 w-6 text-[#1A1A1A]" />
              </div>
              <h3 className="text-lg font-display font-black uppercase tracking-tight text-[#1A1A1A]">PATUNGAN & TAGIHAN KOS</h3>
              <p className="text-stone-500 font-medium text-xs leading-relaxed">
                Urusan bayar bayar wifi bareng, beli token listrik, makan bareng, urun kado teman kost sekarang gampang! Sistem Split Bill mengkalkulasi pembagian rata secara instan sekaligus mencatat status lunas masing-masing kawan kost.
              </p>
            </div>
            <div className="pt-6 border-t border-stone-100 flex items-center gap-1.5 text-xs font-bold text-[#FF6B6B] bg-stone-900 mx-[-32px] mb-[-32px] p-4 rounded-b-lg mt-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B6B]" />
              <span>Lacak tagihan patungan sekost</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Simple Onboarding Steps Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 border-b-4 border-[#1A1A1A]">
        <div className="text-center mb-12 sm:mb-16">
          <span className="bg-[#4ECDC4]/20 text-[#1a6e66] border-2 border-[#1A1A1A] px-3 py-1 font-black uppercase text-xs tracking-widest rounded-lg">
            ALUR KERJA
          </span>
          <h2 className="text-3xl font-display font-black text-[#1A1A1A] mt-4 tracking-tight uppercase">
            3 LANGKAH MUDAH BERSAMA KOSFINANCE
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white border-3 border-[#1A1A1A] p-6 rounded-lg shadow-[3px_3px_0px_#1A1A1A] text-center space-y-3 relative">
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 h-10 w-10 bg-[#1A1A1A] text-white border-2 border-[#1A1A1A] rounded-full flex items-center justify-center font-display font-black text-sm">
              01
            </div>
            <h4 className="font-display font-bold text-base text-[#1A1A1A] pt-4 uppercase">Daftar Akun Aman</h4>
            <p className="text-xs text-stone-500 font-medium">
              Buat akun dalam hitungan detik menggunakan akun Google maupun email aktif. Sistem mengamankan akun lewat link verifikasi email terpercaya.
            </p>
          </div>

          <div className="bg-[#FFE66D]/10 border-3 border-[#1A1A1A] p-6 rounded-lg shadow-[3px_3px_0px_#1A1A1A] text-center space-y-3 relative">
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 h-10 w-10 bg-[#FFE66D] text-[#1A1A1A] border-3 border-[#1A1A1A] rounded-full flex items-center justify-center font-display font-black text-sm shadow-[1px_1px_0px_#1A1A1A]">
              02
            </div>
            <h4 className="font-display font-bold text-base text-[#1A1A1A] pt-4 uppercase">Set Allowance & Batasan</h4>
            <p className="text-xs text-stone-500 font-medium">
              Sistem akan menginisialisasi budget bulanan dari kirimanmu, merumuskan batas krisis survival, serta menyebarkan alokasi kebutuhan secara instan.
            </p>
          </div>

          <div className="bg-white border-3 border-[#1A1A1A] p-6 rounded-lg shadow-[3px_3px_0px_#1A1A1A] text-center space-y-3 relative">
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 h-10 w-10 bg-[#4ECDC4] text-[#1A1A1A] border-3 border-[#1A1A1A] rounded-full flex items-center justify-center font-display font-black text-sm shadow-[1px_1px_0px_#1A1A1A]">
              03
            </div>
            <h4 className="font-display font-bold text-base text-[#1A1A1A] pt-4 uppercase">Catat & Simpan Bahagia</h4>
            <p className="text-xs text-stone-500 font-medium">
              Sekarang catat setiap pengeluaran makan, laundry, bensin dengan cepat. KosFinance memantau batas aman harianmu agar tidak berakhir kelaparan!
            </p>
          </div>
        </div>
      </section>

      {/* 5. Call To Action Footer Banner */}
      <section className="bg-[#FFE66D] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 border-b-4 border-[#1A1A1A] text-center space-y-6 relative overflow-hidden">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#1A1A1A_1px,transparent_1px),linear-gradient(to_bottom,#1A1A1A_1px,transparent_1px)] bg-[size:16px_16px]"></div>
        
        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-4xl font-display font-black text-[#1A1A1A] uppercase tracking-tight">
            NUNGGU APALAGI? SEBELUM DOMPETMENGERIT KERING!
          </h2>
          <p className="text-[#1A1A1A] font-bold text-sm max-w-lg mx-auto leading-relaxed">
            Gabung bersama ribuan anak kos tangguh se-Indonesia yang sudah berhasil menjaga kestabilan finansial sampai akhir bulan.
          </p>
          <div className="pt-2">
            <button
              onClick={onGetStarted}
              className="bg-[#1A1A1A] text-white hover:bg-[#2a2a2a] border-3 border-[#1A1A1A] shadow-[5px_5px_0px_#ffffff] hover:shadow-[7px_7px_0px_#ffffff] hover:-translate-y-1 active:translate-y-0.5 active:shadow-[1px_1px_0px_#1A1A1A] py-4 px-8 text-sm font-black uppercase tracking-wider transition-all rounded-lg"
            >
              Mulai Sekarang Gratis 🚀
            </button>
          </div>
        </div>
      </section>

      {/* 6. Legal & Branding Footer */}
      <footer className="bg-white max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between text-[#1A1A1A] border-b-4 border-[#1A1A1A]">
        <div className="flex items-center gap-2">
          <span className="font-display font-black text-[#1A1A1A] text-sm">© {new Date().getFullYear()} KOSFINANCE.</span>
          <span className="text-xs text-stone-500 font-bold ml-1">Simpan Selamanya. Keuangan Lebih Terarah.</span>
        </div>
        <div className="text-[10px] sm:text-xs font-black text-stone-400 mt-4 sm:mt-0 uppercase tracking-widest flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#4ECDC4] animate-pulse"></span>
          🔒 CLOUD RUN SECURE SERVER ACTIVE
        </div>
      </footer>
    </div>
  );
}
