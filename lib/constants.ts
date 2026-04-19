export const AUTH_COOKIE = "bf_auth_token";

/** Must match `issuer` in `convex/auth.config.ts` and JWT signing in `lib/jwt.ts`. */
export const SITE_URL =
  process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const BRAND = {
  name: "BenjaFamily Labs",
  tagline: "Financial education & crypto insights",
  colors: {
    navy: "#0A0F1E",
    gold: "#F5A623",
    emerald: "#00D4A1",
    danger: "#E53E3E",
    surface: "#111827",
    elevated: "#1F2937",
    text: "#F9FAFB",
    muted: "#9CA3AF",
  },
} as const;
