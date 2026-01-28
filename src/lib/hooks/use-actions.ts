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

/**
 * Hook to fetch actions with filters
 */
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

/**
 * Hook to fetch single action by ID.
 *
 * Note: backend currently does not expose GET /actions/:id, so we resolve the action
 * by listing actions (scoped to selected company when available) and finding by id.
 */
export function useAction(id: string): UseQueryResult<Action, Error> {
  return useQuery({
    queryKey: actionKeys.detail(id),
    queryFn: async () => {
      return actionsApi.getById(id)
    },
    enabled: !!id,
  })
}

/**
 * Hook to create action
 */
export function useCreateAction(): UseMutationResult<Action, Error, CreateActionDto> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: actionsApi.create,
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: actionKeys.lists() })
    },
  })
}

/**
 * Hook to update action
 */
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

/**
 * Hook to delete action
 */
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

/**
 * Hook to move action status
 */
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

/**
 * Hook to block action
 */
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

/**
 * Hook to unblock action
 */
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

/**
 * Hook to generate action plan suggestions (IA)
 */
export function useGenerateActionPlan(): UseMutationResult<
  ActionSuggestion[],
  Error,
  GenerateActionPlanDto
> {
  return useMutation({
    mutationFn: actionsApi.generate,
  })
}
