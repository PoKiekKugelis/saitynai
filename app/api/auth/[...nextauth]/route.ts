import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import { SignJWT, jwtVerify } from 'jose'
import type { JWT } from "next-auth/jwt"
import crypto from 'crypto'
import { cookies } from "next/headers";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          throw new Error("Invalid credentials")
        }

        const isValid = credentials.password === user.password;

        if (!isValid) {
          throw new Error("Invalid credentials")
        }

        const refreshToken = crypto.randomBytes(32).toString('hex');
        const refreshTokenExpiration = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await prisma.user.update({
          where: { id: user.id },
          data: {
            refreshToken,
            refreshTokenExpiration
          }
        });
        return {
          id: user.id.toString(),
          email: user.email,
          role: user.role,
          refreshToken,
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 15 * 60,
  },
  jwt: {
    async encode({ token, secret, maxAge }) {
      if (!token) return "";

      const now = Math.floor(Date.now() / 1000);
      const expiry = now + (maxAge ?? 60);

      const cleanToken = Object.fromEntries(
        Object.entries(token).filter(([key, v]) => key !== 'refreshToken' && v !== undefined)
      );

      const payload = {
        ...cleanToken,
        iat: (token.iat as number) ?? now,
        exp: (token.exp as number) ?? expiry,
      };

      return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256", typ: "JWT" })
        .sign(new TextEncoder().encode(secret as string));
    },
    async decode({ token, secret }) {
      if (!token) return null;

      try {
        const { payload } = await jwtVerify(
          token,
          new TextEncoder().encode(secret as string),
          { algorithms: ["HS256"] }
        );
        return payload as JWT;
      } catch {
        return null;
      }
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.refreshToken = user.refreshToken
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.refreshToken = token.refreshToken
      }
      return session
    }
  },
  events: {
    async signIn({ user }) {
      if (user.refreshToken) {
        (await cookies()).set('refreshToken', user.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 60 * 60 * 24 * 7,
          path: '/'
        });
      }
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
