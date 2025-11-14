import { getToken } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server"
import { decodeToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {

  // const refreshToken = await req.cookies.get("refreshToken")?.value;
  const token = await getToken({ req, raw: true });
  const decodedToken = await decodeToken(req);

  if (token) {
    return NextResponse.json({
      decodedToken: decodedToken,
      accessToken: token
    }, { status: 200 })
  } else {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }
}
