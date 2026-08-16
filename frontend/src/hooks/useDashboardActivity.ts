import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface DomainEvent {
  id: string;
  type: string;
  entity: string;
  actor: string;
  timestamp: string;
}

export function useDashboardActivity() {
  return useQuery({
    queryKey: ['dashboard-activity'],
    queryFn: async (): Promise<DomainEvent[]> => {
      try {
        const data = await apiClient<DomainEvent[]>('/dashboard/activity');
        if (Array.isArray(data)) return data;
      } catch {
        return [];
      }
      return [];
    },
    retry: false,
    staleTime: 5000,
  });
}
