import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface ClientResponse {
  id: string;
  name: string;
  industry?: string;
  country?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
  createdAt?: string;
}

export interface CreateClientRequest {
  name: string;
  industry?: string;
  country?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
}

export const useClients = () => {
  return useQuery<ClientResponse[]>({
    queryKey: ['clients'],
    queryFn: async (): Promise<ClientResponse[]> => {
      const res = await apiClient<any>('/clients');
      if (Array.isArray(res)) return res;
      if (res && Array.isArray(res.content)) return res.content;
      return [];
    },
    retry: 1,
    staleTime: 0,
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateClientRequest) =>
      apiClient<ClientResponse>('/clients', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};
