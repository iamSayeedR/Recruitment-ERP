import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface ExpirationAlertDto {
  candidateApplicationId: string;
  documentType: string;
  expiryDate: string;
  status: string;
  checklistId: string;
  itemId: string;
  candidateName?: string;
}

export function useComplianceExpirations() {
  return useQuery({
    queryKey: ['compliance-expirations'],
    queryFn: async (): Promise<ExpirationAlertDto[]> => {
      const data = await apiClient<ExpirationAlertDto[]>('/compliance/expirations?tenantId=tenant-acme');
      if (Array.isArray(data)) return data;
      return [];
    },
    retry: 1,
    staleTime: 0,
    refetchInterval: 3000, // Real-time 3-second live polling for compliance governance overview
  });
}
