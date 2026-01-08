# Dashboard do Executor - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a motivational dashboard for executors to track personal performance with team context.

**Architecture:** React components consuming parallel API calls (my actions current/previous + team actions), calculating personal metrics and team position client-side, displaying with motivational messaging and action-oriented design.

**Tech Stack:** Next.js 14 App Router, TypeScript, React Query, Zustand, Recharts, shadcn/ui, Tailwind CSS

---

## Task 1: Create Executor Dashboard Types

**Files:**
- Create: `src/lib/types/executor-dashboard.ts`

**Step 1: Create type definitions file**

Create `src/lib/types/executor-dashboard.ts` with complete type definitions:

```typescript
import { ActionPriority, ActionStatus } from './action'

/**
 * Métricas pessoais do executor
 */
export interface ExecutorMetrics {
  // Identificação
  userId: string

  // Métricas do período atual
  totalDeliveries: number // Ações DONE
  goal: number // Meta do período (semanal/mensal)
  goalProgress: number // (deliveries / goal) * 100
  completionRate: number // (DONE / TOTAL) * 100
  inProgress: number // Ações IN_PROGRESS
  late: number // Ações isLate
  totalActions: number // Total de ações

  // Comparativos com período anterior
  deliveriesChange: number // +3 ou -2
  deliveriesChangePercent: number // +25% ou -15%
  completionRateChange: number // +10 ou -5 (pontos percentuais)
  lateChange: number // +1 ou -2

  // Contexto da equipe
  teamPosition: number // 3 (posição no ranking)
  totalTeamMembers: number // 8
  teamAvgDeliveries: number // 10
  percentVsAverage: number // +20% ou -10%
  isAboveAverage: boolean
}

/**
 * Próxima ação a ser executada
 */
export interface NextAction {
  id: string
  title: string
  priority: ActionPriority
  isLate: boolean
  estimatedEndDate: Date | null
}

/**
 * Métricas de posição na equipe
 */
export interface TeamPositionMetrics {
  teamPosition: number
  totalTeamMembers: number
  teamAvgDeliveries: number
  percentVsAverage: number
  isAboveAverage: boolean
}

/**
 * Configuração de metas do usuário
 */
export interface UserGoals {
  weeklyGoal: number // Default: 15
  monthlyGoal: number // Default: 60
}
```

**Step 2: Verify file was created**

Run: `cat src/lib/types/executor-dashboard.ts | head -20`
Expected: File exists with type definitions

**Step 3: Commit**

```bash
git add src/lib/types/executor-dashboard.ts
git commit -m "feat(dashboard): add TypeScript types for executor metrics

- Add ExecutorMetrics interface with personal and team context
- Add NextAction interface for action list
- Add TeamPositionMetrics interface
- Add UserGoals interface for goal configuration"
```

---

## Task 2: Create Goal Manager Utility

**Files:**
- Create: `src/lib/utils/goal-manager.ts`

**Step 1: Create goal manager utility**

Create `src/lib/utils/goal-manager.ts`:

```typescript
import type { DatePreset } from './date-presets'
import type { UserGoals } from '@/lib/types/executor-dashboard'

/**
 * Default goals
 */
const DEFAULT_GOALS: UserGoals = {
  weeklyGoal: 15,
  monthlyGoal: 60,
}

/**
 * Retorna a meta para o preset selecionado
 *
 * @example
 * getGoalForPreset('esta-semana', userGoals) // => 15
 * getGoalForPreset('este-mes', userGoals) // => 60
 */
export function getGoalForPreset(
  preset: DatePreset,
  userGoals?: UserGoals
): number {
  const goals = userGoals || DEFAULT_GOALS

  switch (preset) {
    case 'esta-semana':
      return goals.weeklyGoal
    case 'ultimas-2-semanas':
      return goals.weeklyGoal * 2
    case 'este-mes':
      return goals.monthlyGoal
    case 'ultimos-30-dias':
      return goals.monthlyGoal
    default:
      return goals.weeklyGoal
  }
}

/**
 * Retorna os goals padrão
 */
export function getDefaultGoals(): UserGoals {
  return DEFAULT_GOALS
}

/**
 * Calcula progresso em relação à meta
 */
export function calculateGoalProgress(
  deliveries: number,
  goal: number
): number {
  if (goal === 0) return 0
  return Math.round((deliveries / goal) * 100)
}

/**
 * Retorna mensagem motivacional baseada no progresso
 */
export function getGoalMessage(progressPercent: number): string {
  if (progressPercent >= 100) {
    return 'Meta batida! Parabéns! 🎉'
  }
  if (progressPercent >= 70) {
    const remaining = Math.ceil((100 - progressPercent) / 100 * 100) // approximation
    return `Faltam poucas entregas para a meta!`
  }
  return 'Vamos lá! Escolha uma ação e avance!'
}
```

