import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, AppSettings, Transaction, Bill, SplitSession, SavingsTarget, CalendarEvent } from './types';
import { auth, db, OperationType, handleFirestoreError } from './lib/firebase';
import { onAuthStateChanged, User, signOut, deleteUser } from 'firebase/auth';
import {
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  collection,
  onSnapshot,
  getDoc
} from 'firebase/firestore';

const defaultSettings: AppSettings = {
  allowanceAmount: 1500000,
  cycleStartDate: 1,
  survivalThreshold: 100000,
  allocations: {
    wajib: 50,
    fleksibel: 30,
    darurat: 20,
  },
};

const defaultState: AppState = {
  settings: defaultSettings,
  transactions: [],
  bills: [],
  splitSessions: [],
  savingsTargets: [],
  calendarEvents: [],
  isConfigured: false,
};

interface StoreContextType {
  state: AppState;
  user: User | null;
  authLoading: boolean;
  updateSettings: (settings: AppSettings) => Promise<void>;
  addTransaction: (tx: Transaction) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  addBill: (bill: Bill) => Promise<void>;
  toggleBillPaid: (id: string, monthKey: string) => Promise<void>;
  removeBill: (id: string) => Promise<void>;
  addSplitSession: (session: SplitSession) => Promise<void>;
  toggleSplitMemberPaid: (sessionId: string, memberId: string) => Promise<void>;
  removeSplitSession: (id: string) => Promise<void>;
  addSplitMember: (sessionId: string, member: { id: string; name: string; hasPaid: boolean }) => Promise<void>;
  removeSplitMember: (sessionId: string, memberId: string) => Promise<void>;
  markConfigured: () => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  simulateLogin: () => void;
  addSavingsTarget: (target: SavingsTarget) => Promise<void>;
  updateSavingsTarget: (target: SavingsTarget) => Promise<void>;
  removeSavingsTarget: (id: string) => Promise<void>;
  addCalendarEvent: (event: CalendarEvent) => Promise<void>;
  updateCalendarEvent: (event: CalendarEvent) => Promise<void>;
  removeCalendarEvent: (id: string) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const dummyTransactions: Transaction[] = [
  { id: 't1', amount: 15000, description: 'Nasi Goreng Malam', category: 'fleksibel', tag: 'makan', date: new Date().toISOString() },
  { id: 't2', amount: 100000, description: 'Bayar Token Listrik Kamar', category: 'wajib', tag: 'kos', date: new Date(Date.now() - 86400000).toISOString() },
  { id: 't3', amount: 52000, description: 'Kuota Internet XL 10GB', category: 'wajib', tag: 'pulsa & internet', date: new Date(Date.now() - 172800000).toISOString() },
  { id: 't4', amount: 18000, description: 'Gojek ke Kampus', category: 'fleksibel', tag: 'transportasi', date: new Date(Date.now() - 259200000).toISOString() },
  { id: 't5', amount: 75000, description: 'Top Up Steam Wallet', category: 'fleksibel', tag: 'top up game', date: new Date(Date.now() - 345600000).toISOString() },
  { id: 't6', amount: 35000, description: 'Belanja Bulanan Alfamart', category: 'wajib', tag: 'belanja', date: new Date(Date.now() - 432000000).toISOString() },
];

const dummyBills: Bill[] = [
  { id: 'b1', name: 'Sewa Kamar Kos', amount: 900000, dueDate: 5, isPaid: false },
  { id: 'b2', name: 'Wifi Penguat Sinyal', amount: 50000, dueDate: 10, isPaid: true, lastPaidMonth: new Date().toISOString().substring(0, 7) }
];

const dummySplits: SplitSession[] = [
  {
    id: 's1',
    title: 'Makan Bareng Hokben',
    totalAmount: 120000,
    date: new Date(Date.now() - 172800000).toISOString(),
    members: [
      { id: 'm1', name: 'Davin (Anda)', hasPaid: true },
      { id: 'm2', name: 'Budi Santoso', hasPaid: true },
      { id: 'm3', name: 'Adi Wijaya', hasPaid: false },
      { id: 'm4', name: 'Cici Fitri', hasPaid: true }
    ]
  }
];

const dummySavingsTargets: SavingsTarget[] = [
  { id: 'st1', title: 'DP Motor Matic', targetAmount: 4000000, currentAmount: 1200000, dueDate: '2026-10-15' },
  { id: 'st2', title: 'Belanja Buku Kuliah', targetAmount: 600000, currentAmount: 450000, dueDate: '2026-06-30' },
  { id: 'st3', title: 'Beli Laptop Baru', targetAmount: 8500000, currentAmount: 2500000, dueDate: '2026-12-15' }
];

const dummyCalendarEvents: CalendarEvent[] = [
  { id: 'ce1', title: 'Bayar Wifi Penguat Sinyal', date: '2026-06-10', type: 'reminder', amount: 50000 },
  { id: 'ce2', title: 'Tabungan Motor Bulanan', date: '2026-06-15', type: 'target', amount: 200000 },
  { id: 'ce3', title: 'Tugas Kerja Kelompok', date: '2026-06-25', type: 'info' }
];

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [state, setState] = useState<AppState>(defaultState);

