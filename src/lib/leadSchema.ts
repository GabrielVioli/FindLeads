import { z } from "zod";
import { normalizeInstagram, normalizeUrl, onlyDigits } from "@/lib/format";
import { leadPriorities, leadStatuses } from "@/types/lead";

const emptyToUndefined = (value: unknown) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
};

const optionalString = z.preprocess(emptyToUndefined, z.string().trim().optional());
const optionalUrl = z.preprocess(emptyToUndefined, z.string().trim().optional());
const optionalPhone = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  const digits = onlyDigits(value);
  return digits || undefined;
}, z.string().optional());
const optionalDate = z.preprocess((value) => {
  if (!value || value === "") return undefined;
  if (value instanceof Date) return value;
  if (typeof value === "string") return new Date(value);
  return value;
}, z.date().optional());

export const leadInputSchema = z.object({
  businessName: z.string().trim().min(2, "Informe o nome da empresa."),
  tradeName: optionalString,
  document: z.preprocess((value) => {
    const digits = onlyDigits(typeof value === "string" ? value : "");
    return digits || undefined;
  }, z.string().min(11).max(14).optional()),
  documentType: optionalString,
  phone: optionalPhone,
  whatsapp: optionalPhone,
  email: z.preprocess(emptyToUndefined, z.string().trim().email().optional()),
  website: optionalUrl.transform((value) => normalizeUrl(value)),
  instagram: optionalUrl.transform((value) => normalizeInstagram(value)),
  city: optionalString,
  state: optionalString.transform((value) => value?.toUpperCase()),
  neighborhood: optionalString,
  address: optionalString,
  niche: optionalString,
  cnaeCode: optionalString,
  cnaeDescription: optionalString,
  companyStatus: optionalString,
  openingDate: optionalDate,
  source: optionalString,
  sourceUrl: optionalUrl.transform((value) => normalizeUrl(value)),
  status: z.enum(leadStatuses).default("NEW"),
  priority: z.enum(leadPriorities).default("MEDIUM"),
  notes: optionalString,
  lastContactAt: optionalDate,
  nextActionAt: optionalDate
});

export const leadUpdateSchema = leadInputSchema.partial().extend({
  id: z.string().optional()
});

export type LeadInput = z.infer<typeof leadInputSchema>;
export type LeadUpdateInput = z.infer<typeof leadUpdateSchema>;

export const noteSchema = z.object({
  content: z.string().trim().min(2, "Informe uma observação.")
});

export const importRowSchema = z.object({
  Nome: z.string().trim().min(2),
  Telefone: optionalString,
  WhatsApp: optionalString,
  Email: z.preprocess(emptyToUndefined, z.string().trim().email().optional()),
  Site: optionalString,
  Instagram: optionalString,
  Cidade: optionalString,
  Estado: optionalString,
  Nicho: optionalString,
  Fonte: optionalString,
  Observações: optionalString,
  Status: optionalString
});

export const searchRequestSchema = z.object({
  city: z.string().trim().min(2),
  state: z.string().trim().min(2).max(2).transform((value) => value.toUpperCase()),
  niche: z.string().trim().min(2),
  maxResults: z.coerce.number().int().min(1).max(50).default(10)
});

export const urlExtractorSchema = z.object({
  urls: z
    .string()
    .trim()
    .min(5)
    .transform((value) =>
      value
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean)
    )
});
