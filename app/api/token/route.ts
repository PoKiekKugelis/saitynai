import { getToken } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const tokenString = req.cookies.get("next-auth.session-token")?.value;

  const token = await getToken({ req })

  if (token && tokenString) {
    return NextResponse.json({
      // decoded: token,
      sessionToken: tokenString
    }, { status: 200 })
  } else {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }
}
