import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import {
  Candidate,
  CandidateApplication,
  CreateCandidateRequest,
  PagedResponse,
  CandidateApplicationStatus,
} from '@/lib/api-types';

export const CANDIDATE_KEYS = {
  all: ['candidates'] as const,
  lists: () => [...CANDIDATE_KEYS.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...CANDIDATE_KEYS.lists(), filters] as const,
  details: () => [...CANDIDATE_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...CANDIDATE_KEYS.details(), id] as const,
  applications: (id: string) => [...CANDIDATE_KEYS.detail(id), 'applications'] as const,
  requisitionApplications: (reqId: string) => ['requisition_applications', reqId] as const,
};

export function useCandidates(filters: Record<string, any> = {}) {
  const queryParams = new URLSearchParams(filters).toString();
  const endpoint = queryParams ? `/candidates?${queryParams}` : '/candidates?page=0&size=50';
  return useQuery({
    queryKey: CANDIDATE_KEYS.list(filters),
    queryFn: async (): Promise<Candidate[]> => {
      const res = await apiClient<PagedResponse<Candidate> | Candidate[]>(endpoint);
      if (Array.isArray(res)) return res;
      if (res && Array.isArray((res as PagedResponse<Candidate>).content)) {
        return (res as PagedResponse<Candidate>).content || [];
      }
      return [];
    },
    retry: 1,
    staleTime: 0,
  });
}

export function useCandidate(id: string) {
  return useQuery({
    queryKey: CANDIDATE_KEYS.detail(id),
    queryFn: async (): Promise<Candidate> => {
      return await apiClient<Candidate>(`/candidates/${id}`);
    },
    enabled: !!id && id !== 'new',
    staleTime: 0,
  });
}

export function useCreateCandidate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCandidateRequest) => 
      apiClient<Candidate>('/candidates', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CANDIDATE_KEYS.lists() });
    },
  });
}

export function useBulkUploadCandidates() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCandidateRequest[]) => 
      apiClient<{ message: string }>('/candidates/bulk', {
        method: 'POST',
        body: JSON.stringify({ candidates: data }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CANDIDATE_KEYS.lists() });
    },
  });
}

export function useCreateCandidateApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { candidateId: string; requisitionId: string }) =>
      apiClient<CandidateApplication>('/candidates/applications', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (_, { candidateId, requisitionId }) => {
      queryClient.invalidateQueries({ queryKey: CANDIDATE_KEYS.applications(candidateId) });
      queryClient.invalidateQueries({ queryKey: CANDIDATE_KEYS.requisitionApplications(requisitionId) });
    },
  });
}

export function useTransitionCandidateApplicationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: CandidateApplicationStatus }) =>
      apiClient<CandidateApplication>(`/candidates/applications/${id}/status?status=${status}`, {
        method: 'PATCH',
      }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['requisition_applications'] });
      queryClient.invalidateQueries({ queryKey: CANDIDATE_KEYS.all });
    },
  });
}

export function useGeneratePresignedUrl() {
  return useMutation({
    mutationFn: ({ fileName, fileType }: { fileName: string; fileType: string }) =>
      apiClient<{ presignedUrl: string; documentId: string }>('/documents/presigned-url', {
        method: 'POST',
        body: JSON.stringify({ fileName, fileType }),
      }),
  });
}
