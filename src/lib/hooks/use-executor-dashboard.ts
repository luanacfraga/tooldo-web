'use client'

import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { companiesApi } from '@/lib/api/endpoints/companies'
import type { ExecutorDashboardResponse } from '@/lib/types/executor-dashboard'

export const executorDashboardKeys = {
  all: ['executor-dashboard'] as const,
  byCompany: (companyId: string) => [...executorDashboardKeys.all, companyId] as const,
  byCompanyAndPeriod: (companyId: string, dateFrom: string, dateTo: string) =>
    [...executorDashboardKeys.byCompany(companyId), dateFrom, dateTo] as const,
}

export function useExecutorDashboard(input: {
  companyId: string
  dateFrom: string
  dateTo: string
}): UseQueryResult<ExecutorDashboardResponse, Error> {
  return useQuery({
    queryKey: executorDashboardKeys.byCompanyAndPeriod(
      input.companyId,
      input.dateFrom,
      input.dateTo
    ),
    queryFn: () =>
      companiesApi.getExecutorDashboard(input.companyId, {
        dateFrom: input.dateFrom,
        dateTo: input.dateTo,
      }),
    enabled: !!input.companyId && !!input.dateFrom && !!input.dateTo,
  })
}


