import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

/**
 * Componente padronizado para estados vazios
 * Usado quando não há dados para exibir
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <Card className={cn('animate-fade-in', className)}>
      <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
        {Icon && (
          <div className="rounded-full bg-muted p-4 sm:p-6">
            <Icon className="h-8 w-8 text-muted-foreground sm:h-12 sm:w-12" />
          </div>
        )}
        <h3 className="mt-6 text-lg font-semibold sm:text-xl">{title}</h3>
        {description && (
          <p className="mt-2 text-center text-sm text-muted-foreground sm:max-w-md">
            {description}
          </p>
        )}
        {action && (
          <Button onClick={action.onClick} className="mt-6" size="lg">
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

