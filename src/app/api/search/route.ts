import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { searchRequestSchema } from "@/lib/leadSchema";
import { checkRateLimit, getRequestKey } from "@/lib/rateLimit";
import { searchPublicLeads } from "@/services/searchService";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const rate = checkRateLimit(`search:${getRequestKey(request)}`, 8, 60_000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Muitas buscas. Reduza o ritmo e tente novamente." }, { status: 429 });
  }

  try {
    const input = searchRequestSchema.parse(await request.json());
    const results = await searchPublicLeads(input);
    return NextResponse.json({ results });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Parâmetros inválidos." }, { status: 400 });
    }
    return NextResponse.json({ error: "A busca pública falhou." }, { status: 502 });
  }
}
