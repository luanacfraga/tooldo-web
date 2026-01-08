'use client'

import type { DatePreset } from '@/lib/utils/date-presets'
import { getPeriodComparisonLabel } from '@/lib/utils/period-comparator'

interface PeriodIndicatorProps {
  preset: DatePreset
  className?: string
}

export function PeriodIndicator({ preset, className = '' }: PeriodIndicatorProps) {
  const label = getPeriodComparisonLabel(preset)

  return (
    <div className={`text-sm text-muted-foreground ${className}`}>
      {label}
    </div>
  )
}
