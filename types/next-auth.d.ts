import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "BUSINESS" | "COURIER";
      cnpj?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role?: "BUSINESS" | "COURIER";
    cnpj?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "BUSINESS" | "COURIER";
    cnpj?: string | null;
  }
}
