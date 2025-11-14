import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SignJWT } from "jose";

export async function POST(req: NextRequest) {
  try {
    const { refreshToken } = await req.json();

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        refreshToken,
        refreshTokenExpiration: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired refresh token" },
        { status: 401 }
      );
    }

    const now = Math.floor(Date.now() / 1000);
    const accessToken = await new SignJWT({
      sub: user.id.toString(),
      email: user.email,
      id: user.id.toString(),
      role: user.role,
      iat: now,
      exp: now + 15 * 60,
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .sign(new TextEncoder().encode(process.env.NEXTAUTH_SECRET!));

    return NextResponse.json({
      accessToken,
      expiresIn: 900,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to refresh token" },
      { status: 500 }
    );
  }
}
