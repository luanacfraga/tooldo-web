import { cn } from '@/lib/utils'
import { AlertCircle } from 'lucide-react'

interface LateIndicatorProps {
  isLate: boolean
  className?: string
}

export function LateIndicator({ isLate, className }: LateIndicatorProps) {
  if (!isLate) return null

  return (
    <div
      className={cn('flex items-center gap-1 text-amber-600', className)}
      title="This action is late"
    >
      <AlertCircle className="h-4 w-4" />
      <span className="text-xs font-medium">Atrasada</span>
    </div>
  )
}
