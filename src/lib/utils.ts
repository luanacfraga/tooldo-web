import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Retorna um ícone de prioridade usando "!".
 * Ex.: 1 -> "!", 2 -> "!!", 3 -> "!!!".
 */
export function getPriorityExclamation(level?: 0 | 1 | 2 | 3 | null): string {
  if (!level) return ''
  return '!'.repeat(level)
}
