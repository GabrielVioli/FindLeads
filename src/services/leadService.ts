import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { leadInputSchema, leadUpdateSchema, type LeadInput } from "@/lib/leadSchema";
import { calculateLeadScore } from "@/services/scoreLead";
import { findDuplicateLead } from "@/services/dedupe";

export async function createLead(raw: unknown) {
  const input = leadInputSchema.parse(raw);
  const duplicate = await findDuplicateLead(input);
  if (duplicate) {
    return { lead: duplicate, duplicate: true };
  }

  const score = calculateLeadScore(input);
  const lead = await prisma.lead.create({
    data: { ...input, score } as Prisma.LeadUncheckedCreateInput
  });

  return { lead, duplicate: false };
}

export async function updateLead(id: string, raw: unknown) {
  const input = leadUpdateSchema.parse(raw);
  const current = await prisma.lead.findUniqueOrThrow({ where: { id } });
  const merged = { ...current, ...input } as Partial<LeadInput>;
  const duplicate = await findDuplicateLead(merged, id);
  if (duplicate) {
    throw new Error("Já existe um lead com dados equivalentes.");
  }

  const score = calculateLeadScore(merged);
  return prisma.lead.update({
    where: { id },
    data: { ...input, score } as Prisma.LeadUncheckedUpdateInput
  });
}
