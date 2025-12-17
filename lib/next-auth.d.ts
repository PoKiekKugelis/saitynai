import NextAuth from "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    email: string
    role: string
    refreshToken?: string
  }

  interface Session {
    user: {
      id: string
      email: string
      role: string
    }
    refreshToken?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    refreshToken?: string
  }
}
