import { create } from "zustand";

export type ReactionCounts = {
  like: number;
  love: number;
  fire: number;
  rocket: number;
};

type PostState = {
  reactions: ReactionCounts;
  userReaction: "like" | "love" | "fire" | "rocket" | null;
  bookmarked: boolean;
  setReactionState: (
    reactions: ReactionCounts,
    mine: "like" | "love" | "fire" | "rocket" | null,
  ) => void;
  setBookmarked: (v: boolean) => void;
};

export const usePostStore = create<PostState>((set) => ({
  reactions: { like: 0, love: 0, fire: 0, rocket: 0 },
  userReaction: null,
  bookmarked: false,
  setReactionState: (reactions, mine) =>
    set({ reactions, userReaction: mine }),
  setBookmarked: (bookmarked) => set({ bookmarked }),
}));
