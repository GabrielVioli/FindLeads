import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { checkRateLimit, getRequestKey } from "@/lib/rateLimit";
import { discoverCompaniesByCnpjFilters } from "@/services/cnpjDiscoveryService";

export const runtime = "nodejs";

const cnpjDiscoverySchema = z.object({
  city: z.string().trim().min(2),
  state: z.string().trim().min(2).max(2).transform((value) => value.toUpperCase()),
  niche: z.string().trim().min(2),
  companyStatus: z.string().trim().default("ATIVA"),
  openingRangeMonths: z.union([z.literal("any"), z.coerce.number().int().min(1).max(240)]),
  maxResults: z.coerce.number().int().min(1).max(50).default(10)
});

export async function POST(request: Request) {
  const rate = checkRateLimit(`cnpj-search:${getRequestKey(request)}`, 6, 60_000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Muitas buscas. Tente novamente em instantes." }, { status: 429 });
  }

  try {
    const input = cnpjDiscoverySchema.parse(await request.json());
    const results = await discoverCompaniesByCnpjFilters(input);
    return NextResponse.json({ results });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Filtros inválidos." }, { status: 400 });
    }
    return NextResponse.json({ error: "Não foi possível buscar empresas pelos filtros." }, { status: 502 });
  }
}
