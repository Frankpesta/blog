"use client";

import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import { useCallback, useState, useEffect, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuthStore } from "@/stores/useAuthStore";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

function useConvexAuthFromCookie() {
  const [isLoading, setIsLoading] = useState(true);
  const fetchAccessToken = useCallback(async () => {
    const res = await fetch("/api/auth/token", { credentials: "include" });
    const data = (await res.json()) as { token: string | null };
    return data.token;
  }, []);
  useEffect(() => {
    void fetchAccessToken().finally(() => setIsLoading(false));
  }, [fetchAccessToken]);
  return {
    isLoading,
    isAuthenticated: false,
    fetchAccessToken,
  };
}

export function AuthHydrator({ children }: { children: ReactNode }) {
  const hydrate = useAuthStore((s) => s.hydrate);
  useEffect(() => {
    void hydrate();
  }, [hydrate]);
  return children;
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ConvexProviderWithAuth client={convex} useAuth={useConvexAuthFromCookie}>
      <TooltipProvider delayDuration={200}>
        <AuthHydrator>{children}</AuthHydrator>
        <Toaster position="top-right" richColors closeButton />
      </TooltipProvider>
    </ConvexProviderWithAuth>
  );
}