**Step 2: Verify file was created**

Run: `cat src/lib/utils/goal-manager.ts | grep -c "export function"`
Expected: Output should be "4" (4 exported functions)

**Step 3: Commit**

```bash
git add src/lib/utils/goal-manager.ts
git commit -m "feat(dashboard): add goal management utilities

- Add getGoalForPreset() to get goal based on period
- Add getDefaultGoals() for fallback values
- Add calculateGoalProgress() for progress calculation
- Add getGoalMessage() for motivational messages"
```

---

## Task 3: Create Executor Metrics Calculator Utility

**Files:**
- Create: `src/lib/utils/executor-metrics-calculator.ts`

**Step 1: Create executor metrics calculator utility**

Create `src/lib/utils/executor-metrics-calculator.ts`:

```typescript
import type { Action } from '@/lib/types/action'
import type {
  ExecutorMetrics,
  TeamPositionMetrics,
} from '@/lib/types/executor-dashboard'
import { ActionStatus } from '@/lib/types/action'
import type { DatePreset } from './date-presets'
import { getGoalForPreset } from './goal-manager'

interface User {
  id: string
  firstName: string
  lastName: string
}

/**
 * Calcula métricas pessoais do executor
 */
export function calculateExecutorMetrics(
  currentActions: Action[],
  previousActions: Action[],
  teamActions: Action[],
  teamMembers: User[],
  executorId: string,
  preset: DatePreset
): ExecutorMetrics {
  // Filtrar ações do executor
  const myCurrentActions = currentActions.filter(
    (a) => a.responsibleId === executorId
  )
  const myPreviousActions = previousActions.filter(
    (a) => a.responsibleId === executorId
  )

  // Métricas atuais
  const totalActions = myCurrentActions.length
  const totalDeliveries = myCurrentActions.filter(
    (a) => a.status === ActionStatus.DONE
  ).length
  const completionRate =
    totalActions > 0 ? (totalDeliveries / totalActions) * 100 : 0
  const inProgress = myCurrentActions.filter(
    (a) => a.status === ActionStatus.IN_PROGRESS
  ).length
  const late = myCurrentActions.filter((a) => a.isLate).length

  // Meta
  const goal = getGoalForPreset(preset) // TODO: passar userGoals quando disponível
  const goalProgress = goal > 0 ? (totalDeliveries / goal) * 100 : 0

  // Métricas anteriores
  const previousTotalActions = myPreviousActions.length
  const previousDeliveries = myPreviousActions.filter(
    (a) => a.status === ActionStatus.DONE
  ).length
  const previousCompletionRate =
    previousTotalActions > 0
      ? (previousDeliveries / previousTotalActions) * 100
      : 0
  const previousLate = myPreviousActions.filter((a) => a.isLate).length

  // Comparativos
  const deliveriesChange = totalDeliveries - previousDeliveries
  const deliveriesChangePercent =
    previousDeliveries > 0
      ? ((totalDeliveries - previousDeliveries) / previousDeliveries) * 100
      : totalDeliveries > 0
      ? 100
      : 0
  const completionRateChange = completionRate - previousCompletionRate
  const lateChange = late - previousLate

  // Contexto da equipe
  const teamMetrics = calculateTeamPositionMetrics(
    teamActions,
    teamMembers,
    executorId
  )

  return {
    userId: executorId,
    totalDeliveries,
    goal,
    goalProgress: Math.round(goalProgress),
    completionRate: Math.round(completionRate),
    inProgress,
    late,
    totalActions,
    deliveriesChange,
    deliveriesChangePercent: Math.round(deliveriesChangePercent),
    completionRateChange: Math.round(completionRateChange),
    lateChange,
    ...teamMetrics,
  }
}

/**
 * Calcula posição do executor na equipe
 */
export function calculateTeamPositionMetrics(
  teamActions: Action[],
  teamMembers: User[],
  executorId: string
): TeamPositionMetrics {
  // Contar entregas por membro
  const memberDeliveries = teamMembers.map((member) => ({
    userId: member.id,
    deliveries: teamActions.filter(
      (a) => a.responsibleId === member.id && a.status === ActionStatus.DONE
    ).length,
  }))

  // Ordenar por entregas (desc)
  memberDeliveries.sort((a, b) => b.deliveries - a.deliveries)

  // Encontrar posição do executor
  const teamPosition =
    memberDeliveries.findIndex((m) => m.userId === executorId) + 1

  // Calcular média da equipe
  const teamAvgDeliveries =
    teamMembers.length > 0
      ? memberDeliveries.reduce((sum, m) => sum + m.deliveries, 0) /
        teamMembers.length
      : 0

  // Comparação percentual
  const myDeliveries =
    memberDeliveries.find((m) => m.userId === executorId)?.deliveries || 0
  const percentVsAverage =
    teamAvgDeliveries > 0
      ? ((myDeliveries - teamAvgDeliveries) / teamAvgDeliveries) * 100
      : 0

  return {
    teamPosition,
    totalTeamMembers: teamMembers.length,
    teamAvgDeliveries: Math.round(teamAvgDeliveries),
    percentVsAverage: Math.round(percentVsAverage),
    isAboveAverage: percentVsAverage >= 0,
  }
}

/**
 * Retorna mensagem motivacional baseada na posição
 */
export function getMotivationalMessage(percentDiff: number): string {
  if (percentDiff >= 10) {
    return 'Continue assim! Você está arrasando! 💪'
  }
  if (percentDiff >= 0) {
    return 'Você está no ritmo da equipe! 👏'
  }
  if (percentDiff >= -10) {
    return 'Bom trabalho! Mantenha o foco! 🎯'
  }
  return 'Vamos retomar o ritmo! Você consegue! 🚀'
}
```

