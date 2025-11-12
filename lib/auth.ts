import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function verifyJWT(token: string) {
  try {
    const secret = new TextEncoder().encode(
      process.env.NEXTAUTH_SECRET || "your-secret-key"
    );

    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function requireAuth(authHeader: string | null) {
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Unauthorized - No token provided" },
      { status: 401 }
    );
  }

  const token = authHeader.substring(7);
  const payload = await verifyJWT(token);

  if (!payload) {
    return NextResponse.json(
      { error: "Unauthorized - Invalid token" },
      { status: 401 }
    );
  }

  return payload;
}

export async function requireRole(authHeader: string | null, allowedRoles: string[]) {
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Unauthorized - No token provided" },
      { status: 401 }
    );
  }

  const token = authHeader.substring(7);
  const payload = await verifyJWT(token);

  if (!payload) {
    return NextResponse.json(
      { error: "Unauthorized - Invalid token" },
      { status: 401 }
    );
  }

  const userRole = payload.role as string;

  if (!allowedRoles.includes(userRole)) {
    return NextResponse.json(
      { error: "Forbidden - no permissions" },
      { status: 403 }
    );
  }

  return payload;
}
