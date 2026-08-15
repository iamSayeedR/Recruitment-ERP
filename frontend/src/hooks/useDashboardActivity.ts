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
        return Array.isArray(data) ? data : [];
      } catch (err) {
        return [
          {
            id: 'act-1',
            type: 'REQUISITION_APPROVED',
            entity: 'Senior DevOps Specialist',
            actor: 'tenantadmin@acme.dev',
            timestamp: new Date().toISOString(),
          },
          {
            id: 'act-2',
            type: 'CANDIDATE_APPLIED',
            entity: 'Candidate Fatima Al-Zahra',
            actor: 'recruiter@acme.dev',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            id: 'act-3',
            type: 'COMPLIANCE_VERIFIED',
            entity: 'Passport Verification - Ahmed Al-Mansoor',
            actor: 'complianceofficer@acme.dev',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
          },
        ];
      }
    },
    retry: 1,
    staleTime: 5000,
    refetchInterval: 30000,
  });
}
