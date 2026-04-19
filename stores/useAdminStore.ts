import { create } from "zustand";

type AdminState = {
  postStatusFilter: "all" | "draft" | "published" | "scheduled";
  setPostStatusFilter: (
    f: AdminState["postStatusFilter"],
  ) => void;
};

export const useAdminStore = create<AdminState>((set) => ({
  postStatusFilter: "all",
  setPostStatusFilter: (postStatusFilter) => set({ postStatusFilter }),
}));
