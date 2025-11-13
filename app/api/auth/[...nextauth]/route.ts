import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import { SignJWT, jwtVerify } from 'jose'

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

        return {
          id: user.id.toString(),
          email: user.email,
          role: user.role
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60,
  },
  jwt: {
    async encode({ token, secret, maxAge }) {
      if (!token) return "";

      const now = Math.floor(Date.now() / 1000);
      const expiry = now + (maxAge ?? 3600);

      const cleanToken = Object.fromEntries(
        Object.entries(token).filter(([_, v]) => v !== undefined)
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
        return payload as any;
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
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
