'use client'

import { RequireCompany } from '@/components/features/auth/guards/require-company'
import { BaseLayout } from '@/components/layout/base-layout'
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar'
import { StatCard } from '@/components/shared/data/stat-card'
import { ActivityItem } from '@/components/shared/feedback/activity-item'
import { PageContainer } from '@/components/shared/layout/page-container'
import { PageHeader } from '@/components/shared/layout/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/lib/stores/auth-store'
import { BarChart3, Building2, CheckSquare, Users } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuthStore()

  const stats = [
    {
      title: 'Empresas',
      value: '2',
      icon: Building2,
      description: 'Total de empresas',
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    },
    {
      title: 'Funcionários',
      value: '12',
      icon: Users,
      description: 'Ativos no sistema',
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
    },
    {
      title: 'Tarefas',
      value: '24',
      icon: CheckSquare,
      description: 'Em andamento',
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    },
    {
      title: 'Performance',
      value: '94%',
      icon: BarChart3,
      description: 'Taxa de conclusão',
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20',
    },
  ]

  const activities = [
    {
      title: 'Nova empresa cadastrada',
      time: 'Há 2 horas',
      color: 'green' as const,
    },
    {
      title: 'Funcionário convidado',
      time: 'Há 5 horas',
      color: 'blue' as const,
    },
    {
      title: 'Tarefa concluída',
      time: 'Há 1 dia',
      color: 'purple' as const,
    },
  ]

  const tasks = [
    {
      title: 'Revisar documentação',
      description: 'Prazo: Hoje',
    },
    {
      title: 'Aprovar convites pendentes',
      description: 'Prazo: Amanhã',
    },
    {
      title: 'Atualizar informações da empresa',
      description: 'Prazo: Esta semana',
    },
  ]

  return (
    <RequireCompany>
      <BaseLayout sidebar={<DashboardSidebar />}>
        <PageContainer maxWidth="7xl">
          <PageHeader
            title={`Olá, ${user?.name?.split(' ')[0] || 'Usuário'}!`}
            description="Bem-vindo ao painel de controle"
          />

          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {stats.map((stat) => (
              <StatCard
                key={stat.title}
                title={stat.title}
                value={stat.value}
                description={stat.description}
                icon={stat.icon}
                iconColor={stat.iconColor}
                bgColor={stat.bgColor}
              />
            ))}
          </div>

          <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Atividades Recentes</CardTitle>
                <CardDescription>Últimas atualizações do sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.map((activity, index) => (
                    <ActivityItem
                      key={index}
                      title={activity.title}
                      time={activity.time}
                      color={activity.color}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Próximas Ações</CardTitle>
                <CardDescription>Tarefas pendentes importantes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tasks.map((task, index) => (
                    <ActivityItem
                      key={index}
                      icon={<CheckSquare className="h-5 w-5 flex-shrink-0 text-muted-foreground" />}
                      title={task.title}
                      description={task.description}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </PageContainer>
      </BaseLayout>
    </RequireCompany>
  )
}
