import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number, decimals: number = 2): string {
  return num.toFixed(decimals);
}

export function getColorForIndex(index: number): string {
  const colors = [
    '#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6',
    '#ec4899', '#06b6d4', '#f97316', '#84cc16', '#6366f1',
  ];
  return colors[index % colors.length];
}

export function getLoadColor(load: number, maxLoad: number): string {
  const ratio = load / maxLoad;
  if (ratio < 0.5) return '#10b981';
  if (ratio < 0.8) return '#f59e0b';
  return '#ef4444';
}
