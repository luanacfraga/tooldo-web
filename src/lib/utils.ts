import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getPriorityExclamation(level?: 0 | 1 | 2 | 3 | null): string {
  if (!level) return ''
  return '!'.repeat(level)
}
