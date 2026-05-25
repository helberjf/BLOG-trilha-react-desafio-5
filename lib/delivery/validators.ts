import { z } from "zod";

import { currencyToCents, isValidCnpj, normalizeDigits } from "@/lib/delivery/format";

export const userRoleSchema = z.enum(["BUSINESS", "COURIER"]);

export const deliveryRequestSchema = z.object({
  title: z.string().trim().min(3, "Informe um titulo para o pedido."),
  city: z.string().trim().min(2, "Escolha uma cidade."),
  pickupAddress: z.string().trim().min(5, "Informe o local de retirada."),
  dropoffAddress: z.string().trim().min(5, "Informe o local de entrega."),
  scheduledDate: z.string().trim().min(1, "Informe a data."),
  scheduledTime: z.string().trim().regex(/^\d{2}:\d{2}$/, "Informe o horario no formato HH:mm."),
  deliveryValue: z
    .string()
    .trim()
    .refine(value => currencyToCents(value) > 0, "Informe um valor maior que zero."),
  estimatedMinutes: z
    .number()
    .int("Informe um tempo inteiro em minutos.")
    .min(1, "Informe o tempo estimado.")
    .max(1440, "O tempo estimado deve ser menor que 24 horas."),
  description: z.string().trim().min(3, "Descreva a entrega."),
  posterWhatsapp: z
    .string()
    .trim()
    .refine(value => normalizeDigits(value).length >= 10, "Informe um WhatsApp valido."),
  boxWidthCm: z.coerce.number().positive("Largura deve ser positiva.").optional().or(z.literal("")),
  boxHeightCm: z.coerce.number().positive("Altura deve ser positiva.").optional().or(z.literal("")),
  boxLengthCm: z.coerce.number().positive("Comprimento deve ser positivo.").optional().or(z.literal("")),
  boxWeightKg: z.coerce.number().positive("Peso deve ser positivo.").optional().or(z.literal(""))
});

export type DeliveryRequestInput = z.infer<typeof deliveryRequestSchema>;

export function assertValidBusinessCnpj(cnpj: string | null | undefined) {
  return Boolean(cnpj && isValidCnpj(cnpj));
}
