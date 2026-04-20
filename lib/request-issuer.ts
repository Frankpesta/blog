import { SITE_URL } from "@/lib/constants";

/**
 * Issuer for new JWTs must match the browser origin and a `customJwt` `issuer` in
 * `convex/auth.config.ts` (e.g. http://127.0.0.1:3000 vs http://localhost:3000).
 */
export function getRequestIssuer(request: Request): string {
  const fallback = SITE_URL.replace(/\/$/, "");
  try {
    const u = new URL(request.url);
    if (u.host) {
      return u.origin;
    }
  } catch {
    /* use headers */
  }
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) {
    return fallback;
  }
  const proto = (request.headers.get("x-forwarded-proto") ?? "http")
    .split(",")[0]
    .trim();
  return `${proto}://${host.split(",")[0].trim()}`;
}
