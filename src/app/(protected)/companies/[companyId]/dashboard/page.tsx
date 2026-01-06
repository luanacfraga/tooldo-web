'use client'

import Link from 'next/link'
import { useEffect, useMemo } from 'react'
import { StatCard } from '@/components/shared/data/stat-card'
import { ActivityItem } from '@/components/shared/feedback/activity-item'
import { PageContainer } from '@/components/shared/layout/page-container'
import { PageHeader } from '@/components/shared/layout/page-header'
import { ProgressBar } from '@/components/shared/data/progress-bar'
import { LoadingSpinner } from '@/components/shared/feedback/loading-spinner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useUserContext } from '@/lib/contexts/user-context'
import { useActions } from '@/lib/hooks/use-actions'
import { useActionFiltersStore } from '@/lib/stores/action-filters-store'
import { ActionStatus } from '@/lib/types/action'
import { BarChart3, CheckSquare, Clock, Lock, Sparkles } from 'lucide-react'
import { useParams } from 'next/navigation'

function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return '0%'
  return `${Math.round(value)}%`
}

function getMotivationCopy(input: {
  total: number
  done: number
  inProgress: number
  late: number
  blocked: number
}) {
  const { total, done, inProgress, late, blocked } = input

  if (total <= 0) {
    return {
      title: 'Vamos começar?',
      subtitle: 'Crie sua primeira ação e dê o primeiro passo rumo às entregas.',
      tone: 'fresh' as const,
    }
  }

  if (done >= total) {
    return {
      title: 'Missão cumprida!',
      subtitle: 'Você concluiu tudo por aqui. Que tal planejar a próxima rodada?',
      tone: 'celebrate' as const,
    }
  }

  if (late > 0) {
    return {
      title: 'Hora de recuperar o ritmo',
      subtitle: `${late} ação(ões) atrasada(s). Escolha uma e destrave a próxima entrega agora.`,
      tone: 'focus' as const,
    }
  }

  if (blocked > 0) {
    return {
      title: 'Destrave para avançar',
      subtitle: `${blocked} ação(ões) bloqueada(s). Um desbloqueio hoje pode liberar várias entregas.`,
      tone: 'focus' as const,
    }
  }

  if (inProgress > 0) {
    return {
      title: 'Bora finalizar',
      subtitle: `${inProgress} em andamento. Fechar uma hoje já muda o jogo.`,
      tone: 'focus' as const,
    }
  }

  return {
    title: 'Pronto para avançar?',
    subtitle: 'Escolha uma ação pendente e comece pelo próximo passo mais simples.',
    tone: 'fresh' as const,
  }
}

