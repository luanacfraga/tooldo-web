import { ActionPriority } from '@/lib/types/action'
import { cn, getPriorityExclamation } from '@/lib/utils'

interface PriorityBadgeProps {
  priority: ActionPriority
  showLabel?: boolean
  className?: string
}

const PRIORITY_CONFIG: Record<
  ActionPriority,
  {
    color: string
    label: string
    level: 0 | 1 | 2 | 3
  }
> = {
  [ActionPriority.LOW]: {
    color: 'text-muted-foreground',
    label: 'Baixa',
    level: 0,
  },
  [ActionPriority.MEDIUM]: {
    color: 'text-info',
    label: 'Média',
    level: 1,
  },
  [ActionPriority.HIGH]: {
    color: 'text-warning',
    label: 'Alta',
    level: 2,
  },
  [ActionPriority.URGENT]: {
    color: 'text-destructive',
    label: 'Urgente',
    level: 3,
  },
}

export function PriorityBadge({ priority, showLabel = true, className }: PriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority]

  if (!config) return null

  const exclamation = getPriorityExclamation(config.level)
  const hasExclamation = !!exclamation

  return (
    <div
      className={cn('flex items-center gap-1.5', className)}
      aria-label={`Prioridade ${config.label}`}
      title={`Prioridade ${config.label}`}
    >
      <span
        className={cn(
          'inline-flex h-4 w-4 items-center justify-center rounded-full border border-current text-[9px] font-black leading-none',
          config.color,
          !hasExclamation && 'opacity-70'
        )}
        aria-hidden="true"
      >
        {exclamation}
      </span>
      {showLabel && <span className="text-xs font-medium">{config.label}</span>}
    </div>
  )
}
