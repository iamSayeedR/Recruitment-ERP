import { useEffect } from 'react';
import { useCurrentUser } from './useCurrentUser';
import { useTenantStore } from '@/stores/tenant-store';

export const useTenantBranding = () => {
  const { data, isLoading } = useCurrentUser();
  const { setTenantBranding, applyBranding } = useTenantStore();

  useEffect(() => {
    if (data?.tenant) {
      setTenantBranding({
        tenantName: data.tenant.name,
        logoUrl: data.tenant.logoUrl || null,
        primaryColor: data.tenant.primaryColor || null,
        secondaryColor: data.tenant.secondaryColor || null,
      });
      applyBranding();
    }
  }, [data, setTenantBranding, applyBranding]);

  return { isLoading };
};
