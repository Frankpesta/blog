"use client";

import { useConvexAuth } from "convex/react";

/**
 * True only after Convex finishes `setAuth` **and** the backend accepts the JWT (you have an
 * identity). If this were only `!isLoading`, logged-out visitors and rejected tokens would still
 * run admin queries and spam `Unauthorized` in Convex logs.
 *
 * Admin `useQuery` calls should use `"skip"` until this is true.
 */
export function useConvexSessionReady(): boolean {
  const { isLoading, isAuthenticated } = useConvexAuth();
  return !isLoading && isAuthenticated;
}
