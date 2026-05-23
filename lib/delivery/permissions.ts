import { isValidCnpj } from "@/lib/delivery/format";

export type DeliveryActor =
  | {
      role?: "BUSINESS" | "COURIER" | null;
      cnpj?: string | null;
    }
  | null
  | undefined;

export function canCreateDeliveryRequest(actor: DeliveryActor) {
  return actor?.role === "BUSINESS" && Boolean(actor.cnpj && isValidCnpj(actor.cnpj));
}
