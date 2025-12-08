import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  teamsApi,
  type CreateTeamRequest,
  type UpdateTeamRequest,
  type AddTeamMemberRequest,
  type Team,
} from '@/lib/api/endpoints/teams'
import type { PaginationParams } from '@/lib/api/types'

const TEAMS_KEY = ['teams'] as const

export function useTeamsByCompany(companyId: string, params?: PaginationParams) {
  return useQuery({
    queryKey: [
      ...TEAMS_KEY,
      'company',
      companyId,
      params?.page,
      params?.limit,
      params?.sortBy,
      params?.sortOrder,
    ],
    queryFn: async () => {
      const teams = await teamsApi.getByCompany(companyId, params)
      return {
        data: teams || [],
        meta: {
          page: params?.page || 1,
          limit: params?.limit || teams?.length || 10,
          total: teams?.length || 0,
          totalPages: 1,
        },
      }
    },
    enabled: !!companyId,
  })
}

export function useTeam(id: string) {
  return useQuery({
    queryKey: [...TEAMS_KEY, id],
    queryFn: () => teamsApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateTeam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTeamRequest) => teamsApi.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...TEAMS_KEY, 'company', variables.companyId],
      })
      queryClient.invalidateQueries({ queryKey: TEAMS_KEY })
      queryClient.invalidateQueries({
        queryKey: ['employees', 'company', variables.companyId, 'managers'],
      })
    },
  })
}

export function useUpdateTeam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTeamRequest }) =>
      teamsApi.update(id, data),
    onSuccess: (updatedTeam, variables) => {
      queryClient.invalidateQueries({ queryKey: TEAMS_KEY })
      queryClient.invalidateQueries({ queryKey: [...TEAMS_KEY, variables.id] })
      if (updatedTeam?.companyId) {
        queryClient.invalidateQueries({
          queryKey: [...TEAMS_KEY, 'company', updatedTeam.companyId],
        })
        if (variables.data.managerId) {
          queryClient.invalidateQueries({
            queryKey: ['employees', 'company', updatedTeam.companyId, 'managers'],
          })
        }
      } else {
        if (variables.data.managerId) {
          queryClient.invalidateQueries({
            queryKey: ['employees', 'company'],
          })
        }
      }
    },
  })
}

export function useDeleteTeam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => teamsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAMS_KEY })
    },
  })
}

export function useTeamMembers(teamId: string) {
  return useQuery({
    queryKey: [...TEAMS_KEY, teamId, 'members'],
    queryFn: () => teamsApi.listMembers(teamId),
    enabled: !!teamId,
  })
}

export function useAddTeamMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ teamId, data }: { teamId: string; data: AddTeamMemberRequest }) =>
      teamsApi.addMember(teamId, data),
    onSuccess: (_, variables) => {
      const team = queryClient.getQueryData<Team>([...TEAMS_KEY, variables.teamId])
      const companyId = team?.companyId

      queryClient.invalidateQueries({
        queryKey: [...TEAMS_KEY, variables.teamId, 'members'],
      })
      queryClient.invalidateQueries({ queryKey: [...TEAMS_KEY, variables.teamId] })
      queryClient.invalidateQueries({ queryKey: TEAMS_KEY })
      if (companyId) {
        queryClient.invalidateQueries({
          queryKey: ['employees', 'company', companyId, 'executors'],
        })
      } else {
        queryClient.invalidateQueries({
          queryKey: ['employees', 'company'],
        })
      }
    },
  })
}

export function useRemoveTeamMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ teamId, memberId }: { teamId: string; memberId: string }) =>
      teamsApi.removeMember(teamId, memberId),
    onSuccess: (_, variables) => {
      const team = queryClient.getQueryData<Team>([...TEAMS_KEY, variables.teamId])
      const companyId = team?.companyId

      queryClient.invalidateQueries({
        queryKey: [...TEAMS_KEY, variables.teamId, 'members'],
      })
      queryClient.invalidateQueries({ queryKey: [...TEAMS_KEY, variables.teamId] })
      queryClient.invalidateQueries({ queryKey: TEAMS_KEY })
      if (companyId) {
        queryClient.invalidateQueries({
          queryKey: ['employees', 'company', companyId, 'executors'],
        })
      } else {
        queryClient.invalidateQueries({
          queryKey: ['employees', 'company'],
        })
      }
    },
  })
}

