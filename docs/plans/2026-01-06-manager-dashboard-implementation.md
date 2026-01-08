# Dashboard do Gestor - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a motivational dashboard for managers to track team performance with rankings, metrics, and comparatives.

**Architecture:** React components consuming parallel API calls (current + previous period), calculating metrics client-side, displaying with recharts visualizations and shadcn/ui components.

**Tech Stack:** Next.js 14 App Router, TypeScript, React Query, Zustand, Recharts, shadcn/ui, Tailwind CSS

---

## Task 1: Create Dashboard Types

**Files:**
- Create: `src/lib/types/dashboard.ts`

**Step 1: Create type definitions file**

Create `src/lib/types/dashboard.ts` with complete type definitions:

```typescript
import { ActionStatus } from './action'

/**
 * Métricas de um membro da equipe
 */
export interface TeamMemberMetrics {
  // Identificação
  userId: string
  name: string
  avatar?: string

  // Métricas do período atual
  totalDeliveries: number // Ações com status DONE
  completionRate: number // (DONE / TOTAL) * 100
  inProgress: number // Ações IN_PROGRESS
  late: number // Ações atrasadas (isLate = true)
  totalActions: number // Total de ações no período

  // Comparativos com período anterior
  deliveriesChange: number // +15 ou -3 (diferença absoluta)
  deliveriesChangePercent: number // +50% ou -20%
  completionRateChange: number // +5 ou -10 (pontos percentuais)
}

/**
 * Métricas agregadas da equipe
 */
export interface TeamMetrics {
  // Período atual
  totalDeliveries: number
  avgCompletionRate: number
  velocity: number // ações/semana ou ações/mês
  totalLate: number
  totalMembers: number
  totalActions: number

  // Comparativos
  deliveriesChange: number
  deliveriesChangePercent: number
  velocityChange: number
  lateChange: number
  completionRateChange: number
}

/**
 * Ponto de dados para gráfico de tendência
 */
export interface DeliveryTrendDataPoint {
  date: string // ISO date
  deliveries: number
  label: string // Label formatada para exibição
}

/**
 * Dados de comparação de métricas
 */
export interface MetricComparison {
  absolute: number // +15 ou -3
  percent: number // +50 ou -20
  isImprovement: boolean // true = verde, false = vermelho
  isInverted?: boolean // true = menos é melhor (para atrasadas)
}
```

**Step 2: Verify file was created**

Run: `cat src/lib/types/dashboard.ts | head -20`
Expected: File exists with type definitions

**Step 3: Commit**

```bash
git add src/lib/types/dashboard.ts
git commit -m "feat(dashboard): add TypeScript types for team metrics

- Add TeamMemberMetrics interface
- Add TeamMetrics interface
- Add DeliveryTrendDataPoint interface
- Add MetricComparison interface"
```

---

## Task 2: Create Period Comparator Utility

**Files:**
- Create: `src/lib/utils/period-comparator.ts`

**Step 1: Create period comparator utility**

Create `src/lib/utils/period-comparator.ts`:

```typescript
import {
  type DatePreset,
  getThisWeekRange,
  getLastTwoWeeksRange,
  getThisMonthRange,
  getLastThirtyDaysRange,
} from './date-presets'

export interface DateRange {
  dateFrom: string
  dateTo: string
}

/**
 * Retorna o período anterior equivalente ao período dado
 *
 * @example
 * // Se período atual é Esta Semana (05-11 Jan)
 * // Retorna Semana Passada (29 Dez - 04 Jan)
 * getPreviousPeriod('esta-semana')
 */
export function getPreviousPeriod(preset: DatePreset): DateRange {
  const currentRange = getPresetRange(preset)

  const currentStart = new Date(currentRange.dateFrom)
  const currentEnd = new Date(currentRange.dateTo)

  // Calcula duração do período em milissegundos
  const duration = currentEnd.getTime() - currentStart.getTime()

  // Período anterior termina 1ms antes do início do atual
  const previousEnd = new Date(currentStart.getTime() - 1)

  // Período anterior começa duração antes do fim
  const previousStart = new Date(previousEnd.getTime() - duration)

  return {
    dateFrom: previousStart.toISOString(),
    dateTo: previousEnd.toISOString(),
  }
}

/**
 * Retorna o range de datas para um preset
 */
export function getPresetRange(preset: DatePreset): DateRange {
  switch (preset) {
    case 'esta-semana':
      return getThisWeekRange()
    case 'ultimas-2-semanas':
      return getLastTwoWeeksRange()
    case 'este-mes':
      return getThisMonthRange()
    case 'ultimos-30-dias':
      return getLastThirtyDaysRange()
    default:
      return getThisWeekRange()
  }
}

/**
 * Formata um range de datas para exibição
 *
 * @example
 * formatPeriodRange({ dateFrom: '2026-01-05', dateTo: '2026-01-11' })
 * // => "05 a 11 de Jan"
 */
export function formatPeriodRange(range: DateRange): string {
  const start = new Date(range.dateFrom)
  const end = new Date(range.dateTo)

  const monthNames = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ]

  const startDay = start.getDate()
  const endDay = end.getDate()
  const month = monthNames[end.getMonth()]

  if (start.getMonth() === end.getMonth()) {
    return `${startDay} a ${endDay} de ${month}`
  }

  const startMonth = monthNames[start.getMonth()]
  return `${startDay} de ${startMonth} a ${endDay} de ${month}`
}

/**
 * Retorna label descritivo para comparação de períodos
 *
 * @example
 * getPeriodComparisonLabel('esta-semana')
 * // => "Esta Semana vs Semana Passada"
 */
export function getPeriodComparisonLabel(preset: DatePreset): string {
  switch (preset) {
    case 'esta-semana':
      return 'Esta Semana vs Semana Passada'
    case 'ultimas-2-semanas':
      return 'Últimas 2 Semanas vs 2 Semanas Anteriores'
    case 'este-mes':
      return 'Este Mês vs Mês Passado'
    case 'ultimos-30-dias':
      return 'Últimos 30 Dias vs 30 Dias Anteriores'
    default:
      return 'Período Atual vs Período Anterior'
  }
}
```

