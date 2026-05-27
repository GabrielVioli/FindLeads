import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { updateLead } from "@/services/leadService";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: { leadNotes: { orderBy: { createdAt: "desc" } } }
  });

  if (!lead) return NextResponse.json({ error: "Lead não encontrado." }, { status: 404 });
  return NextResponse.json({ lead });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const body = await request.json();
    const lead = await updateLead(id, body);
    return NextResponse.json({ lead });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Dados inválidos.", issues: error.flatten() }, { status: 400 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Não foi possível atualizar o lead." },
      { status: 400 }
    );
  }
}