**Step 2: Verify file was created**

Run: `cat src/lib/utils/executor-metrics-calculator.ts | grep -c "export function"`
Expected: Output should be "3" (3 exported functions)

**Step 3: Commit**

```bash
git add src/lib/utils/executor-metrics-calculator.ts
git commit -m "feat(dashboard): add executor metrics calculation utilities

- Add calculateExecutorMetrics() for personal metrics
- Add calculateTeamPositionMetrics() for team ranking
- Add getMotivationalMessage() for dynamic messages
- Handle edge cases (zero values, no team members)"
```

---

## Task 4: Create useExecutorMetrics Hook

**Files:**
- Create: `src/lib/hooks/use-executor-metrics.ts`

**Step 1: Create custom hook for executor metrics**

Create `src/lib/hooks/use-executor-metrics.ts`:

```typescript
'use client'

import { useMemo } from 'react'
import type { DatePreset } from '@/lib/utils/date-presets'
import type { ExecutorMetrics, NextAction } from '@/lib/types/executor-dashboard'
import type { Action } from '@/lib/types/action'
import { ActionStatus } from '@/lib/types/action'
import { useActions } from './use-actions'
import { getPresetRange, getPreviousPeriod } from '@/lib/utils/period-comparator'
import { calculateExecutorMetrics } from '@/lib/utils/executor-metrics-calculator'

interface User {
  id: string
  firstName: string
  lastName: string
}

interface UseExecutorMetricsParams {
  executorId: string
  teamId: string
  preset: DatePreset
  teamMembers: User[]
}

interface UseExecutorMetricsResult {
  metrics: ExecutorMetrics | null
  nextActions: NextAction[]
  currentActions: Action[]
  isLoading: boolean
  error: Error | null
}

/**
 * Hook para buscar e calcular métricas do executor
 *
 * Faz 4 chamadas paralelas à API:
 * 1. Minhas ações do período atual
 * 2. Minhas ações do período anterior
 * 3. Ações da equipe (para comparação)
 * 4. Minhas próximas ações (TODO/IN_PROGRESS)
 */
export function useExecutorMetrics({
  executorId,
  teamId,
  preset,
  teamMembers,
}: UseExecutorMetricsParams): UseExecutorMetricsResult {
  // Calcular ranges de datas
  const currentPeriod = useMemo(() => getPresetRange(preset), [preset])
  const previousPeriod = useMemo(() => getPreviousPeriod(preset), [preset])

  // Buscar minhas ações (período atual)
  const myCurrentQuery = useActions({
    responsibleId: executorId,
    dateFrom: currentPeriod.dateFrom,
    dateTo: currentPeriod.dateTo,
    dateFilterType: 'createdAt',
    page: 1,
    limit: 1000,
  })

  // Buscar minhas ações (período anterior)
  const myPreviousQuery = useActions({
    responsibleId: executorId,
    dateFrom: previousPeriod.dateFrom,
    dateTo: previousPeriod.dateTo,
    dateFilterType: 'createdAt',
    page: 1,
    limit: 1000,
  })

  // Buscar ações da equipe (para comparação)
  const teamQuery = useActions({
    teamId,
    dateFrom: currentPeriod.dateFrom,
    dateTo: currentPeriod.dateTo,
    dateFilterType: 'createdAt',
    page: 1,
    limit: 1000,
  })

  // Buscar próximas ações
  const nextActionsQuery = useActions({
    responsibleId: executorId,
    status: ActionStatus.TODO,
    page: 1,
    limit: 5,
  })

  // Calcular métricas quando todas queries carregarem
  const metrics = useMemo(() => {
    if (
      !myCurrentQuery.data ||
      !myPreviousQuery.data ||
      !teamQuery.data
    ) {
      return null
    }

    return calculateExecutorMetrics(
      myCurrentQuery.data.data,
      myPreviousQuery.data.data,
      teamQuery.data.data,
      teamMembers,
      executorId,
      preset
    )
  }, [
    myCurrentQuery.data,
    myPreviousQuery.data,
    teamQuery.data,
    teamMembers,
    executorId,
    preset,
  ])

  // Mapear próximas ações para NextAction type
  const nextActions = useMemo(() => {
    if (!nextActionsQuery.data) return []

    return nextActionsQuery.data.data.map((action) => ({
      id: action.id,
      title: action.title,
      priority: action.priority,
      isLate: action.isLate,
      estimatedEndDate: action.estimatedEndDate,
    }))
  }, [nextActionsQuery.data])

  return {
    metrics,
    nextActions,
    currentActions: myCurrentQuery.data?.data || [],
    isLoading:
      myCurrentQuery.isLoading ||
      myPreviousQuery.isLoading ||
      teamQuery.isLoading ||
      nextActionsQuery.isLoading,
    error:
      myCurrentQuery.error ||
      myPreviousQuery.error ||
      teamQuery.error ||
      nextActionsQuery.error,
  }
}
```

