import { SITE_URL } from "@/lib/constants";

function normalize(origin: string): string {
  return origin.replace(/\/$/, "");
}

/**
 * JWT `iss` must match Convex `customJwt` `issuer` exactly (including https vs http).
 *
 * On Vercel / reverse proxies, `request.url` can have the wrong scheme or host.
 * Prefer `SITE_URL` / `NEXT_PUBLIC_SITE_URL` when the incoming host matches — that
 * keeps signing aligned with Convex env (`SITE_URL`).
 */
export function getRequestIssuer(request: Request): string {
  const envIssuer = normalize(
    process.env.SITE_URL ??
      process.env.NEXT_PUBLIC_SITE_URL ??
      SITE_URL,
  );

  const xfHost =
    request.headers.get("x-forwarded-host")?.split(",")[0].trim() ??
    request.headers.get("host")?.split(",")[0].trim();

  const xfProto =
    request.headers.get("x-forwarded-proto")?.split(",")[0].trim() ?? "";

  // When env matches the request host, always use env (correct https + canonical host)
  if (xfHost && envIssuer.startsWith("http")) {
    try {
      const envHost = new URL(envIssuer).host;
      if (envHost === xfHost) {
        return envIssuer;
      }
    } catch {
      /* ignore */
    }
  }

  // Proxy-friendly public URL (production)
  if (xfHost) {
    const isLocal =
      xfHost.startsWith("localhost") ||
      xfHost.startsWith("127.0.0.1") ||
      xfHost === "[::1]";
    const scheme =
      isLocal ? "http" : (xfProto || "https");
    return `${scheme}://${xfHost}`;
  }

  // Fallback: URL from the request (dev servers)
  try {
    const u = new URL(request.url);
    if (u.host) {
      return u.origin;
    }
  } catch {
    /* ignore */
  }

  return envIssuer;
}
