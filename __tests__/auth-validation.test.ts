import { registerSchema } from "@/lib/auth/validation";

describe("registration validation", () => {
  it("requires CNPJ for business users", () => {
    const result = registerSchema.safeParse({
      name: "Empresa Teste",
      email: "empresa@example.com",
      password: "Senha@123",
      confirm: "Senha@123",
      role: "BUSINESS",
      whatsapp: "(11) 99999-8888"
    });

    expect(result.success).toBe(false);
  });

  it("allows courier users without CNPJ", () => {
    const result = registerSchema.safeParse({
      name: "Joao Entregador",
      email: "joao@example.com",
      password: "Senha@123",
      confirm: "Senha@123",
      role: "COURIER",
      whatsapp: "(11) 99999-8888"
    });

    expect(result.success).toBe(true);
  });

  it("accepts valid business CNPJ", () => {
    const result = registerSchema.safeParse({
      name: "Mercado Central",
      email: "mercado@example.com",
      password: "Senha@123",
      confirm: "Senha@123",
      role: "BUSINESS",
      cnpj: "11.222.333/0001-81",
      whatsapp: "(11) 99999-8888"
    });

    expect(result.success).toBe(true);
  });

  it("rejects weak passwords", () => {
    const result = registerSchema.safeParse({
      name: "Joao Entregador",
      email: "joao@example.com",
      password: "123",
      confirm: "123",
      role: "COURIER",
      whatsapp: "(11) 99999-8888"
    });

    expect(result.success).toBe(false);
  });
});
