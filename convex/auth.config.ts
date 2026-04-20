import type { AuthConfig } from "convex/server";

/**
 * Every distinct JWT `iss` you mint (see `signAccessToken` + `getRequestIssuer`) needs a
 * matching provider here, with the same `jwks` / `CONVEX_AUTH_JWKS_DATA_URI`.
 */
const siteUrl = (
  process.env.SITE_URL ??
  process.env.NEXT_PUBLIC_SITE_URL ??
  "http://localhost:3000"
).replace(/\/$/, "");

const dataUri = process.env.CONVEX_AUTH_JWKS_DATA_URI?.trim();

const jwks =
  dataUri && dataUri.length > 0 ? dataUri : `${siteUrl}/api/auth/jwks`;

const issuers = Array.from(
  new Set([siteUrl, "http://localhost:3000", "http://127.0.0.1:3000"]),
);

export default {
  providers: issuers.map((issuer) => ({
    type: "customJwt" as const,
    issuer,
    jwks,
    algorithm: "RS256" as const,
    applicationID: "benjafamily-blog",
  })),
} satisfies AuthConfig;
