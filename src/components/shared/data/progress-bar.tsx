import { cn } from '@/lib/utils'

type ProgressBarProps = {
  /**
   * Valor entre 0 e 100
   */
  value: number
  className?: string
  barClassName?: string
  /**
   * Texto acessível do progresso (screen readers)
   */
  label?: string
}

export function ProgressBar({
  value,
  className,
  barClassName,
  label = 'Progresso',
}: ProgressBarProps) {
  const safeValue = Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(safeValue)}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-muted/70', className)}
    >
      <div
        className={cn(
          'h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-[width] duration-500 ease-out',
          barClassName
        )}
        style={{ width: `${safeValue}%` }}
      />
    </div>
  )
}