  const saveDemoState = (updater: (prev: AppState) => AppState) => {
    setState((prev) => {
      const newState = updater(prev);
      localStorage.setItem('kosfinance_demo_state', JSON.stringify(newState));
      return newState;
    });
  };

  const simulateLogin = () => {
    localStorage.setItem('kosfinance_demo_mode', 'true');
    const storedState = localStorage.getItem('kosfinance_demo_state');
    if (storedState) {
      try {
        const parsed = JSON.parse(storedState);
        const tIncome = (parsed.transactions || []).filter((t: any) => t.category === 'pemasukan').reduce((sum: number, t: any) => sum + t.amount, 0);
        const tExpense = (parsed.transactions || []).filter((t: any) => t.category !== 'pemasukan').reduce((sum: number, t: any) => sum + t.amount, 0);
        parsed.current_balance = (parsed.settings?.allowanceAmount ?? 1500000) + tIncome - tExpense;
        setState(parsed);
      } catch (e) {
        const tIncome = dummyTransactions.filter(t => t.category === 'pemasukan').reduce((sum, t) => sum + t.amount, 0);
        const tExpense = dummyTransactions.filter(t => t.category !== 'pemasukan').reduce((sum, t) => sum + t.amount, 0);
        setState({
          ...defaultState,
          transactions: dummyTransactions,
          bills: dummyBills,
          splitSessions: dummySplits,
          savingsTargets: dummySavingsTargets,
          calendarEvents: dummyCalendarEvents,
          isConfigured: true,
          current_balance: (defaultSettings.allowanceAmount + tIncome) - tExpense,
        });
      }
    } else {
      const tIncome = dummyTransactions.filter(t => t.category === 'pemasukan').reduce((sum, t) => sum + t.amount, 0);
      const tExpense = dummyTransactions.filter(t => t.category !== 'pemasukan').reduce((sum, t) => sum + t.amount, 0);
      const demoInitState = {
        ...defaultState,
        transactions: dummyTransactions,
        bills: dummyBills,
        splitSessions: dummySplits,
        savingsTargets: dummySavingsTargets,
        calendarEvents: dummyCalendarEvents,
        isConfigured: true,
        current_balance: (defaultSettings.allowanceAmount + tIncome) - tExpense,
      };
      setState(demoInitState);
      localStorage.setItem('kosfinance_demo_state', JSON.stringify(demoInitState));
    }

    setUser({
      uid: 'demo_user',
      email: 'davinazmimahardika@gmail.com',
      displayName: 'Davin',
      providerData: [{ providerId: 'demo-simulated' }]
    } as any);
    setAuthLoading(false);
  };

