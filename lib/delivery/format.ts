export function normalizeDigits(value: string | null | undefined) {
  return value ? value.replace(/\D/g, "") : "";
}

export function isValidCpf(value: string | null | undefined) {
  const cpf = normalizeDigits(value);

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  const calcDigit = (length: number) => {
    let sum = 0;
    for (let i = 0; i < length; i++) {
      sum += Number(cpf[i]) * (length + 1 - i);
    }
    const remainder = (sum * 10) % 11;
    return remainder >= 10 ? 0 : remainder;
  };

  return calcDigit(9) === Number(cpf[9]) && calcDigit(10) === Number(cpf[10]);
}

export function isValidCnpj(value: string | null | undefined) {
  const cnpj = normalizeDigits(value);

  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) {
    return false;
  }

  const calc = (length: number) => {
    let sum = 0;
    let position = length - 7;

    for (let i = length; i >= 1; i -= 1) {
      sum += Number(cnpj.charAt(length - i)) * position;
      position -= 1;

      if (position < 2) {
        position = 9;
      }
    }

    const result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    return result;
  };

  return calc(12) === Number(cnpj.charAt(12)) && calc(13) === Number(cnpj.charAt(13));
}

export function normalizeBrazilPhone(value: string) {
  const digits = normalizeDigits(value);
  return digits.startsWith("55") ? digits : `55${digits}`;
}

export function formatWhatsAppUrl(phone: string, message = "Tenho interesse na entrega") {
  return `https://wa.me/${normalizeBrazilPhone(phone)}?text=${encodeURIComponent(message)}`;
}

export function currencyToCents(value: string | number) {
  if (typeof value === "number") {
    return Math.round(value * 100);
  }

  const onlyCurrency = value.replace(/[^\d,.]/g, "");
  const normalized = onlyCurrency.includes(",")
    ? onlyCurrency.replace(/\./g, "").replace(",", ".")
    : onlyCurrency;

  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : 0;
}

export function centsToCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  })
    .format(value / 100)
    .replace(/\u00a0/g, " ");
}
