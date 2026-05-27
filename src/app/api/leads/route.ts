import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getRequestKey } from "@/lib/rateLimit";
import { createLead } from "@/services/leadService";
import { buildLeadWhere } from "@/services/leadFilters";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const leads = await prisma.lead.findMany({
    where: buildLeadWhere(searchParams),
    orderBy: [{ score: "desc" }, { createdAt: "desc" }],
    take: 500
  });

  return NextResponse.json({ leads });
}

export async function POST(request: Request) {
  const rate = checkRateLimit(`lead:create:${getRequestKey(request)}`, 40, 60_000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Muitas requisições. Tente novamente em instantes." }, { status: 429 });
  }

  try {
    const body = await request.json();
    const result = await createLead(body);
    return NextResponse.json(result, { status: result.duplicate ? 200 : 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Dados inválidos.", issues: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: "Não foi possível salvar o lead." }, { status: 400 });
  }
}