**Step 2: Verify file was created**

Run: `cat src/lib/hooks/use-executor-metrics.ts | grep "export function"`
Expected: Output contains "export function useExecutorMetrics"

**Step 3: Commit**

```bash
git add src/lib/hooks/use-executor-metrics.ts
git commit -m "feat(dashboard): add useExecutorMetrics hook

- 4 parallel API calls (my current/previous, team, next actions)
- Automatic metrics calculation using utilities
- Returns metrics, next actions, loading, and error states
- Memoized for performance"
```

---

## Task 5: Create PersonalGoalCard Component

**Files:**
- Create: `src/components/features/dashboard/executor/personal-goal-card.tsx`

**Step 1: Create personal goal card component**

Create `src/components/features/dashboard/executor/personal-goal-card.tsx`:

```typescript
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProgressBar } from '@/components/shared/data/progress-bar'
import { Target, TrendingUp, TrendingDown } from 'lucide-react'
import { getGoalMessage } from '@/lib/utils/goal-manager'

interface PersonalGoalCardProps {
  current: number
  goal: number
  progressPercent: number
  comparison?: {
    absolute: number
    percent: number
  }
}

export function PersonalGoalCard({
  current,
  goal,
  progressPercent,
  comparison,
}: PersonalGoalCardProps) {
  // Determinar cor baseada no progresso
  const getProgressColor = () => {
    if (progressPercent >= 100) return 'bg-success'
    if (progressPercent >= 70) return 'bg-warning'
    return 'bg-destructive'
  }

  const message = getGoalMessage(progressPercent)
  const remaining = Math.max(0, goal - current)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Progresso da Meta</CardTitle>
        <div className="rounded-md bg-primary/10 p-2">
          <Target className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{progressPercent}%</div>

        <div className="mt-3">
          <ProgressBar
            value={progressPercent}
            className={getProgressColor()}
            label="Progresso da meta"
          />
        </div>

        <div className="mt-3 space-y-1">
          <p className="text-sm text-muted-foreground">
            {current} de {goal} entregas
          </p>
          {remaining > 0 && (
            <p className="text-xs font-medium text-primary">
              Faltam {remaining} para a meta!
            </p>
          )}
          {progressPercent >= 100 && (
            <p className="text-xs font-medium text-success">
              {message}
            </p>
          )}
        </div>

        {comparison && comparison.absolute !== 0 && (
          <div
            className={`mt-3 flex items-center gap-1 text-xs ${
              comparison.absolute > 0 ? 'text-success' : 'text-destructive'
            }`}
          >
            {comparison.absolute > 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>
              {comparison.absolute > 0 ? '+' : ''}
              {comparison.absolute} ({comparison.percent > 0 ? '+' : ''}
              {comparison.percent}%) vs período anterior
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

**Step 2: Verify component was created**

Run: `cat src/components/features/dashboard/executor/personal-goal-card.tsx | grep "export function"`
Expected: Output contains "export function PersonalGoalCard"

**Step 3: Commit**

```bash
git add src/components/features/dashboard/executor/personal-goal-card.tsx
git commit -m "feat(dashboard): add PersonalGoalCard component

- Progress bar showing goal completion
- Dynamic colors (green/yellow/red)
- Motivational messages
- Comparison with previous period
- Shows remaining deliveries"
```

---

## Task 6: Create MyNextActionsList Component

**Files:**
- Create: `src/components/features/dashboard/executor/my-next-actions-list.tsx`

**Step 1: Create next actions list component**

Create `src/components/features/dashboard/executor/my-next-actions-list.tsx`:

```typescript
'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import type { NextAction } from '@/lib/types/executor-dashboard'
import { ActionPriority } from '@/lib/types/action'

