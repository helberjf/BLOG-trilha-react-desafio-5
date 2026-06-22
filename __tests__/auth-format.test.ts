import { buildEmailSuggestions, formatCnpj, formatCpf, formatPhoneBR } from "@/lib/auth/format";

describe("auth form formatting", () => {
  it("formats CPF, CNPJ and Brazilian phone values while typing", () => {
    expect(formatCpf("52998224725")).toBe("529.982.247-25");
    expect(formatCnpj("11222333000181")).toBe("11.222.333/0001-81");
    expect(formatPhoneBR("11999998888")).toBe("(11) 99999-8888");
  });

  it("builds common email provider suggestions from the typed username", () => {
    expect(buildEmailSuggestions("maria")).toEqual([
      "maria@gmail.com",
      "maria@hotmail.com",
      "maria@outlook.com",
      "maria@yahoo.com",
      "maria@icloud.com"
    ]);
    expect(buildEmailSuggestions("maria@g")).toEqual(["maria@gmail.com"]);
  });
});
