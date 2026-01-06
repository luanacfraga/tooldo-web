'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { MetricComparison } from '@/lib/types/dashboard'
import type { LucideIcon } from 'lucide-react'

interface MetricCardWithComparisonProps {
  title: string
  value: number | string
  comparison?: MetricComparison
  icon?: LucideIcon
  iconColor?: string
  bgColor?: string
}

export function MetricCardWithComparison({
  title,
  value,
  comparison,
  icon: Icon,
  iconColor = 'text-primary',
  bgColor = 'bg-primary/10',
}: MetricCardWithComparisonProps) {
  // Determinar cor do comparativo
  const getComparisonColor = () => {
    if (!comparison) return 'text-muted-foreground'

    if (comparison.absolute === 0) return 'text-muted-foreground'

    return comparison.isImprovement ? 'text-success' : 'text-destructive'
  }

  // Determinar ícone do comparativo
  const getComparisonIcon = () => {
    if (!comparison || comparison.absolute === 0) return Minus

    return comparison.absolute > 0 ? TrendingUp : TrendingDown
  }

  const ComparisonIcon = getComparisonIcon()
  const comparisonColor = getComparisonColor()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && (
          <div className={`rounded-md p-2 ${bgColor}`}>
            <Icon className={`h-4 w-4 ${iconColor}`} />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {comparison && (
          <div className={`flex items-center gap-1 text-xs ${comparisonColor} mt-1`}>
            <ComparisonIcon className="h-3 w-3" />
            <span>
              {comparison.absolute > 0 ? '+' : ''}
              {comparison.absolute} ({comparison.percent > 0 ? '+' : ''}
              {comparison.percent}%)
            </span>
          </div>
        )}
        {comparison && (
          <p className="text-xs text-muted-foreground mt-1">vs período anterior</p>
        )}
      </CardContent>
    </Card>
  )
}