**Step 2: Verify file was created**

Run: `cat src/lib/utils/period-comparator.ts | grep -c "export function"`
Expected: Output should be "4" (4 exported functions)

**Step 3: Commit**

```bash
git add src/lib/utils/period-comparator.ts
git commit -m "feat(dashboard): add period comparison utilities

- Add getPreviousPeriod() to calculate previous equivalent period
- Add getPresetRange() to get date range from preset
- Add formatPeriodRange() for display formatting
- Add getPeriodComparisonLabel() for descriptive labels"
```

---

## Task 3: Create Metrics Calculator Utility

**Files:**
- Create: `src/lib/utils/metrics-calculator.ts`

**Step 1: Create metrics calculator utility**

Create `src/lib/utils/metrics-calculator.ts`:

```typescript
import type { Action } from '@/lib/types/action'
import type {
  TeamMemberMetrics,
  TeamMetrics,
  MetricComparison,
  DeliveryTrendDataPoint,
} from '@/lib/types/dashboard'
import { ActionStatus } from '@/lib/types/action'

interface User {
  id: string
  firstName: string
  lastName: string
  avatar?: string
}

/**
 * Calcula métricas individuais de cada membro da equipe
 */
export function calculateTeamMemberMetrics(
  currentPeriodActions: Action[],
  previousPeriodActions: Action[],
  teamMembers: User[]
): TeamMemberMetrics[] {
  return teamMembers.map((member) => {
    // Filtrar ações do membro no período atual
    const currentActions = currentPeriodActions.filter(
      (a) => a.responsibleId === member.id
    )

    // Filtrar ações do membro no período anterior
    const previousActions = previousPeriodActions.filter(
      (a) => a.responsibleId === member.id
    )

    // Métricas atuais
    const totalActions = currentActions.length
    const totalDeliveries = currentActions.filter(
      (a) => a.status === ActionStatus.DONE
    ).length
    const completionRate = totalActions > 0 ? (totalDeliveries / totalActions) * 100 : 0
    const inProgress = currentActions.filter(
      (a) => a.status === ActionStatus.IN_PROGRESS
    ).length
    const late = currentActions.filter((a) => a.isLate).length

    // Métricas anteriores
    const previousTotalActions = previousActions.length
    const previousDeliveries = previousActions.filter(
      (a) => a.status === ActionStatus.DONE
    ).length
    const previousCompletionRate =
      previousTotalActions > 0
        ? (previousDeliveries / previousTotalActions) * 100
        : 0

    // Comparativos
    const deliveriesChange = totalDeliveries - previousDeliveries
    const deliveriesChangePercent =
      previousDeliveries > 0
        ? ((totalDeliveries - previousDeliveries) / previousDeliveries) * 100
        : totalDeliveries > 0
        ? 100
        : 0

    const completionRateChange = completionRate - previousCompletionRate

    return {
      userId: member.id,
      name: `${member.firstName} ${member.lastName}`,
      avatar: member.avatar,
      totalDeliveries,
      completionRate: Math.round(completionRate),
      inProgress,
      late,
      totalActions,
      deliveriesChange,
      deliveriesChangePercent: Math.round(deliveriesChangePercent),
      completionRateChange: Math.round(completionRateChange),
    }
  })
}

/**
 * Calcula métricas agregadas da equipe inteira
 */
export function calculateTeamMetrics(
  currentPeriodActions: Action[],
  previousPeriodActions: Action[],
  teamMembers: User[]
): TeamMetrics {
  // Métricas atuais
  const totalActions = currentPeriodActions.length
  const totalDeliveries = currentPeriodActions.filter(
    (a) => a.status === ActionStatus.DONE
  ).length
  const avgCompletionRate = totalActions > 0 ? (totalDeliveries / totalActions) * 100 : 0
  const totalLate = currentPeriodActions.filter((a) => a.isLate).length

  // Métricas anteriores
  const previousTotalActions = previousPeriodActions.length
  const previousDeliveries = previousPeriodActions.filter(
    (a) => a.status === ActionStatus.DONE
  ).length
  const previousAvgCompletionRate =
    previousTotalActions > 0
      ? (previousDeliveries / previousTotalActions) * 100
      : 0
  const previousLate = previousPeriodActions.filter((a) => a.isLate).length

  // Comparativos
  const deliveriesChange = totalDeliveries - previousDeliveries
  const deliveriesChangePercent =
    previousDeliveries > 0
      ? ((totalDeliveries - previousDeliveries) / previousDeliveries) * 100
      : totalDeliveries > 0
      ? 100
      : 0

  const completionRateChange = avgCompletionRate - previousAvgCompletionRate
  const lateChange = totalLate - previousLate

  // Velocidade (ações concluídas por semana - assumindo períodos semanais)
  const velocity = totalDeliveries
  const previousVelocity = previousDeliveries
  const velocityChange = velocity - previousVelocity

  return {
    totalDeliveries,
    avgCompletionRate: Math.round(avgCompletionRate),
    velocity,
    totalLate,
    totalMembers: teamMembers.length,
    totalActions,
    deliveriesChange,
    deliveriesChangePercent: Math.round(deliveriesChangePercent),
    velocityChange,
    lateChange,
    completionRateChange: Math.round(completionRateChange),
  }
}

/**
 * Cria objeto de comparação para exibição em cards
 */
export function createMetricComparison(
  currentValue: number,
  previousValue: number,
  isInverted = false
): MetricComparison | undefined {
  // Se ambos são zero, não mostra comparativo
  if (currentValue === 0 && previousValue === 0) {
    return undefined
  }

  const absolute = currentValue - previousValue
  const percent =
    previousValue > 0
      ? ((currentValue - previousValue) / previousValue) * 100
      : currentValue > 0
      ? 100
      : 0

  // Por padrão: aumento é melhoria
  // Se invertido (ex: atrasadas): diminuição é melhoria
  const isImprovement = isInverted ? absolute < 0 : absolute > 0

  return {
    absolute,
    percent: Math.round(percent),
    isImprovement,
    isInverted,
  }
}

/**
 * Agrupa entregas por dia para gráfico de tendência
 */
export function groupDeliveriesByDay(actions: Action[]): DeliveryTrendDataPoint[] {
  const deliveriesByDate = new Map<string, number>()

  // Contar entregas por dia (apenas ações DONE)
  actions
    .filter((a) => a.status === ActionStatus.DONE && a.actualEndDate)
    .forEach((action) => {
      const date = new Date(action.actualEndDate!)
      const dateKey = date.toISOString().split('T')[0] // YYYY-MM-DD

      const current = deliveriesByDate.get(dateKey) || 0
      deliveriesByDate.set(dateKey, current + 1)
    })

  // Converter para array e ordenar por data
  const dataPoints: DeliveryTrendDataPoint[] = Array.from(deliveriesByDate.entries())
    .map(([date, deliveries]) => ({
      date,
      deliveries,
      label: formatDateLabel(date),
    }))
    .sort((a, b) => a.date.localeCompare(b.date))

  return dataPoints
}

/**
 * Formata data para label do gráfico
 */
function formatDateLabel(dateString: string): string {
  const date = new Date(dateString)
  const day = date.getDate()
  const month = date.getMonth() + 1

  return `${day}/${month}`
}
```

