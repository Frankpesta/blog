import { create } from "zustand";

type UIState = {
  isSearchOpen: boolean;
  isMobileMenuOpen: boolean;
  toggleSearch: () => void;
  toggleMobileMenu: () => void;
  setSearchOpen: (open: boolean) => void;
};

export const useUIStore = create<UIState>((set) => ({
  isSearchOpen: false,
  isMobileMenuOpen: false,
  toggleSearch: () =>
    set((s) => ({ isSearchOpen: !s.isSearchOpen })),
  toggleMobileMenu: () =>
    set((s) => ({ isMobileMenuOpen: !s.isMobileMenuOpen })),
  setSearchOpen: (open) => set({ isSearchOpen: open }),
}));
