import { z } from "zod";

import { currencyToCents, isValidCnpj, normalizeDigits } from "@/lib/delivery/format";
import { resolveCityCoordinates, type Coordinates } from "@/lib/delivery/location";

export const userRoleSchema = z.enum(["BUSINESS", "COURIER"]);

function optionalCoordinateSchema(min: number, max: number, message: string) {
  return z.preprocess(
    value => {
      if (value === "" || value === null || value === undefined) return undefined;
      return Number(value);
    },
    z.number().min(min, message).max(max, message).optional()
  );
}

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
  pickupLatitude: optionalCoordinateSchema(-90, 90, "Latitude de retirada invalida."),
  pickupLongitude: optionalCoordinateSchema(-180, 180, "Longitude de retirada invalida."),
  dropoffLatitude: optionalCoordinateSchema(-90, 90, "Latitude de entrega invalida."),
  dropoffLongitude: optionalCoordinateSchema(-180, 180, "Longitude de entrega invalida."),
  boxWidthCm: z.coerce.number().positive("Largura deve ser positiva.").optional().or(z.literal("")),
  boxHeightCm: z.coerce.number().positive("Altura deve ser positiva.").optional().or(z.literal("")),
  boxLengthCm: z.coerce.number().positive("Comprimento deve ser positivo.").optional().or(z.literal("")),
  boxWeightKg: z.coerce.number().positive("Peso deve ser positivo.").optional().or(z.literal(""))
});

export const deliveryReviewSchema = z.object({
  rating: z.coerce
    .number()
    .int("Informe uma nota inteira.")
    .min(1, "A nota minima e 1.")
    .max(5, "A nota maxima e 5."),
  comment: z
    .string()
    .trim()
    .max(280, "O comentario deve ter no maximo 280 caracteres.")
    .optional()
    .transform(value => (value && value.length > 0 ? value : undefined))
});

export type DeliveryRequestFormInput = z.input<typeof deliveryRequestSchema>;
export type DeliveryRequestInput = z.output<typeof deliveryRequestSchema>;
export type DeliveryReviewInput = z.output<typeof deliveryReviewSchema>;

function coordinatesFromPair(
  latitude: number | undefined,
  longitude: number | undefined
): Coordinates | null {
  if (latitude === undefined || longitude === undefined) return null;
  return { latitude, longitude };
}

export function resolveDeliveryRequestCoordinates(data: DeliveryRequestInput) {
  return {
    pickupCoordinates:
      coordinatesFromPair(data.pickupLatitude, data.pickupLongitude) ?? resolveCityCoordinates(data.city),
    dropoffCoordinates: coordinatesFromPair(data.dropoffLatitude, data.dropoffLongitude)
  };
}

export function assertValidBusinessCnpj(cnpj: string | null | undefined) {
  return Boolean(cnpj && isValidCnpj(cnpj));
}
