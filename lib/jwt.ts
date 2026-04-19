import * as jose from "jose";
import { SITE_URL } from "@/lib/constants";

const AUDIENCE = "benjafamily-blog";

export type JwtPayload = {
  sub: string;
  email: string;
  name: string;
  role: "admin" | "user";
};

export async function signAccessToken(payload: JwtPayload): Promise<string> {
  const pem = process.env.JWT_PRIVATE_KEY;
  if (!pem) {
    throw new Error("JWT_PRIVATE_KEY is not configured");
  }
  const key = await jose.importPKCS8(pem, "RS256");
  return await new jose.SignJWT({
    email: payload.email,
    name: payload.name,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "RS256" })
    .setSubject(payload.sub)
    .setIssuer(SITE_URL)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

export async function verifyAccessToken(token: string): Promise<jose.JWTPayload> {
  const pem = process.env.JWT_PUBLIC_KEY;
  if (!pem) {
    throw new Error("JWT_PUBLIC_KEY is not configured");
  }
  const key = await jose.importSPKI(pem, "RS256");
  const { payload } = await jose.jwtVerify(token, key, {
    issuer: SITE_URL,
    audience: AUDIENCE,
  });
  return payload;
}

export async function exportJwksJson() {
  const pem = process.env.JWT_PUBLIC_KEY;
  if (!pem) {
    throw new Error("JWT_PUBLIC_KEY is not configured");
  }
  const key = await jose.importSPKI(pem, "RS256");
  const jwk = await jose.exportJWK(key);
  jwk.kid = "bf-labs-1";
  jwk.use = "sig";
  jwk.alg = "RS256";
  return { keys: [jwk] };
}
