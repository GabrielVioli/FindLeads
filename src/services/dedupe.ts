import { Prisma } from "@prisma/client";
import { onlyDigits } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import type { LeadInput } from "@/lib/leadSchema";

function clean(value?: string | null) {
  const text = value?.trim();
  return text || undefined;
}

export async function findDuplicateLead(input: Partial<LeadInput>, ignoreId?: string) {
  const document = onlyDigits(input.document);
  const whatsapp = onlyDigits(input.whatsapp);
  const phone = onlyDigits(input.phone);
  const email = clean(input.email)?.toLowerCase();
  const website = clean(input.website)?.replace(/^https?:\/\//i, "").replace(/\/$/, "").toLowerCase();
  const businessName = clean(input.businessName);
  const city = clean(input.city);

  const or: Prisma.LeadWhereInput[] = [];
  if (document) or.push({ document });
  if (whatsapp) or.push({ whatsapp: { contains: whatsapp } });
  if (phone) or.push({ phone: { contains: phone } });
  if (email) or.push({ email });
  if (website) or.push({ website: { contains: website } });
  if (businessName && city) {
    or.push({
      AND: [{ businessName: { contains: businessName } }, { city }]
    });
  }

  if (!or.length) return null;

  return prisma.lead.findFirst({
    where: {
      id: ignoreId ? { not: ignoreId } : undefined,
      OR: or
    }
  });
}
