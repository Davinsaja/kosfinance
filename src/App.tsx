import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider, useStore } from './store';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { AddTransaction } from './pages/AddTransaction';
import { Bills } from './pages/Bills';
import { SplitBill } from './pages/SplitBill';
import { SplitBillDetail } from './pages/SplitBillDetail';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { Calendar } from './pages/Calendar';
import { Savings } from './pages/Savings';

function AppContent() {
  const { user, authLoading, state } = useStore();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center p-4">
        <div className="bg-white brutal-border brutal-shadow p-8 max-w-sm w-full text-center space-y-4">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-[#1A1A1A] border-t-transparent text-[#FFE66D]" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="font-display font-bold text-[#1A1A1A] text-sm uppercase tracking-widest animate-pulse">Menghubungkan ke KosFinance...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  if (!state.isConfigured) {
    return <Landing />;
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/kalender" element={<Calendar />} />
        <Route path="/celengan" element={<Savings />} />
        <Route path="/catat" element={<AddTransaction />} />
        <Route path="/tagihan" element={<Bills />} />
        <Route path="/patungan" element={<SplitBill />} />
        <Route path="/patungan/:id" element={<SplitBillDetail />} />
        <Route path="/laporan" element={<Reports />} />
        <Route path="/pengaturan" element={<Settings />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </StoreProvider>
  );
}

