/**
 * Prints JWT_PRIVATE_KEY and JWKS in the same format as `npx @convex-dev/auth`
 * (see @convex-dev/auth/src/cli/generateKeys.ts).
 *
 * Use when Convex logs: InvalidCharacterError: Failed to execute 'atob': Invalid byte 92
 * That usually means JWT_PRIVATE_KEY in the dashboard starts with "\\" or was pasted from broken JSON.
 *
 * 1. Run: npm run convex:auth-keys
 * 2. Convex Dashboard → your deployment → Settings → Environment Variables
 * 3. Replace JWT_PRIVATE_KEY and JWKS with the printed values (paste as plain text, no extra quotes).
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { exportJWK, exportPKCS8, generateKeyPair } from "jose";

const keys = await generateKeyPair("RS256", { extractable: true });
const privateKey = await exportPKCS8(keys.privateKey);
const publicKey = await exportJWK(keys.publicKey);
const jwks = JSON.stringify({ keys: [{ use: "sig", ...publicKey }] });
const JWT_PRIVATE_KEY = `${privateKey.trimEnd().replace(/\n/g, " ")}`;

const __dirname = dirname(fileURLToPath(import.meta.url));
writeFileSync(
  join(__dirname, ".convex-auth-keys.json"),
  JSON.stringify({ JWT_PRIVATE_KEY, JWKS: jwks }, null, 2),
  "utf8",
);

console.log(`
=== Convex Auth keys (paste into Convex Dashboard → Environment Variables) ===

Do not wrap in JSON strings. No leading backslash. One line each.

JWT_PRIVATE_KEY:
`);
console.log(JWT_PRIVATE_KEY);
console.log(`
JWKS:
`);
console.log(jwks);
console.log(`
Also ensure CONVEX_SITE_URL matches your app origin (e.g. http://localhost:3000).

(Machine-readable copy: scripts/.convex-auth-keys.json)
`);
