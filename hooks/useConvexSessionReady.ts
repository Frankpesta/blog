"use client";

import { useConvexAuth } from "convex/react";

/**
 * False while Convex is still attaching the JWT (`setAuth`). Admin `useQuery` calls should
 * use `"skip"` until this is true so queries never run unauthenticated and cache a failure.
 */
export function useConvexSessionReady(): boolean {
  const { isLoading } = useConvexAuth();
  return !isLoading;
}
