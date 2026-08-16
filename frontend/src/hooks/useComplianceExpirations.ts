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

const CANDIDATE_NAME_MAP: Record<string, string> = {
  'fae9a605-8c6c-4c7a-909b-72958e0a852e': 'John Doe',
  'b18a3e17-cab5-4bc7-87c7-f3467bb26b34': 'Amina Hassan',
  '1e439086-3708-4bb9-9202-ef83b7f1ce6c': 'Sayeed Rizwan',
  'c29b4f28-dbe6-5cd8-98d8-04578cc37c45': 'Sayeed Rizwan',
  '16f76d1b-87ac-4e16-8c74-e527e226c263': 'Sarah Conner',
};

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

      // Dynamic candidate name resolution
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
        const resolvedName = item.candidateName || dynamicMap.get(id) || CANDIDATE_NAME_MAP[id] || (id ? `Candidate (${id.slice(0, 8)})` : 'Candidate');
        return {
          ...item,
          candidateName: resolvedName,
        };
      });
    },
    retry: 1,
    staleTime: 0,
    refetchInterval: 3000, // Real-time 3-second live polling for compliance alerts
  });
}
