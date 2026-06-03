import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { cn } from '../lib/utils';
import { LayoutDashboard, ReceiptText, Users, FileText, Settings, PlusCircle, Calendar, Coins, Menu as MenuIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function Layout() {
  const { state } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const isSettingsPage = location.pathname === '/pengaturan';
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Close mobile menu drawer when route navigation changes
  useEffect(() => {
    setShowMobileMenu(false);
  }, [location.pathname]);

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isSettingsPage) {
      navigate(-1);
    } else {
      navigate('/pengaturan');
    }
  };

  // Survival Mode overlay calculation
  // Basic calculation to see if we are in survival mode
  const currentTotalExpense = state.transactions.reduce((acc, tx) => acc + tx.amount, 0); // Simplified for whole cycle, should be per cycle
  // Actually let's just make the navbar simple for now and handle survival mode inside Dashboard.

  const desktopNavItems = [
    { name: 'Home', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Kalender', path: '/kalender', icon: Calendar },
    { name: 'Celengan', path: '/celengan', icon: Coins },
    { name: 'Tagihan', path: '/tagihan', icon: ReceiptText },
    { name: 'Catat', path: '/catat', icon: PlusCircle },
    { name: 'Patungan', path: '/patungan', icon: Users },
    { name: 'Laporan', path: '/laporan', icon: FileText },
  ];

  const mobileNavItems = [
    { name: 'Home', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Kalender', path: '/kalender', icon: Calendar },
    { name: 'Catat', path: '/catat', icon: PlusCircle },
    { name: 'Celengan', path: '/celengan', icon: Coins },
  ];

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#1A1A1A] font-sans pb-20 md:pb-0 md:pl-64 flex flex-col">
      {/* Mobile Sticky Header */}
      <header className="md:hidden flex justify-between items-center px-4 py-3 bg-white border-b-4 border-[#1A1A1A] sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span className="bg-[#FFE66D] text-[11px] uppercase font-bold tracking-widest px-2.5 py-1 brutal-border">
            KOSFINANCE
          </span>
        </div>
        <motion.button
          onClick={handleSettingsClick}
          className={cn(
            "p-2.5 brutal-border shadow-[2px_2px_0px_#1A1A1A] transition-colors outline-none",
            isSettingsPage ? "bg-[#FFE66D]" : "bg-white hover:bg-stone-50"
          )}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9, y: 1, x: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          <motion.div
            animate={{ rotate: isSettingsPage ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex items-center justify-center"
          >
            <Settings className="h-4 w-4" />
          </motion.div>
        </motion.button>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 bg-white brutal-border z-50">
        <div className="p-6">
          <h1 className="text-2xl font-display font-bold tracking-tight text-[#1A1A1A]">KosFinance</h1>
          <p className="text-xs text-stone-500 mt-1 uppercase font-bold tracking-widest">Sobat Finansial Anak Kos</p>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {desktopNavItems.map((item) => {
            const isCatat = item.path === '/catat';
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center px-4 py-3 text-sm font-bold brutal-border transition-all relative overflow-hidden',
                    isActive
                      ? 'bg-[#FFE66D] translate-x-1 shadow-[2px_2px_0px_#1A1A1A]'
                      : isCatat 
                        ? 'bg-[#FFE66D]/10 hover:bg-[#FFE66D]/20 border-dashed border-[#1A1A1A]' 
                        : 'bg-white hover:bg-stone-50'
                  )
                }
              >
                <item.icon className="mr-3 h-5 w-5 shrink-0 text-[#1A1A1A]" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
          <div className="flex-1" />
          <motion.button
             onClick={handleSettingsClick}
             className={cn(
                'flex items-center w-full px-4 py-3 text-sm font-bold brutal-border mt-auto mb-4 text-left outline-none',
                isSettingsPage ? 'bg-[#FFE66D] translate-x-1 shadow-[2px_2px_0px_#1A1A1A]' : 'bg-white hover:bg-stone-50'
             )}
             whileHover={{ scale: 1.02, x: 4 }}
             whileTap={{ scale: 0.98 }}
             transition={{ type: "spring", stiffness: 450, damping: 20 }}
          >
            <motion.div
              className="mr-3 flex items-center justify-center shrink-0"
              animate={{ rotate: isSettingsPage ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Settings className="h-5 w-5" />
            </motion.div>
            <span>Pengaturan</span>
          </motion.button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8 overflow-x-hidden">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex-1 flex flex-col h-full w-full"
        >
          <Outlet />
        </motion.div>
      </main>

      {/* Mobile Bottom Nav (5 items including 'Lainnya' Menu trigger) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white brutal-border border-b-0 border-l-0 border-r-0 z-50 pb-safe">
        <div className="flex justify-around items-center h-16">
          {mobileNavItems.map((item) => {
            const isCatat = item.path === '/catat';
            if (isCatat) {
              return (
                <div key={item.path} className="relative flex flex-col items-center justify-center w-full h-full">
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        'absolute -top-5 flex flex-col items-center justify-center h-13 w-13 rounded-full brutal-border shadow-[2px_2px_0px_#1A1A1A] transition-all bg-[#FFE66D]',
                        isActive 
                          ? 'border-4 border-[#1A1A1A] scale-105 shadow-[1px_1px_0px_#1A1A1A]' 
                          : 'hover:scale-105 active:scale-95'
                      )
                    }
                  >
                    <PlusCircle className="h-6 w-6 text-[#1A1A1A] stroke-[2.5px]" />
                  </NavLink>
                  {/* Label spacer so it maps perfectly below */}
                  <span className="text-[8.5px] font-bold uppercase tracking-tight text-[#1A1A1A] mt-8 z-10 pointer-events-none">
                    {item.name}
                  </span>
                </div>
              );
            }
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center justify-center w-full h-full space-y-1',
                    isActive ? 'text-[#FF6B6B] bg-[#FDFCF8]' : 'text-stone-500 hover:text-[#1A1A1A]'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={cn("h-5 w-5", isActive ? "stroke-[2.5px] text-[#1A1A1A]" : "stroke-2")} />
                    <span className={cn("text-[8.5px] font-bold uppercase tracking-tight text-center truncate px-1", isActive ? "text-[#1A1A1A]" : "")}>{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}

          {/* Virtual "Lainnya" Button */}
          <button
            onClick={() => setShowMobileMenu(true)}
            className="flex flex-col items-center justify-center w-full h-full space-y-1 text-stone-500 hover:text-[#1A1A1A] focus:outline-none"
          >
            <MenuIcon className="h-5 w-5 stroke-2" />
            <span className="text-[8.5px] font-bold uppercase tracking-tight text-center">Lainnya</span>
          </button>
        </div>
      </nav>

      {/* Slide-Up Bottom Drawer Menu for Extra Nav Options */}
      <AnimatePresence>
        {showMobileMenu && (
          <div className="fixed inset-0 z-50 md:hidden pointer-events-auto">
            {/* Backdrop click closer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileMenu(false)}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-xs"
            />
            {/* Sliding Panel */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", bounce: 0.15, duration: 0.35 }}
              className="absolute bottom-0 inset-x-0 bg-white brutal-border border-b-0 border-l-0 border-r-0 p-6 space-y-5 shadow-[0_-8px_24px_rgba(0,0,0,0.12)] rounded-t-2xl pb-10"
            >
              <div className="flex justify-between items-center border-b-2 border-[#1A1A1A] pb-2.5">
                <span className="font-display font-black text-xs uppercase tracking-widest text-[#1A1A1A]">Menu Fitur Lain</span>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-1 border-2 border-[#1A1A1A] bg-[#FFE66D] hover:bg-white text-[#1A1A1A] rounded-none focus:outline-none"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Functional menu options grid */}
              <div className="grid grid-cols-2 gap-4">
                <NavLink
                  to="/tagihan"
                  className={({ isActive }) =>
                    cn(
                      'flex flex-col items-center justify-center p-4 brutal-border font-bold text-xs uppercase tracking-wider text-center gap-2 transition-all',
                      isActive ? 'bg-[#FFE66D] shadow-[2px_2px_0px_#1A1A1A] translate-x-0.5' : 'bg-stone-50 hover:bg-stone-100'
                    )
                  }
                >
                  <ReceiptText className="h-6 w-6 text-[#1A1A1A]" />
                  <span>Daftar Tagihan</span>
                </NavLink>

                <NavLink
                  to="/patungan"
                  className={({ isActive }) =>
                    cn(
                      'flex flex-col items-center justify-center p-4 brutal-border font-bold text-xs uppercase tracking-wider text-center gap-2 transition-all',
                      isActive ? 'bg-[#FFE66D] shadow-[2px_2px_0px_#1A1A1A] translate-x-0.5' : 'bg-stone-50 hover:bg-stone-100'
                    )
                  }
                >
                  <Users className="h-6 w-6 text-[#1A1A1A]" />
                  <span>Patungan Kos</span>
                </NavLink>

                <NavLink
                  to="/laporan"
                  className={({ isActive }) =>
                    cn(
                      'flex flex-col items-center justify-center p-4 brutal-border font-bold text-xs uppercase tracking-wider text-center gap-2 transition-all',
                      isActive ? 'bg-[#FFE66D] shadow-[2px_2px_0px_#1A1A1A] translate-x-0.5' : 'bg-stone-50 hover:bg-stone-100'
                    )
                  }
                >
                  <FileText className="h-6 w-6 text-[#1A1A1A]" />
                  <span>Laporan PDF</span>
                </NavLink>

                <NavLink
                  to="/pengaturan"
                  className={({ isActive }) =>
                    cn(
                      'flex flex-col items-center justify-center p-4 brutal-border font-bold text-xs uppercase tracking-wider text-center gap-2 transition-all',
                      isActive ? 'bg-[#FFE66D] shadow-[2px_2px_0px_#1A1A1A] translate-x-0.5' : 'bg-stone-50 hover:bg-stone-100'
                    )
                  }
                >
                  <Settings className="h-6 w-6 text-[#1A1A1A]" />
                  <span>Pengaturan</span>
                </NavLink>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
