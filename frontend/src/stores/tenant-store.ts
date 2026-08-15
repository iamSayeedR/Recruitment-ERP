import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface TenantState {
  tenantName: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  setTenantBranding: (data: Partial<TenantState>) => void;
  applyBranding: () => void;
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set, get) => ({
      tenantName: 'Recruitment ERP',
      logoUrl: null,
      primaryColor: '#000000',
      secondaryColor: '#64748B',
      setTenantBranding: (data) => {
        set(data);
        const { primaryColor, secondaryColor } = get();
        if (typeof document !== 'undefined') {
          if (primaryColor) {
            document.documentElement.style.setProperty('--color-primary', primaryColor);
            document.documentElement.style.setProperty('--primary', primaryColor);
            document.documentElement.style.setProperty('--primary-color', primaryColor);
            document.documentElement.style.setProperty('--accent', primaryColor);
          }
          if (secondaryColor) {
            document.documentElement.style.setProperty('--color-secondary', secondaryColor);
            document.documentElement.style.setProperty('--secondary', secondaryColor);
            document.documentElement.style.setProperty('--secondary-color', secondaryColor);
          }
        }
      },
      applyBranding: () => {
        const { primaryColor, secondaryColor } = get();
        if (typeof document !== 'undefined') {
          if (primaryColor) {
            document.documentElement.style.setProperty('--color-primary', primaryColor);
            document.documentElement.style.setProperty('--primary', primaryColor);
            document.documentElement.style.setProperty('--primary-color', primaryColor);
            document.documentElement.style.setProperty('--accent', primaryColor);
          }
          if (secondaryColor) {
            document.documentElement.style.setProperty('--color-secondary', secondaryColor);
            document.documentElement.style.setProperty('--secondary', secondaryColor);
            document.documentElement.style.setProperty('--secondary-color', secondaryColor);
          }
        }
      },
    }),
    {
      name: 'erp_tenant_branding_v2',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
