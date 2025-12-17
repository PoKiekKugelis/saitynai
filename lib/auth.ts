import { getServerSession } from "next-auth"
import { getToken } from "next-auth/jwt"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse, NextRequest } from "next/server"
import { jwtVerify } from "jose"
import "next-auth"

export async function getSession() {
  return await getServerSession(authOptions)
}

export async function requireAuth() {
  const session = await getSession()

  if (!session || !session.user) {
    return NextResponse.json(
      { error: "Unauthorized - Please login" },
      { status: 401 }
    )
  }

  return session
}

export async function decodeToken(req: NextRequest) {
  const token = await getToken({ req, raw: true, secret: process.env.NEXTAUTH_SECRET })

  if (!token) return null

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.NEXTAUTH_SECRET!),
      { algorithms: ["HS256"] }
    )
    return payload
  } catch {
    return null
  }
}

export async function requireRole(req: NextRequest, allowedRoles: string[]) {
  const token = await decodeToken(req)

  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized - Please login" },
      { status: 401 }
    )
  }

  const userRole = token.role as string

  if (!userRole || !allowedRoles.includes(userRole)) {
    return NextResponse.json(
      { error: "Forbidden - no permissions" },
      { status: 403 }
    )
  }

  return {
    user: {
      id: token.id as string,
      email: token.email as string,
      role: userRole,
      refreshToken: token.refreshToken
    },
  }
}
