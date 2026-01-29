import { actionsApi } from '@/lib/api/endpoints/actions'
import type { PaginatedResponse } from '@/lib/api/types'
import type {
  Action,
  ActionFilters,
  ActionSuggestion,
  BlockActionDto,
  CreateActionDto,
  GenerateActionPlanDto,
  MoveActionDto,
  UpdateActionDto,
} from '@/lib/types/action'
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query'

export const actionKeys = {
  all: ['actions'] as const,
  lists: () => [...actionKeys.all, 'list'] as const,
  list: (filters: ActionFilters) => [...actionKeys.lists(), filters] as const,
  details: () => [...actionKeys.all, 'detail'] as const,
  detail: (id: string) => [...actionKeys.details(), id] as const,
}

export function useActions(
  filters: ActionFilters = {}
): UseQueryResult<PaginatedResponse<Action>, Error> {
  const hasScope = !!(filters.companyId || filters.teamId || filters.responsibleId)
  return useQuery({
    queryKey: actionKeys.list(filters),
    queryFn: () => actionsApi.getAll(filters),
    staleTime: 1000 * 60,
    placeholderData: keepPreviousData,
    enabled: hasScope,
  })
}

export function useAction(id: string): UseQueryResult<Action, Error> {
  return useQuery({
    queryKey: actionKeys.detail(id),
    queryFn: async () => {
      return actionsApi.getById(id)
    },
    enabled: !!id,
  })
}

export function useCreateAction(): UseMutationResult<Action, Error, CreateActionDto> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: actionsApi.create,
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: actionKeys.lists() })
    },
  })
}

export function useUpdateAction(): UseMutationResult<
  Action,
  Error,
  { id: string; data: UpdateActionDto }
> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => actionsApi.update(id, data),
    onSuccess: (updatedAction) => {
      queryClient.setQueryData(actionKeys.detail(updatedAction.id), updatedAction)
      queryClient.invalidateQueries({ queryKey: actionKeys.detail(updatedAction.id) })
      queryClient.invalidateQueries({ queryKey: actionKeys.lists() })
    },
  })
}

export function useDeleteAction(): UseMutationResult<Action, Error, string> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: actionsApi.delete,
    onSuccess: (deletedAction) => {
      queryClient.removeQueries({ queryKey: actionKeys.detail(deletedAction.id) })
      queryClient.invalidateQueries({ queryKey: actionKeys.lists() })
    },
  })
}

export function useMoveAction(): UseMutationResult<
  Action,
  Error,
  { id: string; data: MoveActionDto }
> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => actionsApi.move(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: actionKeys.detail(id) })
      await queryClient.cancelQueries({ queryKey: actionKeys.lists() })

      const previousAction = queryClient.getQueryData<Action>(actionKeys.detail(id))
      const previousLists = queryClient.getQueriesData<PaginatedResponse<Action>>({
        queryKey: actionKeys.lists(),
      })

      if (previousAction) {
        queryClient.setQueryData<Action>(actionKeys.detail(id), {
          ...previousAction,
          status: data.toStatus,
        })
      }

      previousLists.forEach(([queryKey, listData]) => {
        if (!listData) return

        const updatedData = {
          ...listData,
          data: listData.data.map((action) =>
            action.id === id ? { ...action, status: data.toStatus } : action
          ),
        }

        queryClient.setQueryData(queryKey, updatedData)
      })

      return { previousAction, previousLists }
    },
    onError: (_err, { id }, context) => {
      if (context?.previousAction) {
        queryClient.setQueryData(actionKeys.detail(id), context.previousAction)
      }

      if (context?.previousLists) {
        context.previousLists.forEach(([queryKey, data]) => {
          if (data) {
            queryClient.setQueryData(queryKey, data)
          }
        })
      }
    },
    onSuccess: (updatedAction) => {
      queryClient.setQueryData(actionKeys.detail(updatedAction.id), updatedAction)

      const allLists = queryClient.getQueriesData<PaginatedResponse<Action>>({
        queryKey: actionKeys.lists(),
      })

      allLists.forEach(([queryKey, listData]) => {
        if (!listData) return

        const updatedData = {
          ...listData,
          data: listData.data.map((action) =>
            action.id === updatedAction.id ? updatedAction : action
          ),
        }

        queryClient.setQueryData(queryKey, updatedData)
      })
    },
  })
}

export function useBlockAction(): UseMutationResult<
  Action,
  Error,
  { id: string; data: BlockActionDto }
> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => actionsApi.block(id, data),
    onSuccess: (updatedAction) => {
      queryClient.setQueryData(actionKeys.detail(updatedAction.id), updatedAction)
      queryClient.invalidateQueries({ queryKey: actionKeys.lists() })
    },
  })
}

export function useUnblockAction(): UseMutationResult<Action, Error, string> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: actionsApi.unblock,
    onSuccess: (updatedAction) => {
      queryClient.setQueryData(actionKeys.detail(updatedAction.id), updatedAction)
      queryClient.invalidateQueries({ queryKey: actionKeys.lists() })
    },
  })
}

export function useGenerateActionPlan(): UseMutationResult<
  ActionSuggestion[],
  Error,
  GenerateActionPlanDto
> {
  return useMutation({
    mutationFn: actionsApi.generate,
  })
}
