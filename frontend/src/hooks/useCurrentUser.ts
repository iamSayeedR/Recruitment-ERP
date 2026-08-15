import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { CurrentUserResponse } from '@/lib/api-types';

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => apiClient<CurrentUserResponse>('/v1/me'),
    staleTime: 5 * 60 * 1000,
  });
};
