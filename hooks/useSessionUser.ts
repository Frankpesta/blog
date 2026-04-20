"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

/**
 * Current app user profile (from Convex) when Convex Auth has an active session.
 */
export function useSessionUser() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const profile = useQuery(
    api.users.getCurrent,
    isAuthenticated ? {} : "skip",
  );

  const loading =
    isLoading || (isAuthenticated && profile === undefined);

  return {
    isLoading: loading,
    isAuthenticated,
    user: profile ?? null,
  };
}