**Step 2: Verify file was created**

Run: `cat src/lib/utils/metrics-calculator.ts | grep -c "export function"`
Expected: Output should be "5" (5 exported functions)

**Step 3: Commit**

```bash
git add src/lib/utils/metrics-calculator.ts
git commit -m "feat(dashboard): add metrics calculation utilities

- Add calculateTeamMemberMetrics() for individual metrics
- Add calculateTeamMetrics() for aggregated team metrics
- Add createMetricComparison() for comparison objects
- Add groupDeliveriesByDay() for trend chart data
- Handle edge cases (zero values, inverted metrics)"
```

---

## Task 4: Create useTeamMetrics Hook

**Files:**
- Create: `src/lib/hooks/use-team-metrics.ts`

**Step 1: Create custom hook for team metrics**

Create `src/lib/hooks/use-team-metrics.ts`:

```typescript
'use client'

import { useMemo } from 'react'
import type { DatePreset } from '@/lib/utils/date-presets'
import type { TeamMemberMetrics, TeamMetrics } from '@/lib/types/dashboard'
import { useActions } from './use-actions'
import { getPresetRange, getPreviousPeriod } from '@/lib/utils/period-comparator'
import {
  calculateTeamMemberMetrics,
  calculateTeamMetrics,
} from '@/lib/utils/metrics-calculator'

interface User {
  id: string
  firstName: string
  lastName: string
  avatar?: string
}

interface UseTeamMetricsParams {
  teamId: string
  preset: DatePreset
  teamMembers: User[]
}

interface UseTeamMetricsResult {
  memberMetrics: TeamMemberMetrics[]
  teamMetrics: TeamMetrics
  isLoading: boolean
  error: Error | null
}

/**
 * Hook para buscar e calcular métricas da equipe
 *
 * Faz 2 chamadas paralelas à API:
 * 1. Ações do período atual
 * 2. Ações do período anterior
 *
 * Depois calcula todas as métricas e comparativos no cliente.
 */
export function useTeamMetrics({
  teamId,
  preset,
  teamMembers,
}: UseTeamMetricsParams): UseTeamMetricsResult {
  // Calcular ranges de datas
  const currentPeriod = useMemo(() => getPresetRange(preset), [preset])
  const previousPeriod = useMemo(() => getPreviousPeriod(preset), [preset])

  // Buscar ações do período atual
  const currentQuery = useActions({
    teamId,
    dateFrom: currentPeriod.dateFrom,
    dateTo: currentPeriod.dateTo,
    dateFilterType: 'createdAt',
    page: 1,
    limit: 1000,
  })

  // Buscar ações do período anterior
  const previousQuery = useActions({
    teamId,
    dateFrom: previousPeriod.dateFrom,
    dateTo: previousPeriod.dateTo,
    dateFilterType: 'createdAt',
    page: 1,
    limit: 1000,
  })

  // Calcular métricas quando ambas queries carregarem
  const memberMetrics = useMemo(() => {
    if (!currentQuery.data || !previousQuery.data) return []

    return calculateTeamMemberMetrics(
      currentQuery.data.data,
      previousQuery.data.data,
      teamMembers
    )
  }, [currentQuery.data, previousQuery.data, teamMembers])

  const teamMetrics = useMemo(() => {
    if (!currentQuery.data || !previousQuery.data) {
      return {
        totalDeliveries: 0,
        avgCompletionRate: 0,
        velocity: 0,
        totalLate: 0,
        totalMembers: 0,
        totalActions: 0,
        deliveriesChange: 0,
        deliveriesChangePercent: 0,
        velocityChange: 0,
        lateChange: 0,
        completionRateChange: 0,
      }
    }

    return calculateTeamMetrics(
      currentQuery.data.data,
      previousQuery.data.data,
      teamMembers
    )
  }, [currentQuery.data, previousQuery.data, teamMembers])

  return {
    memberMetrics,
    teamMetrics,
    isLoading: currentQuery.isLoading || previousQuery.isLoading,
    error: currentQuery.error || previousQuery.error,
  }
}
```

