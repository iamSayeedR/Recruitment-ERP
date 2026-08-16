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
      let data: ExpirationAlertDto[] = [];
      try {
        const res = await apiClient<ExpirationAlertDto[]>('/compliance/expirations?tenantId=tenant-acme');
        if (Array.isArray(res)) data = res;
      } catch {
        data = [];
      }

      // Dynamic candidate name resolution from API
      const dynamicMap = new Map<string, string>();
      try {
        const candidatesRes = await apiClient<any>('/candidates?size=50');
        const cList = Array.isArray(candidatesRes) ? candidatesRes : candidatesRes?.content || candidatesRes?.data || [];
        if (Array.isArray(cList)) {
          cList.forEach((c: any) => {
            if (c.id && (c.firstName || c.lastName)) {
              dynamicMap.set(c.id, `${c.firstName || ''} ${c.lastName || ''}`.trim());
            }
          });
        }
      } catch {}

      try {
        const appRes = await apiClient<any>('/candidates/applications');
        const appList = Array.isArray(appRes) ? appRes : appRes?.content || appRes?.data || [];
        if (Array.isArray(appList)) {
          appList.forEach((a: any) => {
            if (a.id && a.candidate) {
              const fullName = `${a.candidate.firstName || ''} ${a.candidate.lastName || ''}`.trim();
              if (fullName) {
                dynamicMap.set(a.id, fullName);
                if (a.candidateId) dynamicMap.set(a.candidateId, fullName);
              }
            }
          });
        }
      } catch {}

      return data.map(item => {
        const id = item.candidateApplicationId;
        const resolvedName = item.candidateName || dynamicMap.get(id) || (id ? `Candidate (${id.slice(0, 8)})` : 'Candidate');
        return {
          ...item,
          candidateName: resolvedName,
        };
      });
    },
    retry: 1,
    staleTime: 0,
    refetchInterval: 3000,
  });
}
