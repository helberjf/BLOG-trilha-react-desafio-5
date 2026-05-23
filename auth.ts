import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { loginSchema } from "@/lib/auth/validation";
import { getPrisma, hasDatabaseUrl } from "@/lib/prisma";

const authConfig: NextAuthConfig = {
  adapter: hasDatabaseUrl() ? PrismaAdapter(getPrisma()) : undefined,
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60
  },
  pages: {
    signIn: "/login"
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success || !hasDatabaseUrl()) return null;

        const prisma = getPrisma();
        const user = await prisma.user.findFirst({
          where: {
            email: {
              equals: parsed.data.email,
              mode: "insensitive"
            }
          }
        });

        if (!user?.email || !user.password) return null;

        const passwordMatch = await bcrypt.compare(parsed.data.password, user.password);
        if (!passwordMatch) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          cnpj: user.cnpj
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role ?? "COURIER";
        token.cnpj = user.cnpj ?? null;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "BUSINESS" | "COURIER";
        session.user.cnpj = (token.cnpj as string | null) ?? null;
      }

      return session;
    }
  }
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
