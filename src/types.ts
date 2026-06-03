export type ExpenseCategory = 'wajib' | 'fleksibel' | 'darurat' | 'pemasukan';

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: ExpenseCategory;
  tag?: string;
  date: string; // ISO date string
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: number; // Day of the month (1-31)
  isPaid: boolean;
  lastPaidMonth?: string; // YYYY-MM
}

export interface SplitMember {
  id: string;
  name: string;
  hasPaid: boolean;
}

export interface SplitSession {
  id: string;
  title: string;
  totalAmount: number;
  date: string; // ISO date
  members: SplitMember[];
}

export interface AppSettings {
  allowanceAmount: number;
  cycleStartDate: number; // Day of the month
  survivalThreshold: number; // Amount below which survival mode activates
  allocations: {
    wajib: number; // percentage (0-100)
    fleksibel: number; // percentage (0-100)
    darurat: number; // percentage (0-100)
  };
}

export interface SavingsTarget {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  dueDate?: string; // YYYY-MM-DD
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  type: 'reminder' | 'target' | 'info';
  amount?: number;
}

export interface AppState {
  settings: AppSettings;
  transactions: Transaction[];
  bills: Bill[];
  splitSessions: SplitSession[];
  savingsTargets: SavingsTarget[];
  calendarEvents: CalendarEvent[];
  isConfigured: boolean;
  current_balance?: number;
}