  useEffect(() => {
    let txUnsub = () => {};
    let billsUnsub = () => {};
    let splitsUnsub = () => {};
    let savingsUnsub = () => {};
    let calendarUnsub = () => {};
    let userDocUnsub = () => {};

    // check if we have simulated flag in localStorage
    const savedDemo = localStorage.getItem('kosfinance_demo_mode');
    if (savedDemo === 'true') {
      const storedState = localStorage.getItem('kosfinance_demo_state');
      if (storedState) {
        try {
          const parsed = JSON.parse(storedState);
          const tIncome = (parsed.transactions || []).filter((t: any) => t.category === 'pemasukan').reduce((sum: number, t: any) => sum + t.amount, 0);
          const tExpense = (parsed.transactions || []).filter((t: any) => t.category !== 'pemasukan').reduce((sum: number, t: any) => sum + t.amount, 0);
          parsed.current_balance = (parsed.settings?.allowanceAmount ?? 1500000) + tIncome - tExpense;
          setState(parsed);
        } catch (e) {
          const tIncome = dummyTransactions.filter(t => t.category === 'pemasukan').reduce((sum, t) => sum + t.amount, 0);
          const tExpense = dummyTransactions.filter(t => t.category !== 'pemasukan').reduce((sum, t) => sum + t.amount, 0);
          setState({
            ...defaultState,
            transactions: dummyTransactions,
            bills: dummyBills,
            splitSessions: dummySplits,
            savingsTargets: dummySavingsTargets,
            calendarEvents: dummyCalendarEvents,
            isConfigured: true,
            current_balance: (defaultSettings.allowanceAmount + tIncome) - tExpense,
          });
        }
      } else {
        const tIncome = dummyTransactions.filter(t => t.category === 'pemasukan').reduce((sum, t) => sum + t.amount, 0);
        const tExpense = dummyTransactions.filter(t => t.category !== 'pemasukan').reduce((sum, t) => sum + t.amount, 0);
        setState({
          ...defaultState,
          transactions: dummyTransactions,
          bills: dummyBills,
          splitSessions: dummySplits,
          savingsTargets: dummySavingsTargets,
          calendarEvents: dummyCalendarEvents,
          isConfigured: true,
          current_balance: (defaultSettings.allowanceAmount + tIncome) - tExpense,
        });
      }
      setUser({
        uid: 'demo_user',
        email: 'davinazmimahardika@gmail.com',
        displayName: 'Davin',
        providerData: [{ providerId: 'demo-simulated' }]
      } as any);
      setAuthLoading(false);
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        // Clear state & listeners immediately
        txUnsub();
        billsUnsub();
        splitsUnsub();
        savingsUnsub();
        calendarUnsub();
        userDocUnsub();
        setState(defaultState);
        setAuthLoading(false);
      } else {
        const userId = currentUser.uid;
        const userDocRef = doc(db, 'users', userId);
        
        userDocUnsub = onSnapshot(userDocRef, (userDocSnap) => {
          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            setState((prev) => ({
              ...prev,
              settings: {
                allowanceAmount: data.allowanceAmount ?? defaultSettings.allowanceAmount,
                cycleStartDate: data.cycleStartDate ?? defaultSettings.cycleStartDate,
                survivalThreshold: data.survivalThreshold ?? defaultSettings.survivalThreshold,
                allocations: data.allocations ?? defaultSettings.allocations,
              },
              isConfigured: data.isConfigured ?? false,
              current_balance: data.current_balance !== undefined ? Number(data.current_balance) : undefined,
            }));
          } else {
            setState((prev) => ({
              ...prev,
              isConfigured: false,
            }));
          }
          setAuthLoading(false);
        }, (error) => {
          console.error("Gagal membaca profil pengaturan:", error);
          setAuthLoading(false);
        });

        // Set up real-time subcollection sync for complete offline/online data integrity
        txUnsub = onSnapshot(
          collection(db, 'users', userId, 'transactions'),
          (snapshot) => {
            const txs: Transaction[] = [];
            snapshot.forEach((doc) => {
              const d = doc.data();
              txs.push({
                id: doc.id,
                amount: d.amount,
                description: d.description,
                category: d.category,
                tag: d.tag || '',
                date: d.date,
              });
            });
            txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setState((prev) => ({ ...prev, transactions: txs }));
          },
          (error) => {
            handleFirestoreError(error, OperationType.LIST, `users/${userId}/transactions`);
          }
        );

        billsUnsub = onSnapshot(
          collection(db, 'users', userId, 'bills'),
          (snapshot) => {
            const billsList: Bill[] = [];
            snapshot.forEach((doc) => {
              const d = doc.data();
              billsList.push({
                id: doc.id,
                name: d.name,
                amount: d.amount,
                dueDate: d.dueDate,
                isPaid: d.isPaid,
                lastPaidMonth: d.lastPaidMonth || undefined,
              });
            });
            setState((prev) => ({ ...prev, bills: billsList }));
          },
          (error) => {
            handleFirestoreError(error, OperationType.LIST, `users/${userId}/bills`);
          }
        );

        splitsUnsub = onSnapshot(
          collection(db, 'users', userId, 'splitSessions'),
          (snapshot) => {
            const splits: SplitSession[] = [];
            snapshot.forEach((doc) => {
              const d = doc.data();
              splits.push({
                id: doc.id,
                title: d.title,
                totalAmount: d.totalAmount,
                date: d.date,
                members: d.members || [],
              });
            });
            splits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setState((prev) => ({ ...prev, splitSessions: splits }));
          },
          (error) => {
            handleFirestoreError(error, OperationType.LIST, `users/${userId}/splitSessions`);
          }
        );

        savingsUnsub = onSnapshot(
          collection(db, 'users', userId, 'savingsTargets'),
          (snapshot) => {
            const targets: SavingsTarget[] = [];
            snapshot.forEach((doc) => {
              const d = doc.data();
              targets.push({
                id: doc.id,
                title: d.title,
                targetAmount: Number(d.targetAmount || 0),
                currentAmount: Number(d.currentAmount || 0),
                dueDate: d.dueDate || '',
              });
            });
            setState((prev) => ({ ...prev, savingsTargets: targets }));
          },
          (error) => {
            handleFirestoreError(error, OperationType.LIST, `users/${userId}/savingsTargets`);
          }
        );

        calendarUnsub = onSnapshot(
          collection(db, 'users', userId, 'calendarEvents'),
          (snapshot) => {
            const events: CalendarEvent[] = [];
            snapshot.forEach((doc) => {
              const d = doc.data();
              events.push({
                id: doc.id,
                title: d.title,
                date: d.date,
                type: d.type || 'info',
                amount: d.amount ? Number(d.amount) : undefined,
              });
            });
            setState((prev) => ({ ...prev, calendarEvents: events }));
          },
          (error) => {
            handleFirestoreError(error, OperationType.LIST, `users/${userId}/calendarEvents`);
          }
        );

        setAuthLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      txUnsub();
      billsUnsub();
      splitsUnsub();
      savingsUnsub();
      calendarUnsub();
      userDocUnsub();
    };
  }, []);

  const updateSettings = async (settings: AppSettings) => {
    if (user?.uid === 'demo_user') {
      saveDemoState((prev) => {
        const tIncome = prev.transactions.filter(t => t.category === 'pemasukan').reduce((sum, t) => sum + t.amount, 0);
        const tExpense = prev.transactions.filter(t => t.category !== 'pemasukan').reduce((sum, t) => sum + t.amount, 0);
        const nextBalance = (settings.allowanceAmount + tIncome) - tExpense;
        return {
          ...prev,
          settings,
          current_balance: nextBalance
        };
      });
      return;
    }
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    const path = `users/${userId}`;
    try {
      const tIncome = state.transactions.filter(t => t.category === 'pemasukan').reduce((sum, t) => sum + t.amount, 0);
      const tExpense = state.transactions.filter(t => t.category !== 'pemasukan').reduce((sum, t) => sum + t.amount, 0);
      const newBalance = (settings.allowanceAmount + tIncome) - tExpense;

      await setDoc(doc(db, 'users', userId), {
        allowanceAmount: settings.allowanceAmount,
        cycleStartDate: settings.cycleStartDate,
        survivalThreshold: settings.survivalThreshold,
        allocations: settings.allocations,
        isConfigured: state.isConfigured,
        userId: userId,
        current_balance: newBalance
      }, { merge: true });
      setState((prev) => ({ ...prev, settings, current_balance: newBalance }));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const addTransaction = async (tx: Transaction) => {
    if (user?.uid === 'demo_user') {
      saveDemoState((prev) => {
        const nextTxs = [tx, ...prev.transactions];
        const tIncome = nextTxs.filter(t => t.category === 'pemasukan').reduce((sum, t) => sum + t.amount, 0);
        const tExpense = nextTxs.filter(t => t.category !== 'pemasukan').reduce((sum, t) => sum + t.amount, 0);
        const nextBalance = (prev.settings.allowanceAmount + tIncome) - tExpense;
        return {
          ...prev,
          transactions: nextTxs,
          current_balance: nextBalance
        };
      });
      return;
    }
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    const path = `users/${userId}/transactions/${tx.id}`;
    try {
      await setDoc(doc(db, 'users', userId, 'transactions', tx.id), {
        ...tx,
        userId: userId
      });

      const balanceChange = tx.category === 'pemasukan' ? tx.amount : -tx.amount;
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        const currentBalance = data.current_balance !== undefined ? Number(data.current_balance) : (data.allowanceAmount ?? 1500000);
        const newBalance = currentBalance + balanceChange;
        await setDoc(userRef, { current_balance: newBalance }, { merge: true });
        setState((prev) => ({ ...prev, current_balance: newBalance }));
      } else {
        const newBalance = 1500000 + balanceChange;
        await setDoc(userRef, { current_balance: newBalance }, { merge: true });
        setState((prev) => ({ ...prev, current_balance: newBalance }));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const removeTransaction = async (id: string) => {
    const tx = state.transactions.find((t) => t.id === id);
    if (user?.uid === 'demo_user') {
      saveDemoState((prev) => {
        const nextTxs = prev.transactions.filter((t) => t.id !== id);
        const tIncome = nextTxs.filter(t => t.category === 'pemasukan').reduce((sum, t) => sum + t.amount, 0);
        const tExpense = nextTxs.filter(t => t.category !== 'pemasukan').reduce((sum, t) => sum + t.amount, 0);
        const nextBalance = (prev.settings.allowanceAmount + tIncome) - tExpense;
        return {
          ...prev,
          transactions: nextTxs,
          current_balance: nextBalance
        };
      });
      return;
    }
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    const path = `users/${userId}/transactions/${id}`;
    try {
      await deleteDoc(doc(db, 'users', userId, 'transactions', id));

      if (tx) {
        const balanceChange = tx.category === 'pemasukan' ? -tx.amount : tx.amount;
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          const currentBalance = data.current_balance !== undefined ? Number(data.current_balance) : (data.allowanceAmount ?? 1500000);
          const newBalance = currentBalance + balanceChange;
          await setDoc(userRef, { current_balance: newBalance }, { merge: true });
          setState((prev) => ({ ...prev, current_balance: newBalance }));
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const addBill = async (bill: Bill) => {
    if (user?.uid === 'demo_user') {
      saveDemoState((prev) => ({
        ...prev,
        bills: [...prev.bills, bill]
      }));
      return;
    }
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    const path = `users/${userId}/bills/${bill.id}`;
    try {
      await setDoc(doc(db, 'users', userId, 'bills', bill.id), {
        ...bill,
        userId: userId
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const toggleBillPaid = async (id: string, monthKey: string) => {
    if (user?.uid === 'demo_user') {
      saveDemoState((prev) => {
        const updatedBills = prev.bills.map((b) => {
          if (b.id !== id) return b;
          const isCurrentlyPaid = b.isPaid && b.lastPaidMonth === monthKey;
          return {
            ...b,
            isPaid: !isCurrentlyPaid,
            lastPaidMonth: !isCurrentlyPaid ? monthKey : undefined
          };
        });
        return { ...prev, bills: updatedBills };
      });
      return;
    }
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    const bill = state.bills.find((b) => b.id === id);
    if (!bill) return;
    const isCurrentlyPaid = bill.isPaid && bill.lastPaidMonth === monthKey;
    const path = `users/${userId}/bills/${id}`;
    try {
      await updateDoc(doc(db, 'users', userId, 'bills', id), {
        isPaid: !isCurrentlyPaid,
        lastPaidMonth: !isCurrentlyPaid ? monthKey : null
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const removeBill = async (id: string) => {
    if (user?.uid === 'demo_user') {
      saveDemoState((prev) => ({
        ...prev,
        bills: prev.bills.filter((b) => b.id !== id)
      }));
      return;
    }
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    const path = `users/${userId}/bills/${id}`;
    try {
      await deleteDoc(doc(db, 'users', userId, 'bills', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const addSplitSession = async (session: SplitSession) => {
    if (user?.uid === 'demo_user') {
      saveDemoState((prev) => ({
        ...prev,
        splitSessions: [session, ...prev.splitSessions]
      }));
      return;
    }
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    const path = `users/${userId}/splitSessions/${session.id}`;
    try {
      await setDoc(doc(db, 'users', userId, 'splitSessions', session.id), {
        ...session,
        userId: userId
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const toggleSplitMemberPaid = async (sessionId: string, memberId: string) => {
    if (user?.uid === 'demo_user') {
      saveDemoState((prev) => {
        const updatedSplits = prev.splitSessions.map((s) => {
          if (s.id !== sessionId) return s;
          const updatedMembers = s.members.map((m) =>
            m.id === memberId ? { ...m, hasPaid: !m.hasPaid } : m
          );
          return { ...s, members: updatedMembers };
        });
        return { ...prev, splitSessions: updatedSplits };
      });
      return;
    }
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    const session = state.splitSessions.find((s) => s.id === sessionId);
    if (!session) return;
    const updatedMembers = session.members.map((m) =>
      m.id === memberId ? { ...m, hasPaid: !m.hasPaid } : m
    );
    const path = `users/${userId}/splitSessions/${sessionId}`;
    try {
      await updateDoc(doc(db, 'users', userId, 'splitSessions', sessionId), {
        members: updatedMembers
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const removeSplitSession = async (id: string) => {
    if (user?.uid === 'demo_user') {
      saveDemoState((prev) => ({
        ...prev,
        splitSessions: prev.splitSessions.filter((s) => s.id !== id)
      }));
      return;
    }
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    const path = `users/${userId}/splitSessions/${id}`;
    try {
      await deleteDoc(doc(db, 'users', userId, 'splitSessions', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const addSplitMember = async (sessionId: string, member: { id: string; name: string; hasPaid: boolean }) => {
    if (user?.uid === 'demo_user') {
      saveDemoState((prev) => {
        const updatedSplits = prev.splitSessions.map((s) => {
          if (s.id !== sessionId) return s;
          return { ...s, members: [...s.members, member] };
        });
        return { ...prev, splitSessions: updatedSplits };
      });
      return;
    }
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    const session = state.splitSessions.find((s) => s.id === sessionId);
    if (!session) return;
    const updatedMembers = [...session.members, member];
    const path = `users/${userId}/splitSessions/${sessionId}`;
    try {
      await updateDoc(doc(db, 'users', userId, 'splitSessions', sessionId), {
        members: updatedMembers
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const removeSplitMember = async (sessionId: string, memberId: string) => {
    if (user?.uid === 'demo_user') {
      saveDemoState((prev) => {
        const updatedSplits = prev.splitSessions.map((s) => {
          if (s.id !== sessionId) return s;
          return { ...s, members: s.members.filter((m) => m.id !== memberId) };
        });
        return { ...prev, splitSessions: updatedSplits };
      });
      return;
    }
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    const session = state.splitSessions.find((s) => s.id === sessionId);
    if (!session) return;
    const updatedMembers = session.members.filter((m) => m.id !== memberId);
    const path = `users/${userId}/splitSessions/${sessionId}`;
    try {
      await updateDoc(doc(db, 'users', userId, 'splitSessions', sessionId), {
        members: updatedMembers
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const markConfigured = async () => {
    if (user?.uid === 'demo_user') {
      saveDemoState((prev) => ({ ...prev, isConfigured: true }));
      return;
    }
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    const path = `users/${userId}`;
    try {
      await setDoc(doc(db, 'users', userId), {
        isConfigured: true,
        userId: userId
      }, { merge: true });
      setState((prev) => ({ ...prev, isConfigured: true }));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const logout = async () => {
    if (user?.uid === 'demo_user') {
      localStorage.removeItem('kosfinance_demo_mode');
      setUser(null);
      setState(defaultState);
      return;
    }
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logoout error", error);
    }
  };

  const deleteAccount = async () => {
    if (user?.uid === 'demo_user') {
      localStorage.removeItem('kosfinance_demo_mode');
      localStorage.removeItem('kosfinance_demo_state');
      setUser(null);
      setState(defaultState);
      return;
    }
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    const u = auth.currentUser;
    try {
      // 1. Delete all transactions
      for (const t of state.transactions) {
        await deleteDoc(doc(db, 'users', userId, 'transactions', t.id));
      }
      // 2. Delete all bills
      for (const b of state.bills) {
        await deleteDoc(doc(db, 'users', userId, 'bills', b.id));
      }
      // 3. Delete all splits
      for (const s of state.splitSessions) {
        await deleteDoc(doc(db, 'users', userId, 'splitSessions', s.id));
      }
      // 4. Delete profile settings
      await deleteDoc(doc(db, 'users', userId));
      
      // 5. Delete authentication user
      await deleteUser(u);
    } catch (error) {
      console.error("Gagal menghapus seluruh data akun:", error);
      throw error;
    }
  };

  const addSavingsTarget = async (target: SavingsTarget) => {
    if (user?.uid === 'demo_user') {
      saveDemoState((prev) => ({
        ...prev,
        savingsTargets: [target, ...(prev.savingsTargets || [])]
      }));
      return;
    }
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    const path = `users/${userId}/savingsTargets/${target.id}`;
    try {
      await setDoc(doc(db, 'users', userId, 'savingsTargets', target.id), {
        ...target,
        userId: userId
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const updateSavingsTarget = async (target: SavingsTarget) => {
    if (user?.uid === 'demo_user') {
      saveDemoState((prev) => ({
        ...prev,
        savingsTargets: (prev.savingsTargets || []).map((t) => t.id === target.id ? target : t)
      }));
      return;
    }
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    const path = `users/${userId}/savingsTargets/${target.id}`;
    try {
      await setDoc(doc(db, 'users', userId, 'savingsTargets', target.id), {
        ...target,
        userId: userId
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const removeSavingsTarget = async (id: string) => {
    if (user?.uid === 'demo_user') {
      saveDemoState((prev) => ({
        ...prev,
        savingsTargets: (prev.savingsTargets || []).filter((t) => t.id !== id)
      }));
      return;
    }
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    const path = `users/${userId}/savingsTargets/${id}`;
    try {
      await deleteDoc(doc(db, 'users', userId, 'savingsTargets', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const addCalendarEvent = async (event: CalendarEvent) => {
    if (user?.uid === 'demo_user') {
      saveDemoState((prev) => ({
        ...prev,
        calendarEvents: [event, ...(prev.calendarEvents || [])]
      }));
      return;
    }
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    const path = `users/${userId}/calendarEvents/${event.id}`;
    try {
      await setDoc(doc(db, 'users', userId, 'calendarEvents', event.id), {
        ...event,
        userId: userId
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const updateCalendarEvent = async (event: CalendarEvent) => {
    if (user?.uid === 'demo_user') {
      saveDemoState((prev) => ({
        ...prev,
        calendarEvents: (prev.calendarEvents || []).map((e) => e.id === event.id ? event : e)
      }));
      return;
    }
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    const path = `users/${userId}/calendarEvents/${event.id}`;
    try {
      await setDoc(doc(db, 'users', userId, 'calendarEvents', event.id), {
        ...event,
        userId: userId
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const removeCalendarEvent = async (id: string) => {
    if (user?.uid === 'demo_user') {
      saveDemoState((prev) => ({
        ...prev,
        calendarEvents: (prev.calendarEvents || []).filter((e) => e.id !== id)
      }));
      return;
    }
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    const path = `users/${userId}/calendarEvents/${id}`;
    try {
      await deleteDoc(doc(db, 'users', userId, 'calendarEvents', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  return (
    <StoreContext.Provider
      value={{
        state,
        user,
        authLoading,
        updateSettings,
        addTransaction,
        removeTransaction,
        addBill,
        toggleBillPaid,
        removeBill,
        addSplitSession,
        toggleSplitMemberPaid,
        removeSplitSession,
        addSplitMember,
        removeSplitMember,
        markConfigured,
        logout,
        deleteAccount,
        simulateLogin,
        addSavingsTarget,
        updateSavingsTarget,
        removeSavingsTarget,
        addCalendarEvent,
        updateCalendarEvent,
        removeCalendarEvent,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
