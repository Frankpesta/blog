#!/usr/bin/env node
/**
 * Prints CONVEX_AUTH_JWKS_DATA_URI for Convex Dashboard (paste as env var).
 * Convex cannot load JWKS from localhost; embed JWKS via data URI per Convex docs.
 *
 * Usage: npm run convex:jwks-uri
 * Requires JWT_PUBLIC_KEY in env or .env.local (same PEM as Next uses).
 */

import { createPublicKey } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function pemFromDotEnvLocal() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    const m = raw.match(/JWT_PUBLIC_KEY=\s*"([\s\S]*?)"\s*(?:\r?\n|$)/);
    if (m) {
      return m[1].replace(/\\n/g, "\n");
    }
  } catch {
    /* no file */
  }
  return null;
}

const pemRaw =
  process.env.JWT_PUBLIC_KEY?.trim() ||
  pemFromDotEnvLocal();

if (!pemRaw || pemRaw.length < 80) {
  console.error(
    "Set JWT_PUBLIC_KEY in the environment or add JWT_PUBLIC_KEY to .env.local",
  );
  process.exit(1);
}

const pem = pemRaw.includes("\\n") ? pemRaw.replace(/\\n/g, "\n") : pemRaw;

const keyObject = createPublicKey(pem);
const jwk = keyObject.export({ format: "jwk" });
if (jwk.kty !== "RSA") {
  console.error("Expected RSA public key");
  process.exit(1);
}

const jwks = {
  keys: [
    {
      kty: jwk.kty,
      n: jwk.n,
      e: jwk.e,
      kid: "bf-labs-1",
      use: "sig",
      alg: "RS256",
    },
  ],
};

const body = JSON.stringify(jwks);
const dataUri = `data:text/plain;charset=utf-8;base64,${Buffer.from(body, "utf8").toString("base64")}`;

console.log("");
console.log("Add this in Convex → Settings → Environment variables:");
console.log("");
console.log(`CONVEX_AUTH_JWKS_DATA_URI=${dataUri}`);
console.log("");
console.log("Also set SITE_URL to match JWT issuer (e.g. http://localhost:3000).");
console.log("Then restart: npx convex dev");
console.log("");
