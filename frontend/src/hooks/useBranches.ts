import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { BranchResponse, PagedResponse } from '@/lib/api-types';

export const useBranches = (page = 1, limit = 50) => {
  return useQuery({
    queryKey: ['branches', { page, limit }],
    queryFn: async (): Promise<PagedResponse<BranchResponse> | BranchResponse[]> => {
      const res = await apiClient<any>(`/branches?page=${page}&limit=${limit}`);
      return res;
    },
    retry: 1,
    staleTime: 0, // Fresh data on every query refetch
  });
};

export const useCreateBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<BranchResponse>) =>
      apiClient<BranchResponse>('/branches', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
    },
  });
};
