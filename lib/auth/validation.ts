import { z } from "zod";

import { isValidCnpj, normalizeDigits } from "@/lib/delivery/format";
import { userRoleSchema } from "@/lib/delivery/validators";

export const emailSchema = z.string().trim().toLowerCase().email("Informe um email valido.");

export const passwordSchema = z
  .string()
  .min(8, "A senha deve ter pelo menos 8 caracteres.")
  .regex(/[a-z]/, "A senha deve ter uma letra minuscula.")
  .regex(/[A-Z]/, "A senha deve ter uma letra maiuscula.")
  .regex(/[0-9]/, "A senha deve ter um numero.")
  .regex(/[^a-zA-Z0-9]/, "A senha deve ter um caractere especial.");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Informe sua senha.")
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Informe seu nome ou empresa."),
    email: emailSchema,
    password: passwordSchema,
    confirm: z.string().min(1, "Confirme a senha."),
    role: userRoleSchema,
    cnpj: z.string().optional(),
    whatsapp: z
      .string()
      .trim()
      .refine(value => normalizeDigits(value).length >= 10, "Informe um WhatsApp valido.")
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirm) {
      ctx.addIssue({
        code: "custom",
        path: ["confirm"],
        message: "As senhas nao conferem."
      });
    }

    if (data.role === "BUSINESS" && !isValidCnpj(data.cnpj)) {
      ctx.addIssue({
        code: "custom",
        path: ["cnpj"],
        message: "Empresarios precisam informar um CNPJ valido."
      });
    }
  });

export type RegisterInput = z.infer<typeof registerSchema>;
