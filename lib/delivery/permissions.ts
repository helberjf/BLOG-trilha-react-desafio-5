import { isSubscriptionActiveForPublishing, type CompanySubscriptionStatus } from "@/lib/billing/plans";
import { isValidCnpj, isValidCpf, normalizeDigits } from "@/lib/delivery/format";

export type DeliveryActor =
  | {
      role?: "BUSINESS" | "COURIER" | null;
      cnpj?: string | null;
      cpf?: string | null;
      companyPostalCode?: string | null;
      subscriptionStatus?: CompanySubscriptionStatus | null;
    }
  | null
  | undefined;

export function canCreateDeliveryRequest(actor: DeliveryActor) {
  return (
    actor?.role === "BUSINESS" &&
    Boolean(actor.cnpj && isValidCnpj(actor.cnpj)) &&
    Boolean(actor.cpf && isValidCpf(actor.cpf)) &&
    normalizeDigits(actor.companyPostalCode).length === 8 &&
    isSubscriptionActiveForPublishing(actor.subscriptionStatus)
  );
}