**Step 2: Verify file was created**

Run: `cat src/lib/hooks/use-team-metrics.ts | grep "export function"`
Expected: Output contains "export function useTeamMetrics"

**Step 3: Commit**

```bash
git add src/lib/hooks/use-team-metrics.ts
git commit -m "feat(dashboard): add useTeamMetrics hook

- Parallel API calls for current and previous periods
- Automatic metrics calculation using utilities
- Returns member metrics, team metrics, loading, and error states
- Memoized for performance"
```

---

## Task 5: Create PeriodFilter Component

**Files:**
- Create: `src/components/features/dashboard/shared/period-filter.tsx`

**Step 1: Create period filter component**

Create `src/components/features/dashboard/shared/period-filter.tsx`:

```typescript
'use client'

import { Button } from '@/components/ui/button'
import type { DatePreset } from '@/lib/utils/date-presets'

interface PeriodFilterProps {
  selected: DatePreset
  onChange: (preset: DatePreset) => void
}

const presetOptions: Array<{ value: DatePreset; label: string }> = [
  { value: 'esta-semana', label: 'Esta Semana' },
  { value: 'este-mes', label: 'Este Mês' },
  { value: 'ultimos-30-dias', label: 'Últimos 30 Dias' },
]

export function PeriodFilter({ selected, onChange }: PeriodFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {presetOptions.map((option) => (
        <Button
          key={option.value}
          variant={selected === option.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  )
}
```

**Step 2: Verify component was created**

Run: `cat src/components/features/dashboard/shared/period-filter.tsx | grep "export function"`
Expected: Output contains "export function PeriodFilter"

**Step 3: Commit**

```bash
git add src/components/features/dashboard/shared/period-filter.tsx
git commit -m "feat(dashboard): add PeriodFilter component

- Buttons for Esta Semana, Este Mês, Últimos 30 Dias
- Active state with variant=default
- Compact size for header placement"
```

---

## Task 6: Create PeriodIndicator Component

**Files:**
- Create: `src/components/features/dashboard/shared/period-indicator.tsx`

**Step 1: Create period indicator component**

Create `src/components/features/dashboard/shared/period-indicator.tsx`:

```typescript
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
```

**Step 2: Verify component was created**

Run: `cat src/components/features/dashboard/shared/period-indicator.tsx | grep "export function"`
Expected: Output contains "export function PeriodIndicator"

**Step 3: Commit**

```bash
git add src/components/features/dashboard/shared/period-indicator.tsx
git commit -m "feat(dashboard): add PeriodIndicator component

- Shows descriptive comparison label
- Uses getPeriodComparisonLabel utility
- Styled as muted secondary text"
```

---

## Task 7: Create MetricCardWithComparison Component

**Files:**
- Create: `src/components/features/dashboard/shared/metric-card-with-comparison.tsx`

**Step 1: Create metric card with comparison component**

Create `src/components/features/dashboard/shared/metric-card-with-comparison.tsx`:

```typescript
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
```

**Step 2: Verify component was created**

Run: `cat src/components/features/dashboard/shared/metric-card-with-comparison.tsx | grep "export function"`
Expected: Output contains "export function MetricCardWithComparison"

**Step 3: Commit**

```bash
git add src/components/features/dashboard/shared/metric-card-with-comparison.tsx
git commit -m "feat(dashboard): add MetricCardWithComparison component

- Card with title, value, icon, and comparison
- Green/red colors based on improvement
- TrendingUp/Down icons for changes
- Handles inverted metrics (less is better)"
```

---

## Task 8: Install Recharts

**Files:**
- Modify: `package.json`

**Step 1: Install recharts library**

Run: `npm install recharts`
Expected: Package installed successfully

**Step 2: Verify installation**

Run: `grep recharts package.json`
Expected: Output contains "recharts" in dependencies

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install recharts for dashboard charts"
```

---

## Task 9: Create TeamRankingChart Component

**Files:**
- Create: `src/components/features/dashboard/manager/team-ranking-chart.tsx`

**Step 1: Create ranking chart component**

Create `src/components/features/dashboard/manager/team-ranking-chart.tsx`:

```typescript
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts'
import { Trophy } from 'lucide-react'
import type { TeamMemberMetrics } from '@/lib/types/dashboard'

interface TeamRankingChartProps {
  members: TeamMemberMetrics[]
  maxDisplay?: number
}

