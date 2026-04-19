import { NextResponse } from "next/server";
import { exportJwksJson } from "@/lib/jwt";

export async function GET() {
  try {
    const jwks = await exportJwksJson();
    return NextResponse.json(jwks);
  } catch {
    return NextResponse.json({ error: "JWKS unavailable" }, { status: 500 });
  }
}
