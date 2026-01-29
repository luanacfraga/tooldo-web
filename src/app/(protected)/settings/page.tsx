'use client'

import { PageContainer } from '@/components/shared/layout/page-container'
import { PageHeader } from '@/components/shared/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useUserContext } from '@/lib/contexts/user-context'
import {
  formatCNPJ,
  formatCPF,
  formatCurrency,
  formatDate,
  formatNumber,
  formatPhone,
  formatRole,
} from '@/lib/formatters'
import { useCompanySettings } from '@/lib/services/queries/use-companies'
import { AlertCircle, Database, Layers, Sparkles } from 'lucide-react'

export default function GlobalSettingsPage() {
  const { user, currentCompanyId } = useUserContext()

  const fallbackCompanyId = user?.companies[0]?.id ?? null
  const effectiveCompanyId = currentCompanyId ?? fallbackCompanyId

  const { data, isLoading, error } = useCompanySettings(effectiveCompanyId || '')

  const companyName =
    user?.companies.find((c) => c.id === effectiveCompanyId)?.name ??
    data?.company.name ??
    undefined

  return (
    <PageContainer maxWidth="5xl">
      <PageHeader
        title="Configurações"
        description="Veja detalhes do grupo (admin, plano) e da empresa selecionada."
      />

      <div className="mt-6 space-y-6">
        {!effectiveCompanyId ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
                Nenhuma empresa selecionada
              </CardTitle>
              <CardDescription>
                Selecione uma empresa no topo para visualizar as configurações de empresa, plano e
                administrador.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : isLoading ? (
          <div className="space-y-4">
            <div className="h-28 animate-pulse rounded-xl bg-muted/60" />
            <div className="h-40 animate-pulse rounded-xl bg-muted/60" />
          </div>
        ) : error || !data ? (
          <Card className="border-destructive/40 bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Não foi possível carregar as configurações
              </CardTitle>
              <CardDescription className="text-destructive">
                Tente atualizar a página ou voltar mais tarde.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  {companyName ? `Empresa • ${companyName}` : 'Dados da empresa'}
                </CardTitle>
                <CardDescription>Informações cadastrais da empresa selecionada.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Nome</p>
                  <p className="text-sm font-semibold">{data.company.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">ID da empresa</p>
                  <p className="break-all font-mono text-[11px] text-muted-foreground">
                    {data.company.id}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">CNPJ</p>
                  <p className="font-mono text-[11px] text-muted-foreground">
                    {data.company.document
                      ? data.company.documentType === 'CNPJ'
                        ? formatCNPJ(data.company.document.replace(/\D/g, ''))
                        : formatCPF(data.company.document.replace(/\D/g, ''))
                      : '-'}
                  </p>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <p className="text-xs font-medium text-muted-foreground">Descrição</p>
                  <p className="text-sm text-foreground">
                    {data.company.description || 'Nenhuma descrição cadastrada.'}
                  </p>
                </div>
              </CardContent>
            </Card>

            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  Administrador do grupo
                </CardTitle>
                <CardDescription>
                  Dados do administrador dono das empresas e responsável pela assinatura.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Nome</p>
                  <p className="text-sm font-semibold">
                    {data.admin.firstName} {data.admin.lastName}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Email</p>
                  <p className="break-all text-sm text-muted-foreground">{data.admin.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Telefone</p>
                  <p className="text-sm text-muted-foreground">{formatPhone(data.admin.phone)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Documento</p>
                  <p className="font-mono text-[11px] text-muted-foreground">
                    {data.admin.documentType === 'CNPJ'
                      ? formatCNPJ(data.admin.document.replace(/\D/g, ''))
                      : formatCPF(data.admin.document.replace(/\D/g, ''))}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Papel</p>
                  <p className="text-sm text-muted-foreground">
                    {formatRole(data.admin.role as any)}
                  </p>
                </div>
              </CardContent>
            </Card>

            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" />
                  Plano e limites do grupo
                </CardTitle>
                <CardDescription>
                  Plano atual vinculado ao administrador e limites globais para todas as empresas.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Plano atual</p>
                    <p className="text-base font-semibold">{data.plan.name}</p>
                  </div>
                  <Badge
                    variant={data.subscription.isActive ? 'default' : 'outline'}
                    className={
                      data.subscription.isActive ? 'bg-emerald-600 hover:bg-emerald-700' : ''
                    }
                  >
                    {data.subscription.isActive ? 'Assinatura ativa' : 'Assinatura inativa'}
                  </Badge>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <PlanLimitItem
                    label="Empresas"
                    value={data.plan.maxCompanies}
                    helper="Máximo de empresas que este admin pode criar."
                  />
                  <PlanLimitItem
                    label="Gestores"
                    value={data.plan.maxManagers}
                    helper="Total de gestores somando todas as empresas."
                  />
                  <PlanLimitItem
                    label="Executores"
                    value={data.plan.maxExecutors}
                    helper="Total de executores somando todas as empresas."
                  />
                  <PlanLimitItem
                    label="Consultores"
                    value={data.plan.maxConsultants}
                    helper="Total de consultores somando todas as empresas."
                  />
                  <PlanLimitItem
                    label="Limite de IA"
                    value={data.plan.iaCallsLimit}
                    helper="Tokens / chamadas de IA disponíveis na assinatura."
                    format="number"
                  />
                </div>

                <div className="flex items-start gap-2 rounded-lg border border-border/50 bg-muted/40 p-3 text-xs text-muted-foreground">
                  <Sparkles className="mt-0.5 h-3.5 w-3.5 text-primary" />
                  <div>
                    <p className="font-medium">Assinatura</p>
                    <p>
                      Iniciada em {formatDate(data.subscription.startedAt)} · ID:{' '}
                      <span className="font-mono">{data.subscription.id}</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </PageContainer>
  )
}

interface PlanLimitItemProps {
  label: string
  value: number
  helper?: string
  format?: 'number' | 'currency'
}

function PlanLimitItem({ label, value, helper, format = 'number' }: PlanLimitItemProps) {
  const display = format === 'currency' ? formatCurrency(value) : formatNumber(value)

  return (
    <div className="space-y-1 rounded-md border border-border/50 bg-card/60 p-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">{display}</p>
      {helper && <p className="text-[11px] text-muted-foreground">{helper}</p>}
    </div>
  )
}
