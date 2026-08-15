import { create } from 'zustand';

interface UiState {
  sidebarCollapsed: boolean;
  activeModal: string | null;
  filters: Record<string, unknown>;
  toggleSidebar: () => void;
  setActiveModal: (modal: string | null) => void;
  setFilters: (filters: Record<string, unknown>) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  activeModal: null,
  filters: {},
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setActiveModal: (modal) => set({ activeModal: modal }),
  setFilters: (filters) => set({ filters }),
}));
