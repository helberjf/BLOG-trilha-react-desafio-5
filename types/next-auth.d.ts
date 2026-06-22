import type { DefaultSession } from "next-auth";
import type { CompanyPlan, CompanySubscriptionStatus } from "@/lib/billing/plans";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "BUSINESS" | "COURIER";
      cnpj?: string | null;
      cpf?: string | null;
      companyPostalCode?: string | null;
      companyPlan?: CompanyPlan | null;
      subscriptionStatus?: CompanySubscriptionStatus | null;
    } & DefaultSession["user"];
  }

  interface User {
    role?: "BUSINESS" | "COURIER";
    cnpj?: string | null;
    cpf?: string | null;
    companyPostalCode?: string | null;
    companyPlan?: CompanyPlan | null;
    subscriptionStatus?: CompanySubscriptionStatus | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "BUSINESS" | "COURIER";
    cnpj?: string | null;
    cpf?: string | null;
    companyPostalCode?: string | null;
    companyPlan?: CompanyPlan | null;
    subscriptionStatus?: CompanySubscriptionStatus | null;
  }
}
