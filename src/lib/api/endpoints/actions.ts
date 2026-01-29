import { apiClient } from '../api-client';
import type { PaginatedResponse } from '@/lib/api/types';
import type {
  Action,
  ActionFilters,
  AddChecklistItemDto,
  BlockActionDto,
  ChecklistItem,
  CreateActionDto,
  GenerateActionPlanDto,
  ActionSuggestion,
  MoveActionDto,
  UpdateActionDto,
} from '@/lib/types/action';

function buildQueryString(filters: ActionFilters): string {
  const params = new URLSearchParams();

  const supportedKeys: (keyof ActionFilters)[] = [
    'companyId',
    'teamId',
    'responsibleId',
    'creatorId',
    'status',
    'statuses',
    'priority',
    'isLate',
    'isBlocked',
    'lateStatus',
    'q',
    'dateFrom',
    'dateTo',
    'dateFilterType',
    'page',
    'limit',
  ];

  supportedKeys.forEach((key) => {
    const value = filters[key];
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach((v) => {
          if (v !== undefined && v !== null && String(v) !== '') {
            params.append(String(key), String(v));
          }
        });
      } else {
        params.append(String(key), String(value));
      }
    }
  });

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

export const actionsApi = {
  getAll: (filters: ActionFilters = {}): Promise<PaginatedResponse<Action>> => {
    const queryString = buildQueryString(filters);
    return apiClient.get<PaginatedResponse<Action>>(`/api/v1/actions${queryString}`);
  },

  getById: (id: string): Promise<Action> => {
    return apiClient.get<Action>(`/api/v1/actions/${id}`);
  },

  create: (data: CreateActionDto): Promise<Action> => {
    return apiClient.post<Action>('/api/v1/actions', data);
  },

  update: (id: string, data: UpdateActionDto): Promise<Action> => {
    return apiClient.put<Action>(`/api/v1/actions/${id}`, data);
  },

  delete: (id: string): Promise<Action> => {
    return apiClient.delete<Action>(`/api/v1/actions/${id}`);
  },

  move: (id: string, data: MoveActionDto): Promise<Action> => {
    return apiClient.patch<Action>(`/api/v1/actions/${id}/move`, data);
  },

  block: (id: string, data: BlockActionDto): Promise<Action> => {
    return apiClient.patch<Action>(`/api/v1/actions/${id}/block`, data);
  },

  unblock: (id: string): Promise<Action> => {
    return apiClient.patch<Action>(`/api/v1/actions/${id}/unblock`);
  },

  addChecklistItem: (
    actionId: string,
    data: AddChecklistItemDto
  ): Promise<ChecklistItem> => {
    return apiClient.post<ChecklistItem>(`/api/v1/actions/${actionId}/checklist`, data);
  },

  toggleChecklistItem: (itemId: string): Promise<ChecklistItem> => {
    return apiClient.patch<ChecklistItem>(`/api/v1/actions/checklist/${itemId}/toggle`);
  },

  reorderChecklistItems: (
    actionId: string,
    itemIds: string[]
  ): Promise<ChecklistItem[]> => {
    return apiClient.patch<ChecklistItem[]>(
      `/api/v1/actions/${actionId}/checklist/reorder`,
      { itemIds }
    );
  },

  generate: (data: GenerateActionPlanDto): Promise<ActionSuggestion[]> => {
    return apiClient.post<ActionSuggestion[]>('/api/v1/actions/generate', data);
  },
};

export type {
  Action,
  ActionFilters,
  AddChecklistItemDto,
  BlockActionDto,
  ChecklistItem,
  CreateActionDto,
  GenerateActionPlanDto,
  ActionSuggestion,
  MoveActionDto,
  UpdateActionDto,
};
