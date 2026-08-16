import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface DashboardSummary {
  requisitions: {
    DRAFT: number;
    APPROVED: number;
    PUBLISHED: number;
    FILLED: number;
  };
  candidates: {
    APPLIED: number;
    INTERVIEWED: number;
    SELECTED: number;
    MOBILIZED: number;
  };
  compliance: {
    NOT_STARTED: number;
    SUBMITTED: number;
    VERIFIED: number;
    EXPIRED: number;
  };
  slaMetrics: Array<{
    corridor: string;
    averageDaysToMobilize: number;
  }>;
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async (): Promise<DashboardSummary> => {
      const requisitionsCount: Record<'DRAFT' | 'APPROVED' | 'PUBLISHED' | 'FILLED', number> = { DRAFT: 0, APPROVED: 0, PUBLISHED: 0, FILLED: 0 };
      try {
        const reqRes = await apiClient<any>('/requisitions?size=100');
        const list = Array.isArray(reqRes) ? reqRes : reqRes?.content || reqRes?.data || [];
        if (Array.isArray(list)) {
          list.forEach(r => {
            const st = (r.status || 'OPEN').toUpperCase();
            if (st === 'DRAFT') requisitionsCount.DRAFT += 1;
            else if (st === 'APPROVED') requisitionsCount.APPROVED += 1;
            else if (st === 'FILLED' || st === 'CLOSED') requisitionsCount.FILLED += 1;
            else requisitionsCount.PUBLISHED += 1;
          });
        }
      } catch {}

      const candidatesCount: Record<'APPLIED' | 'INTERVIEWED' | 'SELECTED' | 'MOBILIZED', number> = { APPLIED: 0, INTERVIEWED: 0, SELECTED: 0, MOBILIZED: 0 };
      try {
        const appRes = await apiClient<any>('/candidates/applications');
        const appList = Array.isArray(appRes) ? appRes : appRes?.content || appRes?.data || [];
        if (Array.isArray(appList)) {
          appList.forEach(a => {
            const st = (a.status || 'APPLIED').toUpperCase();
            if (st === 'INTERVIEWED' || st === 'SCREENING' || st === 'SHORTLISTED') candidatesCount.INTERVIEWED += 1;
            else if (st === 'SELECTED' || st === 'OFFER_ACCEPTED') candidatesCount.SELECTED += 1;
            else if (st === 'MOBILIZED' || st === 'PLACED') candidatesCount.MOBILIZED += 1;
            else candidatesCount.APPLIED += 1;
          });
        }
      } catch {}

      const complianceCount: Record<'NOT_STARTED' | 'SUBMITTED' | 'VERIFIED' | 'EXPIRED', number> = { NOT_STARTED: 0, SUBMITTED: 0, VERIFIED: 0, EXPIRED: 0 };
      try {
        const compRes = await apiClient<any>('/compliance/expirations?tenantId=tenant-acme');
        const compList = Array.isArray(compRes) ? compRes : compRes?.content || compRes?.data || [];
        if (Array.isArray(compList)) {
          compList.forEach(item => {
            const st = (item.status || 'NOT_STARTED').toUpperCase();
            if (st === 'VERIFIED') complianceCount.VERIFIED += 1;
            else if (st === 'SUBMITTED' || st === 'IN_PROGRESS') complianceCount.SUBMITTED += 1;
            else if (st === 'EXPIRED') complianceCount.EXPIRED += 1;
            else complianceCount.NOT_STARTED += 1;
          });
        }
      } catch {}

      return {
        requisitions: requisitionsCount,
        candidates: candidatesCount,
        compliance: complianceCount,
        slaMetrics: [],
      };
    },
    retry: 1,
    staleTime: 0,
    refetchInterval: 3000,
  });
}