export function TeamRankingChart({ members, maxDisplay = 5 }: TeamRankingChartProps) {
  // Ordenar por total de entregas (maior para menor)
  const sortedMembers = [...members]
    .sort((a, b) => b.totalDeliveries - a.totalDeliveries)
    .slice(0, maxDisplay)

  // Cores baseadas na posição
  const getBarColor = (index: number) => {
    if (index === 0) return 'hsl(var(--primary))' // #1: primary (roxo)
    if (index <= 2) return 'hsl(var(--info))' // #2-3: info (azul)
    return 'hsl(var(--muted))' // Demais: muted (cinza)
  }

  // Se não tem membros ou entregas
  if (sortedMembers.length === 0 || sortedMembers.every(m => m.totalDeliveries === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ranking da Equipe</CardTitle>
          <CardDescription>Top {maxDisplay} performers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Sem entregas neste período
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ranking da Equipe</CardTitle>
        <CardDescription>Top {maxDisplay} performers</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={sortedMembers} layout="vertical" margin={{ left: 0, right: 20 }}>
            <XAxis type="number" />
            <YAxis
              dataKey="name"
              type="category"
              width={120}
              tick={{ fontSize: 12 }}
            />
            <Bar dataKey="totalDeliveries" radius={[0, 4, 4, 0]}>
              {sortedMembers.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(index)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Badge para #1 */}
        {sortedMembers[0] && sortedMembers[0].totalDeliveries > 0 && (
          <div className="mt-4 flex items-center gap-2 text-sm">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span className="font-medium">{sortedMembers[0].name}</span>
            <span className="text-muted-foreground">lidera com {sortedMembers[0].totalDeliveries} entregas</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

**Step 2: Verify component was created**

Run: `cat src/components/features/dashboard/manager/team-ranking-chart.tsx | grep "export function"`
Expected: Output contains "export function TeamRankingChart"

**Step 3: Commit**

```bash
git add src/components/features/dashboard/manager/team-ranking-chart.tsx
git commit -m "feat(dashboard): add TeamRankingChart component

- Horizontal bar chart with recharts
- Top 5 members by deliveries
- Color-coded bars (purple/blue/gray)
- Trophy badge for #1 performer
- Empty state for no deliveries"
```

---

## Task 10: Create DeliveryTrendChart Component

**Files:**
- Create: `src/components/features/dashboard/manager/delivery-trend-chart.tsx`

**Step 1: Create trend chart component**

Create `src/components/features/dashboard/manager/delivery-trend-chart.tsx`:

```typescript
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts'
import type { DeliveryTrendDataPoint } from '@/lib/types/dashboard'

interface DeliveryTrendChartProps {
  data: DeliveryTrendDataPoint[]
}

export function DeliveryTrendChart({ data }: DeliveryTrendChartProps) {
  // Se não tem dados
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tendência de Entregas</CardTitle>
          <CardDescription>Evolução ao longo do tempo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Sem dados suficientes para gerar o gráfico
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendência de Entregas</CardTitle>
        <CardDescription>Evolução ao longo do tempo</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ left: 0, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12 }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Line
              type="monotone"
              dataKey="deliveries"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
```

**Step 2: Verify component was created**

Run: `cat src/components/features/dashboard/manager/delivery-trend-chart.tsx | grep "export function"`
Expected: Output contains "export function DeliveryTrendChart"

**Step 3: Commit**

```bash
git add src/components/features/dashboard/manager/delivery-trend-chart.tsx
git commit -m "feat(dashboard): add DeliveryTrendChart component

- Line chart showing deliveries over time
- Responsive container with recharts
- Tooltip with date and delivery count
- Empty state for no data"
```

---

## Task 11: Create TeamDetailsTable Component

**Files:**
- Create: `src/components/features/dashboard/manager/team-details-table.tsx`

**Step 1: Create team details table component**

Create `src/components/features/dashboard/manager/team-details-table.tsx`:

```typescript
'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { TeamMemberMetrics } from '@/lib/types/dashboard'
import { ArrowUpDown } from 'lucide-react'

interface TeamDetailsTableProps {
  members: TeamMemberMetrics[]
  onMemberClick?: (userId: string) => void
}

type SortField = 'name' | 'totalDeliveries' | 'completionRate' | 'inProgress' | 'late'
type SortDirection = 'asc' | 'desc'

export function TeamDetailsTable({ members, onMemberClick }: TeamDetailsTableProps) {
  const [sortField, setSortField] = useState<SortField>('totalDeliveries')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // New field, default to desc (except name)
      setSortField(field)
      setSortDirection(field === 'name' ? 'asc' : 'desc')
    }
  }

  // Ordenar membros
  const sortedMembers = [...members].sort((a, b) => {
    const multiplier = sortDirection === 'asc' ? 1 : -1

    switch (sortField) {
      case 'name':
        return multiplier * a.name.localeCompare(b.name)
      case 'totalDeliveries':
        return multiplier * (a.totalDeliveries - b.totalDeliveries)
      case 'completionRate':
        return multiplier * (a.completionRate - b.completionRate)
      case 'inProgress':
        return multiplier * (a.inProgress - b.inProgress)
      case 'late':
        return multiplier * (a.late - b.late)
      default:
        return 0
    }
  })

  // Se não tem membros
  if (members.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Equipe</CardTitle>
          <CardDescription>Métricas individuais de cada membro</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Nenhum membro encontrado
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalhes da Equipe</CardTitle>
        <CardDescription>Métricas individuais de cada membro</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1">
                  Membro
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer text-right"
                onClick={() => handleSort('totalDeliveries')}
              >
                <div className="flex items-center justify-end gap-1">
                  Entregas
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer text-right"
                onClick={() => handleSort('completionRate')}
              >
                <div className="flex items-center justify-end gap-1">
                  Taxa %
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer text-right"
                onClick={() => handleSort('inProgress')}
              >
                <div className="flex items-center justify-end gap-1">
                  Andamento
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer text-right"
                onClick={() => handleSort('late')}
              >
                <div className="flex items-center justify-end gap-1">
                  Atrasadas
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedMembers.map((member) => (
              <TableRow
                key={member.userId}
                className={onMemberClick ? 'cursor-pointer hover:bg-muted/50' : ''}
                onClick={() => onMemberClick?.(member.userId)}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{member.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {member.totalDeliveries}
                </TableCell>
                <TableCell className="text-right">
                  {member.completionRate}%
                </TableCell>
                <TableCell className="text-right">
                  {member.inProgress}
                </TableCell>
                <TableCell className="text-right">
                  {member.late > 0 ? (
                    <Badge variant="destructive">{member.late}</Badge>
                  ) : (
                    member.late
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
```

**Step 2: Verify component was created**

Run: `cat src/components/features/dashboard/manager/team-details-table.tsx | grep "export function"`
Expected: Output contains "export function TeamDetailsTable"

**Step 3: Commit**

```bash
git add src/components/features/dashboard/manager/team-details-table.tsx
git commit -m "feat(dashboard): add TeamDetailsTable component

- Sortable table with 5 columns
- Avatar + name for each member
- Click handler for row selection
- Badge for late actions > 0
- Empty state for no members"
```

---

## Task 12: Create TeamMetricsCards Component

**Files:**
- Create: `src/components/features/dashboard/manager/team-metrics-cards.tsx`

**Step 1: Create metrics cards grid component**

Create `src/components/features/dashboard/manager/team-metrics-cards.tsx`:

```typescript
'use client'

import { MetricCardWithComparison } from '../../shared/metric-card-with-comparison'
import type { TeamMetrics } from '@/lib/types/dashboard'
import { createMetricComparison } from '@/lib/utils/metrics-calculator'
import { CheckSquare, BarChart3, Zap, Clock } from 'lucide-react'

interface TeamMetricsCardsProps {
  metrics: TeamMetrics
  previousMetrics?: {
    totalDeliveries: number
    avgCompletionRate: number
    velocity: number
    totalLate: number
  }
}

export function TeamMetricsCards({ metrics }: TeamMetricsCardsProps) {
  // Criar comparações
  const deliveriesComparison = createMetricComparison(
    metrics.totalDeliveries,
    metrics.totalDeliveries - metrics.deliveriesChange,
    false
  )

  const completionRateComparison = createMetricComparison(
    metrics.avgCompletionRate,
    metrics.avgCompletionRate - metrics.completionRateChange,
    false
  )

  const velocityComparison = createMetricComparison(
    metrics.velocity,
    metrics.velocity - metrics.velocityChange,
    false
  )

  const lateComparison = createMetricComparison(
    metrics.totalLate,
    metrics.totalLate - metrics.lateChange,
    true // Invertido: menos é melhor
  )

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCardWithComparison
        title="Total de Entregas"
        value={metrics.totalDeliveries}
        comparison={deliveriesComparison}
        icon={CheckSquare}
        iconColor="text-success"
        bgColor="bg-success/10"
      />

      <MetricCardWithComparison
        title="Taxa de Conclusão"
        value={`${metrics.avgCompletionRate}%`}
        comparison={completionRateComparison}
        icon={BarChart3}
        iconColor="text-info"
        bgColor="bg-info/10"
      />

      <MetricCardWithComparison
        title="Velocidade Média"
        value={metrics.velocity}
        comparison={velocityComparison}
        icon={Zap}
        iconColor="text-primary"
        bgColor="bg-primary/10"
      />

      <MetricCardWithComparison
        title="Ações Atrasadas"
        value={metrics.totalLate}
        comparison={lateComparison}
        icon={Clock}
        iconColor={metrics.totalLate > 0 ? 'text-warning' : 'text-muted-foreground'}
        bgColor={metrics.totalLate > 0 ? 'bg-warning/10' : 'bg-muted'}
      />
    </div>
  )
}
```

**Step 2: Verify component was created**

Run: `cat src/components/features/dashboard/manager/team-metrics-cards.tsx | grep "export function"`
Expected: Output contains "export function TeamMetricsCards"

**Step 3: Commit**

```bash
git add src/components/features/dashboard/manager/team-metrics-cards.tsx
git commit -m "feat(dashboard): add TeamMetricsCards component

- Grid of 4 metric cards
- Total Deliveries, Completion Rate, Velocity, Late Actions
- Comparisons with previous period
- Semantic colors and icons
- Inverted comparison for late actions (less is better)"
```

---

## Task 13: Create ManagerDashboard Page Component

**Files:**
- Create: `src/app/(protected)/companies/[companyId]/dashboard/manager/page.tsx`

**Step 1: Create manager dashboard page**

Create `src/app/(protected)/companies/[companyId]/dashboard/manager/page.tsx`:

```typescript
'use client'

import { useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { PageContainer } from '@/components/shared/layout/page-container'
import { PageHeader } from '@/components/shared/layout/page-header'
import { PeriodFilter } from '@/components/features/dashboard/shared/period-filter'
import { PeriodIndicator } from '@/components/features/dashboard/shared/period-indicator'
import { TeamMetricsCards } from '@/components/features/dashboard/manager/team-metrics-cards'
import { TeamRankingChart } from '@/components/features/dashboard/manager/team-ranking-chart'
import { DeliveryTrendChart } from '@/components/features/dashboard/manager/delivery-trend-chart'
import { TeamDetailsTable } from '@/components/features/dashboard/manager/team-details-table'
import { LoadingSpinner } from '@/components/shared/feedback/loading-spinner'
import { useTeamMetrics } from '@/lib/hooks/use-team-metrics'
import { useUserContext } from '@/lib/contexts/user-context'
import { groupDeliveriesByDay } from '@/lib/utils/metrics-calculator'
import type { DatePreset } from '@/lib/utils/date-presets'
import { getPresetRange } from '@/lib/utils/period-comparator'

export default function ManagerDashboardPage() {
  const params = useParams()
  const { user } = useUserContext()
  const companyId = params.companyId as string

  const [selectedPreset, setSelectedPreset] = useState<DatePreset>('esta-semana')

  // TODO: Buscar equipe do gestor atual
  // Por enquanto, mock dos membros da equipe
  const teamId = 'mock-team-id' // TODO: Obter do contexto/API
  const teamMembers = [
    { id: '1', firstName: 'João', lastName: 'Silva', avatar: undefined },
    { id: '2', firstName: 'Maria', lastName: 'Santos', avatar: undefined },
    { id: '3', firstName: 'Pedro', lastName: 'Costa', avatar: undefined },
  ]

  // Buscar métricas
  const { memberMetrics, teamMetrics, isLoading, error } = useTeamMetrics({
    teamId,
    preset: selectedPreset,
    teamMembers,
  })

  // Processar dados para gráfico de tendência
  const trendData = useMemo(() => {
    // TODO: Precisamos das ações brutas para agrupar por dia
    // Por enquanto, retorna array vazio
    return []
  }, [])

  if (error) {
    return (
      <PageContainer maxWidth="7xl">
        <div className="flex h-[400px] items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-semibold text-destructive">Erro ao carregar dashboard</p>
            <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
          </div>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer maxWidth="7xl">
      <PageHeader
        title="Dashboard da Equipe"
        description="Acompanhe o desempenho e motivação da sua equipe"
        action={<PeriodFilter selected={selectedPreset} onChange={setSelectedPreset} />}
      />

      <PeriodIndicator preset={selectedPreset} className="mb-6" />

      {isLoading ? (
        <div className="flex h-[400px] items-center justify-center">
          <LoadingSpinner size="lg" label="Carregando métricas..." />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Cards de Métricas */}
          <TeamMetricsCards metrics={teamMetrics} />

          {/* Gráficos */}
          <div className="grid gap-6 lg:grid-cols-2">
            <TeamRankingChart members={memberMetrics} maxDisplay={5} />
            <DeliveryTrendChart data={trendData} />
          </div>

          {/* Tabela Detalhada */}
          <TeamDetailsTable
            members={memberMetrics}
            onMemberClick={(userId) => {
              console.log('TODO: Abrir modal de detalhes do membro', userId)
            }}
          />
        </div>
      )}
    </PageContainer>
  )
}
```

**Step 2: Verify page was created**

Run: `cat src/app/\(protected\)/companies/\[companyId\]/dashboard/manager/page.tsx | grep "export default"`
Expected: Output contains "export default function ManagerDashboardPage"

**Step 3: Commit**

```bash
git add src/app/\(protected\)/companies/\[companyId\]/dashboard/manager/page.tsx
git commit -m "feat(dashboard): add ManagerDashboard page

- Complete page layout with all components
- Period filter in header
- Loading and error states
- Grid layout for metrics and charts
- TODO: Connect to real team data
- TODO: Implement trend chart data processing"
```

---

## Task 14: Add Missing UI Components (Badge)

**Files:**
- Verify: `src/components/ui/badge.tsx` exists

**Step 1: Check if Badge component exists**

Run: `ls src/components/ui/badge.tsx`
Expected: File exists OR "No such file or directory"

**Step 2: Install Badge if missing**

If file doesn't exist, run:
```bash
npx shadcn@latest add badge
```

Expected: Badge component added to src/components/ui/

**Step 3: Verify Badge component**

Run: `cat src/components/ui/badge.tsx | grep "export"`
Expected: Output contains Badge exports

**Step 4: Commit (only if installed)**

```bash
git add src/components/ui/badge.tsx
git commit -m "chore: add Badge component from shadcn/ui"
```

---

## Task 15: Add Missing UI Components (Avatar)

**Files:**
- Verify: `src/components/ui/avatar.tsx` exists

**Step 1: Check if Avatar component exists**

Run: `ls src/components/ui/avatar.tsx`
Expected: File exists OR "No such file or directory"

**Step 2: Install Avatar if missing**

If file doesn't exist, run:
```bash
npx shadcn@latest add avatar
```

Expected: Avatar component added to src/components/ui/

**Step 3: Verify Avatar component**

Run: `cat src/components/ui/avatar.tsx | grep "export"`
Expected: Output contains Avatar exports

**Step 4: Commit (only if installed)**

```bash
git add src/components/ui/avatar.tsx
git commit -m "chore: add Avatar component from shadcn/ui"
```

---

## Task 16: Update useTeamMetrics to Return Raw Actions

**Files:**
- Modify: `src/lib/hooks/use-team-metrics.ts`

**Step 1: Update hook to expose raw actions for trend chart**

Modify `src/lib/hooks/use-team-metrics.ts` to also return current actions:

```typescript
// Add to UseTeamMetricsResult interface:
interface UseTeamMetricsResult {
  memberMetrics: TeamMemberMetrics[]
  teamMetrics: TeamMetrics
  currentActions: Action[] // Add this
  isLoading: boolean
  error: Error | null
}

// Add to return statement:
return {
  memberMetrics,
  teamMetrics,
  currentActions: currentQuery.data?.data || [], // Add this
  isLoading: currentQuery.isLoading || previousQuery.isLoading,
  error: currentQuery.error || previousQuery.error,
}
```

**Step 2: Import Action type**

Add import at top of file:
```typescript
import type { Action } from '@/lib/types/action'
```

**Step 3: Verify changes**

Run: `grep "currentActions" src/lib/hooks/use-team-metrics.ts`
Expected: Output shows currentActions in interface and return

**Step 4: Commit**

```bash
git add src/lib/hooks/use-team-metrics.ts
git commit -m "feat(dashboard): expose currentActions from useTeamMetrics

- Add currentActions to return value
- Needed for DeliveryTrendChart data processing"
```

---

## Task 17: Connect Trend Chart to Real Data

**Files:**
- Modify: `src/app/(protected)/companies/[companyId]/dashboard/manager/page.tsx`

**Step 1: Update page to use currentActions for trend chart**

Modify the `trendData` useMemo in `page.tsx`:

```typescript
// Replace the TODO useMemo with:
const trendData = useMemo(() => {
  if (currentActions.length === 0) return []
  return groupDeliveriesByDay(currentActions)
}, [currentActions])

// Also destructure currentActions from hook:
const { memberMetrics, teamMetrics, currentActions, isLoading, error } = useTeamMetrics({
  teamId,
  preset: selectedPreset,
  teamMembers,
})
```

**Step 2: Verify changes**

Run: `grep "currentActions" src/app/\(protected\)/companies/\[companyId\]/dashboard/manager/page.tsx`
Expected: Output shows currentActions being destructured and used

**Step 3: Commit**

```bash
git add src/app/\(protected\)/companies/\[companyId\]/dashboard/manager/page.tsx
git commit -m "feat(dashboard): connect trend chart to real data

- Use currentActions from useTeamMetrics
- Process with groupDeliveriesByDay utility
- Remove TODO comment"
```

---

## Task 18: Manual Testing and Verification

**Files:**
- None (testing only)

**Step 1: Start development server**

Run: `npm run dev`
Expected: Server starts on http://localhost:3000

**Step 2: Navigate to dashboard**

In browser, navigate to:
```
http://localhost:3000/companies/{companyId}/dashboard/manager
```

Expected: Page loads without errors

**Step 3: Test period filter**

- Click "Esta Semana" - verify data updates
- Click "Este Mês" - verify data updates
- Click "Últimos 30 Dias" - verify data updates

Expected: Metrics recalculate for each period

**Step 4: Test responsiveness**

- Resize browser to mobile width (375px)
- Verify cards stack vertically
- Verify charts remain readable
- Verify table becomes scrollable

Expected: Responsive layout works correctly

**Step 5: Test sorting in table**

- Click "Entregas" header - verify sorting
- Click "Taxa %" header - verify sorting
- Click "Atrasadas" header - verify sorting

Expected: Table sorts correctly by each column

**Step 6: Verify console for errors**

Open browser console (F12)

Expected: No errors or warnings

**Step 7: Document test results**

Create test results file:
```bash
echo "# Manager Dashboard - Test Results

## Functional Tests
- ✅ Period filter switches correctly
- ✅ Metrics recalculate on filter change
- ✅ Charts render without errors
- ✅ Table sorting works

## Responsive Tests
- ✅ Mobile layout (375px)
- ✅ Tablet layout (768px)
- ✅ Desktop layout (1440px)

## Performance
- Load time: < 2s
- No console errors

Tested on: $(date)
" > docs/plans/manager-dashboard-test-results.md
```

**Step 8: Commit test results**

```bash
git add docs/plans/manager-dashboard-test-results.md
git commit -m "docs: add manager dashboard test results"
```

---

## Known Limitations and TODOs

### 1. Team Data Source

**Current:** Mock team members hardcoded in page
**TODO:**
- Create API endpoint to fetch team members by teamId
- Integrate with user context to get manager's team(s)
- Support managers with multiple teams (team selector)

### 2. Team ID Resolution

**Current:** Using 'mock-team-id'
**TODO:**
- Determine how to map manager → team(s)
- May need to add teamId to user context
- Or fetch from company/user relationship

### 3. Trend Chart Granularity

**Current:** Shows all days with deliveries
**TODO:**
- For "Este Mês" - aggregate by week instead of day
- For "Últimos 30 Dias" - maybe show weeks
- Add option to switch granularity

### 4. Member Detail Modal

**Current:** Console.log on row click
**TODO:**
- Create modal/drawer with detailed member stats
- Show individual trend chart
- Show list of member's actions
- Compare with team average

### 5. Empty States

**Current:** Basic text messages
**TODO:**
- Add illustrations or icons
- Add CTA buttons (e.g., "Convidar Membros")
- Link to relevant actions

### 6. Performance Optimization

**Current:** Fetching up to 1000 actions
**TODO:**
- Add pagination if teams have > 1000 actions
- Consider server-side metrics calculation
- Add caching layer (React Query already handles some)

### 7. Authorization

**Current:** No role check
**TODO:**
- Verify user has `manager` role
- Verify user belongs to the team
- Redirect if unauthorized

---

## Success Criteria

**Technical:**
- ✅ All TypeScript types compile without errors
- ✅ No runtime errors in console
- ✅ All components render correctly
- ✅ Recharts integrates successfully
- ✅ Metrics calculations are accurate
- ✅ Period comparisons work correctly

**UX:**
- ✅ Page loads in < 2 seconds
- ✅ Responsive on mobile, tablet, desktop
- ✅ Period filter is intuitive
- ✅ Rankings clearly show top performers
- ✅ Comparatives use green/red correctly
- ✅ Table is sortable and readable

**Business:**
- ✅ Manager can identify top performer quickly
- ✅ Manager can see trends (improving/declining)
- ✅ Manager can drill into individual metrics
- ✅ Visual design motivates healthy competition

---

## Next Steps After Implementation

1. **Backend Integration**
   - Create /teams/:teamId/members endpoint
   - Update user context with team relationships
   - Add role-based access control

2. **Additional Dashboards**
   - Master Dashboard (all teams in company)
   - Executor Dashboard (personal performance)

3. **Features**
   - Export reports to PDF
   - Email digest of weekly performance
   - Notifications for milestones
   - Gamification badges/achievements

4. **Improvements**
   - Server-side metrics calculation
   - Real-time updates (WebSocket)
   - Custom date ranges
   - Drill-down to action details
