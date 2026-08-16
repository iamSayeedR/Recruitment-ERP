import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import {
  Requisition,
  CreateRequisitionRequest,
  UpdateRequisitionRequest,
  PagedResponse,
  RequisitionStatus,
} from '@/lib/api-types';

export const REQUISITION_KEYS = {
  all: ['requisitions'] as const,
  lists: () => [...REQUISITION_KEYS.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...REQUISITION_KEYS.lists(), filters] as const,
  details: () => [...REQUISITION_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...REQUISITION_KEYS.details(), id] as const,
};

export function useRequisitions(filters: Record<string, any> = {}) {
  const queryParams = new URLSearchParams({ size: '50', ...filters }).toString();
  const endpoint = `/requisitions?${queryParams}`;

  return useQuery({
    queryKey: REQUISITION_KEYS.list(filters),
    queryFn: async (): Promise<Requisition[]> => {
      const res = await apiClient<PagedResponse<Requisition> | Requisition[]>(endpoint);
      if (Array.isArray(res)) return res;
      if (res && Array.isArray((res as PagedResponse<Requisition>).content)) {
        return (res as PagedResponse<Requisition>).content || [];
      }
      return [];
    },
    retry: 1,
    staleTime: 0,
  });
}

export function useRequisition(id: string) {
  return useQuery({
    queryKey: REQUISITION_KEYS.detail(id),
    queryFn: async (): Promise<Requisition> => {
      return await apiClient<Requisition>(`/requisitions/${id}`);
    },
    enabled: !!id,
    staleTime: 0,
  });
}

export function useCreateRequisition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRequisitionRequest) =>
      apiClient<Requisition>('/requisitions', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REQUISITION_KEYS.lists() });
    },
  });
}

export function useUpdateRequisition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRequisitionRequest }) =>
      apiClient<Requisition>(`/requisitions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: REQUISITION_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: REQUISITION_KEYS.lists() });
    },
  });
}

export function useTransitionRequisitionStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: RequisitionStatus; notes?: string }) =>
      apiClient<Requisition>(`/requisitions/${id}/transition`, {
        method: 'POST',
        body: JSON.stringify({ newStatus: status, notes: notes || '' }),
      }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: REQUISITION_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: REQUISITION_KEYS.lists() });
    },
  });
}