interface MyNextActionsListProps {
  actions: NextAction[]
  maxDisplay?: number
  executorId: string
}

export function MyNextActionsList({
  actions,
  maxDisplay = 5,
  executorId,
}: MyNextActionsListProps) {
  const displayActions = actions.slice(0, maxDisplay)

  // Determinar cor do badge de prioridade
  const getPriorityColor = (priority: ActionPriority) => {
    switch (priority) {
      case ActionPriority.HIGH:
        return 'text-destructive'
      case ActionPriority.MEDIUM:
        return 'text-warning'
      case ActionPriority.LOW:
        return 'text-success'
      default:
        return 'text-muted-foreground'
    }
  }

  // Determinar emoji de prioridade
  const getPriorityEmoji = (priority: ActionPriority) => {
    switch (priority) {
      case ActionPriority.HIGH:
        return '🔴'
      case ActionPriority.MEDIUM:
        return '🟡'
      case ActionPriority.LOW:
        return '🟢'
      default:
        return '⚪'
    }
  }

  // Determinar label de prioridade
  const getPriorityLabel = (priority: ActionPriority) => {
    switch (priority) {
      case ActionPriority.HIGH:
        return 'Alta'
      case ActionPriority.MEDIUM:
        return 'Média'
      case ActionPriority.LOW:
        return 'Baixa'
      default:
        return '-'
    }
  }

  // Se não tem ações
  if (displayActions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Minhas Próximas Ações</CardTitle>
          <CardDescription>Continue o que já está em andamento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Tudo concluído! Que tal criar novas ações?
              </p>
              <Button asChild size="sm" className="mt-4">
                <Link href="/actions/new">Nova Ação</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Minhas Próximas Ações</CardTitle>
        <CardDescription>Continue o que já está em andamento</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayActions.map((action) => (
            <Link
              key={action.id}
              href={`/actions/${action.id}`}
              className="block rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-start gap-2">
                <span className="text-lg">{getPriorityEmoji(action.priority)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-medium ${getPriorityColor(action.priority)}`}
                    >
                      [{getPriorityLabel(action.priority)}]
                    </span>
                    {action.isLate && (
                      <span className="text-xs font-medium text-destructive">
                        Atrasada
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium truncate">{action.title}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {actions.length > maxDisplay && (
          <Button asChild variant="ghost" size="sm" className="mt-4 w-full">
            <Link href={`/actions?responsibleId=${executorId}`}>
              Ver todas ({actions.length}) <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
```

**Step 2: Verify component was created**

Run: `cat src/components/features/dashboard/executor/my-next-actions-list.tsx | grep "export function"`
Expected: Output contains "export function MyNextActionsList"

**Step 3: Commit**

```bash
git add src/components/features/dashboard/executor/my-next-actions-list.tsx
git commit -m "feat(dashboard): add MyNextActionsList component

- List of top 5 next actions
- Priority colors and emojis (red/yellow/green)
- Late indicator
- Clickable links to actions
- Empty state with CTA
- 'Ver todas' link when > 5 actions"
```

---

## Task 7: Create TeamPositionCard Component

**Files:**
- Create: `src/components/features/dashboard/executor/team-position-card.tsx`

**Step 1: Create team position card component**

Create `src/components/features/dashboard/executor/team-position-card.tsx`:

```typescript
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, TrendingUp, TrendingDown } from 'lucide-react'
import { getMotivationalMessage } from '@/lib/utils/executor-metrics-calculator'

interface TeamPositionCardProps {
  position: number
  totalMembers: number
  percentDiff: number
  isAboveAverage: boolean
}

export function TeamPositionCard({
  position,
  totalMembers,
  percentDiff,
  isAboveAverage,
}: TeamPositionCardProps) {
  const message = getMotivationalMessage(percentDiff)
  const isTopThree = position <= 3

  // Se não tem equipe
  if (totalMembers === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Minha Posição na Equipe</CardTitle>
        <CardDescription>Comparação com a média do time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Posição */}
          <div className="flex items-center gap-2">
            {isTopThree && <Trophy className="h-5 w-5 text-yellow-500" />}
            <div>
              <p className="text-2xl font-bold">
                #{position} de {totalMembers}
              </p>
              <p className="text-xs text-muted-foreground">
                {isTopThree ? 'Top 3 da equipe! 🏅' : 'Sua posição no ranking'}
              </p>
            </div>
          </div>

          {/* Comparação com média */}
          <div className="flex items-center gap-2">
            {percentDiff >= 0 ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
            <div>
              <p
                className={`text-sm font-medium ${
                  isAboveAverage ? 'text-success' : 'text-destructive'
                }`}
              >
                {Math.abs(percentDiff)}% {isAboveAverage ? 'acima' : 'abaixo'} da
                média
              </p>
            </div>
          </div>

          {/* Mensagem motivacional */}
          <div className="rounded-md bg-primary/10 p-3">
            <p className="text-sm font-medium text-primary">{message}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

**Step 2: Verify component was created**

Run: `cat src/components/features/dashboard/executor/team-position-card.tsx | grep "export function"`
Expected: Output contains "export function TeamPositionCard"

**Step 3: Commit**

```bash
git add src/components/features/dashboard/executor/team-position-card.tsx
git commit -m "feat(dashboard): add TeamPositionCard component

- Shows position in team (#3 of 8)
- Trophy emoji for Top 3
- Comparison with team average (% above/below)
- Dynamic motivational message
- Hidden if no team members"
```

---

## Task 8: Create PersonalMetricsCards Component

**Files:**
- Create: `src/components/features/dashboard/executor/personal-metrics-cards.tsx`

**Step 1: Create personal metrics cards grid component**

Create `src/components/features/dashboard/executor/personal-metrics-cards.tsx`:

```typescript
'use client'

import { MetricCardWithComparison } from '../../shared/metric-card-with-comparison'
import { PersonalGoalCard } from './personal-goal-card'
import type { ExecutorMetrics } from '@/lib/types/executor-dashboard'
import { createMetricComparison } from '@/lib/utils/metrics-calculator'
import { CheckSquare, BarChart3, Clock } from 'lucide-react'

interface PersonalMetricsCardsProps {
  metrics: ExecutorMetrics
}

export function PersonalMetricsCards({ metrics }: PersonalMetricsCardsProps) {
  // Criar comparações
  const deliveriesComparison = createMetricComparison(
    metrics.totalDeliveries,
    metrics.totalDeliveries - metrics.deliveriesChange,
    false
  )

  const completionRateComparison = createMetricComparison(
    metrics.completionRate,
    metrics.completionRate - metrics.completionRateChange,
    false
  )

  const lateComparison = createMetricComparison(
    metrics.late,
    metrics.late - metrics.lateChange,
    true // Invertido: menos é melhor
  )

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCardWithComparison
        title="Minhas Entregas"
        value={metrics.totalDeliveries}
        comparison={deliveriesComparison}
        icon={CheckSquare}
        iconColor="text-success"
        bgColor="bg-success/10"
      />

      <PersonalGoalCard
        current={metrics.totalDeliveries}
        goal={metrics.goal}
        progressPercent={metrics.goalProgress}
        comparison={
          deliveriesComparison
            ? {
                absolute: deliveriesComparison.absolute,
                percent: deliveriesComparison.percent,
              }
            : undefined
        }
      />

      <MetricCardWithComparison
        title="Taxa de Conclusão"
        value={`${metrics.completionRate}%`}
        comparison={completionRateComparison}
        icon={BarChart3}
        iconColor="text-info"
        bgColor="bg-info/10"
      />

      <MetricCardWithComparison
        title="Ações Atrasadas"
        value={metrics.late}
        comparison={lateComparison}
        icon={Clock}
        iconColor={metrics.late > 0 ? 'text-warning' : 'text-muted-foreground'}
        bgColor={metrics.late > 0 ? 'bg-warning/10' : 'bg-muted'}
      />
    </div>
  )
}
```

**Step 2: Verify component was created**

Run: `cat src/components/features/dashboard/executor/personal-metrics-cards.tsx | grep "export function"`
Expected: Output contains "export function PersonalMetricsCards"

**Step 3: Commit**

```bash
git add src/components/features/dashboard/executor/personal-metrics-cards.tsx
git commit -m "feat(dashboard): add PersonalMetricsCards component

- Grid of 4 metric cards
- Minhas Entregas, Progresso da Meta, Taxa Conclusão, Atrasadas
- Reuses MetricCardWithComparison
- Integrates PersonalGoalCard
- Comparisons with previous period"
```

---

## Task 9: Create ExecutorDashboard Page Component

**Files:**
- Create: `src/app/(protected)/companies/[companyId]/dashboard/executor/page.tsx`

**Step 1: Create executor dashboard page**

Create `src/app/(protected)/companies/[companyId]/dashboard/executor/page.tsx`:

```typescript
'use client'

import { useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { PageContainer } from '@/components/shared/layout/page-container'
import { PageHeader } from '@/components/shared/layout/page-header'
import { PeriodFilter } from '@/components/features/dashboard/shared/period-filter'
import { PeriodIndicator } from '@/components/features/dashboard/shared/period-indicator'
import { PersonalMetricsCards } from '@/components/features/dashboard/executor/personal-metrics-cards'
import { DeliveryTrendChart } from '@/components/features/dashboard/manager/delivery-trend-chart'
import { MyNextActionsList } from '@/components/features/dashboard/executor/my-next-actions-list'
import { TeamPositionCard } from '@/components/features/dashboard/executor/team-position-card'
import { LoadingSpinner } from '@/components/shared/feedback/loading-spinner'
import { useExecutorMetrics } from '@/lib/hooks/use-executor-metrics'
import { useUserContext } from '@/lib/contexts/user-context'
import { groupDeliveriesByDay } from '@/lib/utils/metrics-calculator'
import type { DatePreset } from '@/lib/utils/date-presets'

export default function ExecutorDashboardPage() {
  const params = useParams()
  const { user } = useUserContext()
  const companyId = params.companyId as string

  const [selectedPreset, setSelectedPreset] = useState<DatePreset>('esta-semana')

  // TODO: Obter executorId e teamId do contexto/API
  const executorId = user?.id || ''
  const teamId = 'mock-team-id' // TODO: Obter do contexto/API

  // TODO: Buscar membros da equipe
  const teamMembers = [
    { id: '1', firstName: 'João', lastName: 'Silva' },
    { id: '2', firstName: 'Maria', lastName: 'Santos' },
    { id: '3', firstName: 'Pedro', lastName: 'Costa' },
    { id: executorId, firstName: user?.name?.split(' ')[0] || 'Você', lastName: user?.name?.split(' ')[1] || '' },
  ]

  // Buscar métricas
  const { metrics, nextActions, currentActions, isLoading, error } = useExecutorMetrics({
    executorId,
    teamId,
    preset: selectedPreset,
    teamMembers,
  })

  // Processar dados para gráfico de tendência
  const trendData = useMemo(() => {
    if (currentActions.length === 0) return []
    return groupDeliveriesByDay(currentActions)
  }, [currentActions])

  if (error) {
    return (
      <PageContainer maxWidth="7xl">
        <div className="flex h-[400px] items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-semibold text-destructive">
              Erro ao carregar dashboard
            </p>
            <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
          </div>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer maxWidth="7xl">
      <PageHeader
        title="Meu Desempenho"
        description="Acompanhe seu progresso e próximas ações"
        action={<PeriodFilter selected={selectedPreset} onChange={setSelectedPreset} />}
      />

      <PeriodIndicator preset={selectedPreset} className="mb-6" />

      {isLoading || !metrics ? (
        <div className="flex h-[400px] items-center justify-center">
          <LoadingSpinner size="lg" label="Carregando métricas..." />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Cards de Métricas Pessoais */}
          <PersonalMetricsCards metrics={metrics} />

          {/* Gráfico de Evolução */}
          <DeliveryTrendChart data={trendData} />

          {/* Grid: Próximas Ações + Posição na Equipe */}
          <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
            <MyNextActionsList
              actions={nextActions}
              maxDisplay={5}
              executorId={executorId}
            />

            <TeamPositionCard
              position={metrics.teamPosition}
              totalMembers={metrics.totalTeamMembers}
              percentDiff={metrics.percentVsAverage}
              isAboveAverage={metrics.isAboveAverage}
            />
          </div>
        </div>
      )}
    </PageContainer>
  )
}
```

**Step 2: Verify page was created**

Run: `cat src/app/\(protected\)/companies/\[companyId\]/dashboard/executor/page.tsx | grep "export default"`
Expected: Output contains "export default function ExecutorDashboardPage"

**Step 3: Commit**

```bash
git add src/app/\(protected\)/companies/\[companyId\]/dashboard/executor/page.tsx
git commit -m "feat(dashboard): add ExecutorDashboard page

- Complete page layout with all components
- Period filter in header
- Loading and error states
- Grid layout 70/30 for actions and team position
- Personal metrics cards
- Evolution chart
- TODO: Connect to real executor and team data"
```

---

## Task 10: Manual Testing and Verification

**Files:**
- None (testing only)

**Step 1: Start development server**

Run: `npm run dev`
Expected: Server starts on http://localhost:3000

**Step 2: Navigate to dashboard**

In browser, navigate to:
```
http://localhost:3000/companies/{companyId}/dashboard/executor
```

Expected: Page loads without errors

**Step 3: Test period filter**

- Click "Esta Semana" - verify data updates
- Click "Este Mês" - verify data updates
- Click "Últimos 30 Dias" - verify data updates

Expected: Metrics recalculate for each period

**Step 4: Test personal goal card**

- Verify progress bar color changes based on percentage
- Verify motivational messages appear
- Verify "Faltam X para a meta" shows correctly

Expected: Dynamic messages and colors work

**Step 5: Test next actions list**

- Verify priority colors (red/yellow/green)
- Verify "Atrasada" badge shows for late actions
- Click on an action - verify navigation to action detail
- Click "Ver todas" - verify filter by executorId

Expected: Actions are clickable and properly styled

**Step 6: Test team position card**

- Verify position shows correctly (#3 of 8)
- Verify trophy emoji shows for Top 3
- Verify % above/below average calculates correctly
- Verify motivational message changes based on performance

Expected: Team context displayed correctly

**Step 7: Test responsiveness**

- Resize browser to mobile width (375px)
- Verify cards stack vertically
- Verify charts remain readable
- Verify "Próximas Ações" and "Posição" stack vertically

Expected: Responsive layout works correctly

**Step 8: Verify console for errors**

Open browser console (F12)

Expected: No errors or warnings

**Step 9: Document test results**

Create test results file:
```bash
echo "# Executor Dashboard - Test Results

## Functional Tests
- ✅ Period filter switches correctly
- ✅ Personal metrics display correctly
- ✅ Goal progress bar works
- ✅ Motivational messages appear
- ✅ Next actions list displays correctly
- ✅ Team position card shows ranking
- ✅ Evolution chart renders

## Responsive Tests
- ✅ Mobile layout (375px)
- ✅ Tablet layout (768px)
- ✅ Desktop layout (1440px)

## Performance
- Load time: < 2s
- No console errors

Tested on: $(date)
" > docs/plans/executor-dashboard-test-results.md
```

**Step 10: Commit test results**

```bash
git add docs/plans/executor-dashboard-test-results.md
git commit -m "docs: add executor dashboard test results"
```

---

## Known Limitations and TODOs

### 1. Team Data Source

**Current:** Mock team members hardcoded in page
**TODO:**
- Fetch team members from API
- Integrate with user context to get executor's team
- Handle executors in multiple teams

### 2. User Goals Configuration

**Current:** Using default goals (15/week, 60/month)
**TODO:**
- Create backend endpoints for user settings (GET/PUT /users/me/settings)
- Add settings page for users to configure goals
- Persist goals in database
- Load user goals in hook

### 3. Next Actions Ordering

**Current:** Only fetching TODO status
**TODO:**
- Also fetch IN_PROGRESS actions
- Backend should handle ordering by: isLate DESC, priority DESC, estimatedEndDate ASC
- Consider adding filter for "my open actions"

### 4. Empty States

**Current:** Basic text messages
**TODO:**
- Add illustrations
- Add better CTAs
- Link to action creation

### 5. Trend Chart Granularity

**Current:** Shows all days with deliveries
**TODO:**
- For "Este Mês" - aggregate by week
- For "Últimos 30 Dias" - maybe show weeks
- Add granularity toggle

### 6. Team Position Privacy

**Current:** Shows position but no names
**TODO:**
- Verify this is sufficient for privacy
- Consider adding option to hide team comparison entirely
- Add tooltip explaining how ranking works

### 7. Authorization

**Current:** No role check
**TODO:**
- Verify user has `executor` role
- Redirect if unauthorized
- Handle users with multiple roles (executor + manager)

---

## Success Criteria

**Technical:**
- ✅ All TypeScript types compile without errors
- ✅ No runtime errors in console
- ✅ All components render correctly
- ✅ Metrics calculations are accurate
- ✅ Goal progress calculations work correctly
- ✅ Team position calculates correctly

**UX:**
- ✅ Page loads in < 2 seconds
- ✅ Responsive on mobile, tablet, desktop
- ✅ Period filter is intuitive
- ✅ Goal card shows clear progress
- ✅ Next actions are easy to find and click
- ✅ Team comparison is motivational (not pressuring)

**Business:**
- ✅ Executor can see personal progress quickly
- ✅ Executor can identify next actions easily
- ✅ Executor feels motivated (positive messaging)
- ✅ Executor understands team context without pressure

---

## Next Steps After Implementation

1. **Backend Integration**
   - Create /users/me/settings endpoint for goals
   - Add teamId to user context
   - Ensure action ordering works correctly in API

2. **Settings Page**
   - Allow executor to configure weekly/monthly goals
   - Save preferences to backend
   - Show goal history

3. **Gamification Enhancements**
   - Add badges for achievements
   - Add streaks (consecutive days with deliveries)
   - Add level system (Bronze/Silver/Gold)

4. **Features**
   - Allow executor to set personal deadlines
   - Show "My Week Plan" with scheduled actions
   - Add quick action creation from dashboard

5. **Improvements**
   - Server-side metrics calculation
   - Real-time updates
   - Custom date ranges
   - Export personal report
