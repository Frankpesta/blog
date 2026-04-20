import type { AuthConfig } from "convex/server";

/**
 * Convex Auth uses its own JWT issuer (`CONVEX_SITE_URL` / deployment URL).
 * Run `npx convex dev` after changing auth configuration.
 */
const domain = (
  process.env.CONVEX_SITE_URL ??
  process.env.SITE_URL ??
  process.env.NEXT_PUBLIC_SITE_URL ??
  "http://localhost:3000"
).replace(/\/$/, "");

export default {
  providers: [
    {
      domain,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
