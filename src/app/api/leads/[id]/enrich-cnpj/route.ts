import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cnpjService } from "@/services/cnpjService";
import { cnpjDataToLeadInput } from "@/services/leadMapper";
import { updateLead } from "@/services/leadService";

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead?.document) {
    return NextResponse.json({ error: "Este lead não possui CNPJ." }, { status: 400 });
  }

  const data = await cnpjService.getByCnpj(lead.document);
  if (!data) return NextResponse.json({ error: "CNPJ não encontrado." }, { status: 404 });

  const mapped = cnpjDataToLeadInput(data);
  const update = Object.fromEntries(
    Object.entries(mapped).filter(([key, value]) => {
      const current = lead[key as keyof typeof lead];
      return value !== undefined && (current === null || current === undefined || current === "");
    })
  );

  const updated = await updateLead(id, update);
  return NextResponse.json({ lead: updated, cnpj: data });
}
