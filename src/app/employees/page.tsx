'use client'

import { BaseLayout } from '@/components/layout/base-layout'
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar'
import { DataTable, DataTableCell, DataTableRow, StatusBadge } from '@/components/shared/data'
import { LoadingScreen } from '@/components/shared/feedback/loading-screen'
import { PageContainer } from '@/components/shared/layout/page-container'
import { PageHeader } from '@/components/shared/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useActivateEmployee,
  useCompanies,
  useEmployeesByCompany,
  useRemoveEmployee,
  useSuspendEmployee,
} from '@/lib/services/queries'
import { UserPlus } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    manager: 'Gestor',
    executor: 'Executor',
    consultant: 'Consultor',
  }
  return labels[role] || role
}

export default function EmployeesPage() {
  const { data: companies = [], isLoading: loadingCompanies } = useCompanies()
  const [selectedCompany, setSelectedCompany] = useState<string>('')

  const { data: employees = [], isLoading: loadingEmployees } =
    useEmployeesByCompany(selectedCompany)
  const { mutateAsync: suspend } = useSuspendEmployee()
  const { mutateAsync: activate } = useActivateEmployee()
  const { mutateAsync: remove } = useRemoveEmployee()

  useEffect(() => {
    if (companies.length > 0 && !selectedCompany) {
      setSelectedCompany(companies[0].id)
    }
  }, [companies, selectedCompany])

  if (loadingCompanies) {
    return (
      <BaseLayout sidebar={<DashboardSidebar />}>
        <LoadingScreen message="Carregando..." />
      </BaseLayout>
    )
  }

  return (
    <BaseLayout sidebar={<DashboardSidebar />}>
      <PageContainer maxWidth="7xl">
        <PageHeader
          title="Funcionários"
          description="Gerencie os funcionários da sua empresa"
          action={
            <Link href="/invite-employee">
              <Button size="lg" className="w-full gap-2 sm:w-auto">
                <UserPlus className="h-5 w-5" />
                <span>Convidar Funcionário</span>
              </Button>
            </Link>
          }
        />

        {companies.length > 0 && (
          <Card className="p-4 sm:p-6">
            <label className="mb-2 block text-sm font-medium">Filtrar por Empresa</label>
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger className="h-11 w-full">
                <SelectValue placeholder="Selecione uma empresa">
                  {companies.find((c) => c.id === selectedCompany)?.name || 'Selecione'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>
        )}

        <DataTable
          headers={[
            { label: 'Nome' },
            { label: 'Email' },
            { label: 'Cargo' },
            { label: 'Status' },
            { label: 'Ações', align: 'right' },
          ]}
          isLoading={loadingEmployees}
          emptyMessage="Nenhum funcionário encontrado. Comece convidando um funcionário."
        >
          {!loadingEmployees &&
            employees.length > 0 &&
            employees.map((employee) => (
              <DataTableRow key={employee.id}>
                <DataTableCell>
                  <span className="block max-w-[200px] truncate">
                    {employee.user.firstName} {employee.user.lastName}
                  </span>
                </DataTableCell>
                <DataTableCell>
                  <span className="block max-w-[200px] truncate">{employee.user.email}</span>
                </DataTableCell>
                <DataTableCell>{getRoleLabel(employee.role)}</DataTableCell>
                <DataTableCell>
                  <StatusBadge status={employee.status} />
                </DataTableCell>
                <DataTableCell align="right">
                  <div className="flex flex-wrap justify-end gap-2">
                    {employee.status === 'SUSPENDED' && (
                      <Button variant="outline" size="sm" onClick={() => activate(employee.id)}>
                        Ativar
                      </Button>
                    )}
                    {employee.status === 'ACTIVE' && (
                      <Button variant="outline" size="sm" onClick={() => suspend(employee.id)}>
                        Suspender
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (confirm('Tem certeza que deseja remover este funcionário?')) {
                          remove(employee.id)
                        }
                      }}
                    >
                      Remover
                    </Button>
                  </div>
                </DataTableCell>
              </DataTableRow>
            ))}
        </DataTable>
      </PageContainer>
    </BaseLayout>
  )
}
