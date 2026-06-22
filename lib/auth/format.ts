import { normalizeDigits } from "@/lib/delivery/format";

const EMAIL_DOMAINS = ["gmail.com", "hotmail.com", "outlook.com", "yahoo.com", "icloud.com"];

export function formatCpf(value: string) {
  const digits = normalizeDigits(value).slice(0, 11);
  const part1 = digits.slice(0, 3);
  const part2 = digits.slice(3, 6);
  const part3 = digits.slice(6, 9);
  const part4 = digits.slice(9, 11);

  if (digits.length <= 3) return part1;
  if (digits.length <= 6) return `${part1}.${part2}`;
  if (digits.length <= 9) return `${part1}.${part2}.${part3}`;
  return `${part1}.${part2}.${part3}-${part4}`;
}

export function formatCnpj(value: string) {
  const digits = normalizeDigits(value).slice(0, 14);
  const part1 = digits.slice(0, 2);
  const part2 = digits.slice(2, 5);
  const part3 = digits.slice(5, 8);
  const part4 = digits.slice(8, 12);
  const part5 = digits.slice(12, 14);

  if (digits.length <= 2) return part1;
  if (digits.length <= 5) return `${part1}.${part2}`;
  if (digits.length <= 8) return `${part1}.${part2}.${part3}`;
  if (digits.length <= 12) return `${part1}.${part2}.${part3}/${part4}`;
  return `${part1}.${part2}.${part3}/${part4}-${part5}`;
}

export function formatPhoneBR(value: string) {
  let digits = normalizeDigits(value);
  if (digits.startsWith("55") && digits.length > 11) {
    digits = digits.slice(2);
  }
  digits = digits.slice(0, 11);

  const ddd = digits.slice(0, 2);
  const rest = digits.slice(2);

  if (!ddd) return "";
  if (rest.length <= 4) return `(${ddd}) ${rest}`.trim();
  if (rest.length <= 8) {
    return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`.trim();
  }

  return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`.trim();
}

export function formatCep(value: string) {
  const digits = normalizeDigits(value).slice(0, 8);
  const part1 = digits.slice(0, 5);
  const part2 = digits.slice(5, 8);

  if (digits.length <= 5) return part1;
  return `${part1}-${part2}`;
}

export function buildEmailSuggestions(value: string) {
  const trimmed = value.trim().toLowerCase();
  const [localPart, domainPart = ""] = trimmed.split("@");

  if (!localPart || trimmed.includes(" ")) {
    return [];
  }

  return EMAIL_DOMAINS.filter(domain => domain.startsWith(domainPart)).map(domain => `${localPart}@${domain}`);
}
