import { getActionStatusUI } from '@/components/features/actions/shared/action-status-ui'
import { Badge } from '@/components/ui/badge'
import { ActionStatus } from '@/lib/types/action'
import { cn } from '@/lib/utils'
import { CheckCircle2, Circle, CircleDot } from 'lucide-react'

interface StatusBadgeProps {
  status: ActionStatus
  className?: string
  /**
   * Controla se o texto do status será exibido.
   * Útil para usar apenas o texto ou ícone em contextos mais compactos (ex: colunas do Kanban).
   */
  showLabel?: boolean
  /**
   * Define o estilo visual:
   * - "badge": pill com fundo/borda (padrão, como na tabela)
   * - "minimal": sem retângulo, apenas ícone + texto
   */
  variant?: 'badge' | 'minimal'
}

export function StatusBadge({
  status,
  className,
  showLabel = true,
  variant = 'badge',
}: StatusBadgeProps) {
  const statusUI = getActionStatusUI(status)

  const iconConfig = {
    [ActionStatus.TODO]: Circle,
    [ActionStatus.IN_PROGRESS]: CircleDot,
    [ActionStatus.DONE]: CheckCircle2,
  }[status]

  if (!statusUI || !iconConfig) {
    return (
      <Badge variant="outline" className={className}>
        {status}
      </Badge>
    )
  }

  const Icon = iconConfig

  if (variant === 'minimal') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 text-xs font-medium',
          statusUI.kanban.titleClass,
          className
        )}
      >
        <Icon className="h-4 w-4" />
        {showLabel && statusUI.label}
      </span>
    )
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap',
        statusUI.badgeClass,
        className
      )}
    >
      {/* Usamos apenas tamanho aqui; a cor vem de text-* herdado do próprio badge */}
      <Icon className="h-4 w-4" />
      {showLabel && statusUI.label}
    </Badge>
  )
}
