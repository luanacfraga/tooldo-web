'use client'

import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import Image from 'next/image'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  useImage?: boolean
}

const sizeClasses = {
  sm: { width: 80, height: 24 },
  md: { width: 120, height: 36 },
  lg: { width: 160, height: 48 },
  xl: { width: 200, height: 60 },
}

const textSizeClasses = {
  sm: 'text-lg',
  md: 'text-xl sm:text-2xl',
  lg: 'text-3xl',
  xl: 'text-4xl md:text-5xl',
}

export function Logo({ className, size = 'md', showText = true, useImage = true }: LogoProps) {
  if (useImage && showText) {
    return (
      <div className={cn('flex items-center', className)}>
        <Image
          src="/images/tooldo.png"
          alt="ToolDo"
          width={sizeClasses[size].width}
          height={sizeClasses[size].height}
          className="h-auto object-contain"
          priority
        />
      </div>
    )
  }

  return (
    <div className={cn('flex items-center', className)}>
      {showText && (
        <>
          <span className={cn('font-extrabold tracking-tight text-primary', textSizeClasses[size])}>
            Tool
          </span>
          <div className="relative -ml-0.5 inline-flex items-center justify-center">
            <div
              className={cn(
                'relative flex items-center justify-center border-2 border-primary bg-transparent',
                'border-r-0',
                size === 'sm' && 'h-5 w-5 rounded-l',
                size === 'md' && 'h-6 w-6 rounded-l sm:h-7 sm:w-7',
                size === 'lg' && 'h-8 w-8 rounded-l',
                size === 'xl' && 'h-10 w-10 rounded-l'
              )}
            >
              <Check
                className={cn(
                  'text-primary',
                  size === 'sm' && 'h-3 w-3',
                  size === 'md' && 'h-3.5 w-3.5 sm:h-4 sm:w-4',
                  size === 'lg' && 'h-5 w-5',
                  size === 'xl' && 'h-6 w-6'
                )}
                strokeWidth={3}
              />
            </div>
          </div>
          <span
            className={cn(
              '-ml-0.5 font-extrabold tracking-tight text-primary',
              textSizeClasses[size]
            )}
          >
            o
          </span>
        </>
      )}
      {!showText && (
        <div className="relative inline-flex items-center justify-center">
          <div
            className={cn(
              'relative flex items-center justify-center rounded border-2 border-primary bg-transparent',
              size === 'sm' && 'h-5 w-5',
              size === 'md' && 'h-6 w-6 sm:h-7 sm:w-7',
              size === 'lg' && 'h-8 w-8',
              size === 'xl' && 'h-10 w-10'
            )}
          >
            <Check
              className={cn(
                'text-primary',
                size === 'sm' && 'h-3 w-3',
                size === 'md' && 'h-3.5 w-3.5 sm:h-4 sm:w-4',
                size === 'lg' && 'h-5 w-5',
                size === 'xl' && 'h-6 w-6'
              )}
              strokeWidth={3}
            />
          </div>
        </div>
      )}
    </div>
  )
}
