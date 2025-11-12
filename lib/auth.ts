import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
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

export async function requireRole(allowedRoles: string[]) {
  const session = await getSession()

  if (!session || !session.user) {
    return NextResponse.json(
      { error: "Unauthorized - Please login" },
      { status: 401 }
    )
  }

  const userRole = session.user.role

  if (!allowedRoles.includes(userRole)) {
    return NextResponse.json(
      { error: "Forbidden - no permissions" },
      { status: 403 }
    )
  }

  return session
}
