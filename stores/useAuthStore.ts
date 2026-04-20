import { create } from "zustand";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  avatarUrl?: string;
  bio?: string;
  bookmarks?: string[];
};

type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
  hydrate: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: (user) =>
    set({ user, isAuthenticated: true, isLoading: false }),
  logout: () =>
    set({ user: null, isAuthenticated: false, isLoading: false }),
  hydrate: async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      const data = (await res.json()) as { user: AuthUser | null };
      if (data.user) {
        set({
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      set((state) => ({
        ...state,
        isLoading: false,
      }));
    }
  },
}));
