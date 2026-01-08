import { objectivesApi, type Objective, type CreateObjectiveRequest, type UpdateObjectiveRequest } from '@/lib/api/endpoints/objectives'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const OBJECTIVES_KEY = ['objectives'] as const

export function useObjectivesByTeam(companyId: string, teamId: string) {
  return useQuery({
    queryKey: [...OBJECTIVES_KEY, companyId, teamId],
    queryFn: () => objectivesApi.listByTeam(companyId, teamId),
    enabled: !!companyId && !!teamId,
  }) as {
    data: Objective[] | undefined
    isLoading: boolean
    error: Error | null
  }
}

export function useCreateObjective() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateObjectiveRequest) => objectivesApi.create(data),
    onSuccess: (created) => {
      queryClient.invalidateQueries({
        queryKey: [...OBJECTIVES_KEY, created.companyId, created.teamId],
      })
    },
  })
}

export function useUpdateObjective() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateObjectiveRequest }) =>
      objectivesApi.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({
        queryKey: [...OBJECTIVES_KEY, updated.companyId, updated.teamId],
      })
    },
  })
}

export function useDeleteObjective() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => objectivesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OBJECTIVES_KEY })
    },
  })
}


