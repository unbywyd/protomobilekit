import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind classes with clsx
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * Custom scrollbar styles class
 * Beautiful, thin scrollbar matching dark theme
 */
export const scrollbarStyles = [
  // Webkit browsers (Chrome, Safari, Edge)
  '[&::-webkit-scrollbar]:w-2',
  '[&::-webkit-scrollbar-track]:bg-transparent',
  '[&::-webkit-scrollbar-thumb]:bg-neutral-800',
  '[&::-webkit-scrollbar-thumb]:rounded-full',
  '[&::-webkit-scrollbar-thumb]:border-[3px]',
  '[&::-webkit-scrollbar-thumb]:border-transparent',
  '[&::-webkit-scrollbar-thumb]:bg-clip-padding',
  'hover:[&::-webkit-scrollbar-thumb]:bg-neutral-700',
  'active:[&::-webkit-scrollbar-thumb]:bg-neutral-600',
  // Firefox
  '[scrollbar-width]:thin',
  '[scrollbar-color]:rgb(38_38_38)_transparent',
].join(' ')

/**
 * Hide scrollbar but keep scroll functionality
 */
export const scrollbarHide = [
  '[&::-webkit-scrollbar]:hidden',
  '[scrollbar-width]:none',
  '[-ms-overflow-style]:none',
].join(' ')
