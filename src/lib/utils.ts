import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatIDR(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumberWithDots(val: string | number): string {
  if (val === undefined || val === null || val === '') return '';
  const clean = String(val).replace(/\D/g, '');
  if (!clean) return '';
  return new Intl.NumberFormat('id-ID').format(Number(clean));
}

export function parseNumberFromDots(val: string): number {
  if (!val) return 0;
  // Remove currency prefix, dots, whitespaces, and any other non-digit characters
  const clean = val.replace(/Rp/gi, '').replace(/\./g, '').replace(/\s/g, '').replace(/\D/g, '');
  const parsed = Number(clean);
  return isNaN(parsed) ? 0 : parsed;
}

