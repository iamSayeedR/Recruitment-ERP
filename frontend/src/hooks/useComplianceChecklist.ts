import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface ComplianceRule {
  id: string;
  tenantId: string;
  documentType: string;
  isRequired: boolean;
  validityPeriodDays?: number;
}

export interface ChecklistItem {
  id: string;
  ruleId: string;
  rule?: ComplianceRule;
  status: 'NOT_STARTED' | 'SUBMITTED' | 'IN_PROGRESS' | 'VERIFIED' | 'EXPIRED' | 'WAIVED' | string;
  documentReference?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  expiryDate?: string;
  notes?: string;
}

export interface ComplianceChecklist {
  id: string;
  tenantId: string;
  candidateApplicationId: string;
  items: ChecklistItem[];
}

export function useComplianceChecklist(candidateId: string) {
  return useQuery({
    queryKey: ['compliance-checklist', candidateId],
    queryFn: async (): Promise<ComplianceChecklist> => {
      return apiClient<ComplianceChecklist>(`/compliance/checklists/candidate/${candidateId}`);
    },
    enabled: !!candidateId,
    staleTime: 0,
    refetchInterval: 3000,
  });
}

export function useAddComplianceItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ candidateId, documentType, status }: { candidateId: string; documentType: string; status: string }) => {
      return apiClient<ComplianceChecklist>(`/compliance/checklists/candidate/${candidateId}/items`, {
        method: 'POST',
        body: JSON.stringify({ documentType, status }),
      });
    },
    onSuccess: (_, { candidateId }) => {
      queryClient.invalidateQueries({ queryKey: ['compliance-checklist', candidateId] });
      queryClient.invalidateQueries({ queryKey: ['compliance-checklist'] });
      queryClient.invalidateQueries({ queryKey: ['compliance-expirations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.refetchQueries({ queryKey: ['compliance-expirations'] });
      queryClient.refetchQueries({ queryKey: ['dashboard-summary'] });
    },
  });
}

export function useUpdateComplianceItemStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ checklistId, itemId, status, candidateId }: { checklistId: string; itemId: string; status: string; candidateId: string }) => {
      return apiClient<ComplianceChecklist>(`/compliance/checklists/${checklistId}/items/${itemId}/status?status=${status}`, {
        method: 'PUT',
      });
    },
    onSuccess: (_, { candidateId }) => {
      queryClient.invalidateQueries({ queryKey: ['compliance-checklist', candidateId] });
      queryClient.invalidateQueries({ queryKey: ['compliance-checklist'] });
      queryClient.invalidateQueries({ queryKey: ['compliance-expirations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.refetchQueries({ queryKey: ['compliance-expirations'] });
      queryClient.refetchQueries({ queryKey: ['dashboard-summary'] });
    },
  });
}

export function useVerifyChecklistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ checklistId, itemId }: { checklistId: string; itemId: string }) => {
      return apiClient<ComplianceChecklist>(`/compliance/checklists/${checklistId}/items/${itemId}/verify`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-checklist'] });
      queryClient.invalidateQueries({ queryKey: ['compliance-expirations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.refetchQueries({ queryKey: ['compliance-expirations'] });
      queryClient.refetchQueries({ queryKey: ['dashboard-summary'] });
    },
  });
}
