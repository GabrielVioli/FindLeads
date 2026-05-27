import type { LeadInput, LeadUpdateInput } from "@/lib/leadSchema";

const priorityNiches = [
  "clinica",
  "clínica",
  "estetica",
  "estética",
  "odontologia",
  "dentista",
  "restaurante",
  "pet",
  "advocacia",
  "imobiliaria",
  "imobiliária"
];

function openedRecently(openingDate?: Date | string | null) {
  if (!openingDate) return false;
  const date = typeof openingDate === "string" ? new Date(openingDate) : openingDate;
  if (Number.isNaN(date.getTime())) return false;
  const months24Ago = new Date();
  months24Ago.setMonth(months24Ago.getMonth() - 24);
  return date >= months24Ago;
}

export function calculateLeadScore(input: Partial<LeadInput | LeadUpdateInput>) {
  let score = 0;
  const niche = input.niche?.toLowerCase() ?? "";
  const companyStatus = input.companyStatus?.toLowerCase() ?? "";
  const priorityCities = (process.env.PRIORITY_CITIES ?? "")
    .split(",")
    .map((city) => city.trim().toLowerCase())
    .filter(Boolean);

  if (input.whatsapp) score += 3;
  if (input.email) score += 2;
  if (input.website) score += 1;
  if (!input.website) score += 4;
  if (input.instagram) score += 2;
  if (input.city && priorityCities.includes(input.city.toLowerCase())) score += 1;
  if (priorityNiches.some((item) => niche.includes(item))) score += 2;
  if (companyStatus.includes("ativa") || companyStatus.includes("active")) score += 2;
  if (openedRecently(input.openingDate)) score += 2;

  return score;
}
