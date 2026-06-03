import { differenceInDays, addMonths, setDate, isBefore, startOfDay, addDays, getWeek, startOfWeek, differenceInWeeks } from 'date-fns';
import { AppState, Transaction } from '../types';

export function getCurrentCycle(cycleStartDate: number) {
  const today = startOfDay(new Date());
  let currentCycleStart = setDate(today, cycleStartDate);
  
  if (isBefore(today, currentCycleStart)) {
    // If today is before this month's cycle start date, it means we're in the cycle that started last month
    currentCycleStart = addMonths(currentCycleStart, -1);
  }
  
  const currentCycleEnd = addMonths(currentCycleStart, 1);
  
  return {
    start: currentCycleStart,
    end: currentCycleEnd,
    daysTotal: differenceInDays(currentCycleEnd, currentCycleStart),
    daysRemaining: differenceInDays(currentCycleEnd, today),
  };
}

export function getPreviousCycle(cycleStartDate: number) {
  const current = getCurrentCycle(cycleStartDate);
  const start = addMonths(current.start, -1);
  const end = current.start;
  return {
    start,
    end,
    daysTotal: differenceInDays(end, start),
  };
}

export function getTransactionsInCycle(transactions: Transaction[], start: Date, end: Date) {
  return transactions.filter(t => {
    const d = startOfDay(new Date(t.date));
    return d >= start && d < end;
  });
}

export function groupTransactionsByWeek(transactions: Transaction[], cycleStart: Date) {
  const weeks: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  
  transactions.forEach(t => {
    const d = new Date(t.date);
    // Simple 7-day week chunking from cycle start
    const daysDiff = differenceInDays(d, cycleStart);
    const weekNum = Math.floor(daysDiff / 7) + 1;
    if (weeks[weekNum] !== undefined) {
      weeks[weekNum] += t.amount;
    }
  });

  return Object.keys(weeks).map(w => ({
    week: parseInt(w),
    name: `Minggu ${w}`,
    amount: weeks[parseInt(w)] || 0
  })).filter(w => w.week <= 4 || w.amount > 0); // Keep max 4 or 5 weeks if populated
}

