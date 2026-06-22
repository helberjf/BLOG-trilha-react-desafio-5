import { z } from "zod";

import { isValidCnpj, isValidCpf, normalizeDigits } from "@/lib/delivery/format";
import { userRoleSchema } from "@/lib/delivery/validators";

export const nameSchema = z
  .string()
  .trim()
  .refine(value => {
    const parts = value.split(/\s+/);
    return parts.length >= 2 && parts.every(part => part.length >= 2);
  }, "Informe nome completo ou razao social com pelo menos duas palavras.");

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
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirm: z.string().min(1, "Confirme a senha."),
    role: userRoleSchema,
    cnpj: z.string().optional(),
    cpf: z.string().optional(),
    companyPostalCode: z.string().optional(),
    whatsapp: z
      .string()
      .trim()
      .refine(value => {
        const digits = normalizeDigits(value);
        const localDigits = digits.startsWith("55") && digits.length > 11 ? digits.slice(2) : digits;
        return localDigits.length === 10 || localDigits.length === 11;
      }, "Informe um WhatsApp valido.")
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

    if (!isValidCpf(data.cpf)) {
      ctx.addIssue({
        code: "custom",
        path: ["cpf"],
        message:
          data.role === "BUSINESS"
            ? "Empresarios precisam informar o CPF valido do responsavel."
            : "Entregadores precisam informar um CPF valido."
      });
    }

    if (data.role === "BUSINESS" && normalizeDigits(data.companyPostalCode).length !== 8) {
      ctx.addIssue({
        code: "custom",
        path: ["companyPostalCode"],
        message: "Empresarios precisam informar o CEP do CNPJ."
      });
    }
  });

export type RegisterInput = z.infer<typeof registerSchema>;
