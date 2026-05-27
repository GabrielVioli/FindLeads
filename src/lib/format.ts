export function formatDate(value?: Date | string | null) {
  if (!value) return "-";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
}

export function formatDateTimeInput(value?: Date | string | null) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function onlyDigits(value?: string | null) {
  return (value ?? "").replace(/\D/g, "");
}

export function cleanText(value?: string | null) {
  const normalized = value?.trim().replace(/\s+/g, " ");
  return normalized || undefined;
}

export function normalizeUrl(value?: string | null) {
  const text = cleanText(value);
  if (!text) return undefined;
  if (/^https?:\/\//i.test(text)) return text;
  return `https://${text}`;
}

export function normalizeInstagram(value?: string | null) {
  const text = cleanText(value);
  if (!text) return undefined;
  if (/^https?:\/\//i.test(text)) return text;
  const handle = text.replace(/^@/, "");
  return `https://instagram.com/${handle}`;
}

export function whatsappLink(phone?: string | null) {
  const digits = onlyDigits(phone);
  if (!digits) return "";
  const withCountry = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${withCountry}`;
}