export default function CompanyDashboardPage() {
  const params = useParams()
  const { user, setCurrentCompanyId } = useUserContext()
  const companyId = params.companyId as string
  const filters = useActionFiltersStore()

  const company = user?.companies.find((c) => c.id === companyId)

  // Keep global company selection in sync with route
  useEffect(() => {
    if (!companyId) return
    setCurrentCompanyId(companyId)
  }, [companyId, setCurrentCompanyId])

  const totalFilters = useMemo(
    () => ({ companyId, page: 1, limit: 1 }),
    [companyId]
  )
  const todoFilters = useMemo(
    () => ({ companyId, status: ActionStatus.TODO, page: 1, limit: 1 }),
    [companyId]
  )
  const inProgressFilters = useMemo(
    () => ({ companyId, status: ActionStatus.IN_PROGRESS, page: 1, limit: 1 }),
    [companyId]
  )
  const doneFilters = useMemo(
    () => ({ companyId, status: ActionStatus.DONE, page: 1, limit: 1 }),
    [companyId]
  )
  const lateFilters = useMemo(
    () => ({ companyId, isLate: true, page: 1, limit: 1 }),
    [companyId]
  )
  const blockedFilters = useMemo(
    () => ({ companyId, isBlocked: true, page: 1, limit: 1 }),
    [companyId]
  )

  const focusFilters = useMemo(
    () => ({ companyId, status: ActionStatus.IN_PROGRESS, page: 1, limit: 3 }),
    [companyId]
  )
  const nextFilters = useMemo(
    () => ({ companyId, status: ActionStatus.TODO, page: 1, limit: 3 }),
    [companyId]
  )

  const totalQ = useActions(totalFilters)
  const todoQ = useActions(todoFilters)
  const inProgressQ = useActions(inProgressFilters)
  const doneQ = useActions(doneFilters)
  const lateQ = useActions(lateFilters)
  const blockedQ = useActions(blockedFilters)

  const focusQ = useActions(focusFilters)
  const nextQ = useActions(nextFilters)

  const total = totalQ.data?.meta.total ?? 0
  const todo = todoQ.data?.meta.total ?? 0
  const inProgress = inProgressQ.data?.meta.total ?? 0
  const done = doneQ.data?.meta.total ?? 0
  const late = lateQ.data?.meta.total ?? 0
  const blocked = blockedQ.data?.meta.total ?? 0

  const completionRate = total > 0 ? (done / total) * 100 : 0
  const motivation = getMotivationCopy({ total, done, inProgress, late, blocked })

  const isLoadingStats =
    totalQ.isLoading ||
    todoQ.isLoading ||
    inProgressQ.isLoading ||
    doneQ.isLoading ||
    lateQ.isLoading ||
    blockedQ.isLoading

  return (
    <PageContainer maxWidth="7xl">
      <PageHeader
        title={`Olá, ${user?.name?.split(' ')[0] || 'Usuário'}!`}
        description={`Bem-vindo(a) ao painel de controle${company ? ` - ${company.name}` : ''}`}
        action={
          <div className="flex items-center gap-2">
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link href="/actions/new">Nova Ação</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/actions">Ver Ações</Link>
            </Button>
          </div>
        }
      />

      {/* Motivation hero */}
      <Card className="mb-6 overflow-hidden border-border/40 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-lg sm:text-xl">
                <span className="inline-flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  {motivation.title}
                </span>
              </CardTitle>
              <CardDescription className="max-w-2xl">
                {motivation.subtitle}
              </CardDescription>
            </div>

            {isLoadingStats ? (
              <div className="pt-1">
                <LoadingSpinner size="sm" variant="muted" label="Carregando métricas..." />
              </div>
            ) : (
              <div className="hidden sm:flex flex-col items-end gap-1">
                <div className="text-sm font-semibold text-foreground">
                  {formatPercent(completionRate)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {done} de {total} concluídas
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Progresso</span>
              <span className="sm:hidden">
                {done} / {total}
              </span>
            </div>
            <ProgressBar value={completionRate} label="Progresso de conclusão" />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button
              size="sm"
              onClick={() => {
                filters.resetFilters()
                filters.setFilter('companyId', companyId)
                filters.setFilter('viewMode', 'kanban')
              }}
              asChild
              className="sm:w-auto"
            >
              <Link href="/actions">Continuar no Kanban</Link>
            </Button>

            {late > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  filters.resetFilters()
                  filters.setFilter('companyId', companyId)
                  filters.setFilter('showLateOnly', true)
                }}
                asChild
              >
                <Link href="/actions">
                  <Clock className="mr-2 h-4 w-4 text-warning" />
                  Ver atrasadas ({late})
                </Link>
              </Button>
            )}

            {blocked > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  filters.resetFilters()
                  filters.setFilter('companyId', companyId)
                  filters.setFilter('showBlockedOnly', true)
                }}
                asChild
              >
                <Link href="/actions">
                  <Lock className="mr-2 h-4 w-4 text-warning" />
                  Ver bloqueadas ({blocked})
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
        <StatCard
          title="Pendentes"
          value={todo}
          description="Prontas para começar"
          icon={CheckSquare}
          iconColor="text-muted-foreground"
          bgColor="bg-muted"
        />
        <StatCard
          title="Em Andamento"
          value={inProgress}
          description="Em execução agora"
          icon={BarChart3}
          iconColor="text-info"
          bgColor="bg-info/10"
        />
        <StatCard
          title="Concluídas"
          value={done}
          description="Entregas realizadas"
          icon={CheckSquare}
          iconColor="text-success"
          bgColor="bg-success/10"
        />
        <StatCard
          title="Atrasadas"
          value={late}
          description="Priorize para destravar"
          icon={Clock}
          iconColor={late > 0 ? 'text-warning' : 'text-muted-foreground'}
          bgColor={late > 0 ? 'bg-warning/10' : 'bg-muted'}
        />
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Foco agora</CardTitle>
            <CardDescription>Continue o que já está em andamento</CardDescription>
          </CardHeader>
          <CardContent>
            {focusQ.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="md" variant="muted" label="Carregando..." />
              </div>
            ) : focusQ.data?.data?.length ? (
              <div className="space-y-4">
                {focusQ.data.data.map((a) => (
                  <ActivityItem
                    key={a.id}
                    title={a.title}
                    description={a.isBlocked ? 'Bloqueada' : undefined}
                    color={a.isBlocked ? 'orange' : 'blue'}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Sem ações em andamento. Comece por uma pendente e ganhe ritmo.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximo passo</CardTitle>
            <CardDescription>Escolha uma pendente e avance</CardDescription>
          </CardHeader>
          <CardContent>
            {nextQ.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="md" variant="muted" label="Carregando..." />
              </div>
            ) : nextQ.data?.data?.length ? (
              <div className="space-y-4">
                {nextQ.data.data.map((a) => (
                  <ActivityItem
                    key={a.id}
                    icon={<CheckSquare className="h-5 w-5 flex-shrink-0 text-muted-foreground" />}
                    title={a.title}
                    description={a.isLate ? 'Atrasada' : undefined}
                    color={a.isLate ? 'orange' : 'purple'}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Sem ações pendentes. Crie uma nova e comece a entregar.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
