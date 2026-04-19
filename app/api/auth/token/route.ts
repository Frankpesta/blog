import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/constants";

/** Returns the JWT from the httpOnly cookie for ConvexProviderWithAuth.fetchAccessToken */
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value ?? null;
  return NextResponse.json({ token });
}
