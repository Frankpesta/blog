import type { AuthConfig } from "convex/server";

/**
 * Update `issuer` and `jwks` to your public site URL in production.
 * The Next app must sign JWTs with the same `iss` (see `lib/jwt.ts` and `SITE_URL` in `.env.local`).
 */
export default {
  providers: [
    {
      type: "customJwt",
      issuer: "http://localhost:3000",
      jwks: "http://localhost:3000/api/auth/jwks",
      algorithm: "RS256",
      applicationID: "benjafamily-blog",
    },
  ],
} satisfies AuthConfig;
