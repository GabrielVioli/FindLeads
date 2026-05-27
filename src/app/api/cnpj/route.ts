import { NextResponse } from "next/server";
import { cnpjService } from "@/services/cnpjService";
import { checkRateLimit, getRequestKey } from "@/lib/rateLimit";

export async function GET(request: Request) {
  const rate = checkRateLimit(`cnpj:${getRequestKey(request)}`, 20, 60_000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Muitas consultas. Tente novamente em instantes." }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const cnpj = searchParams.get("cnpj");
  if (!cnpj) return NextResponse.json({ error: "Informe um CNPJ." }, { status: 400 });

  try {
    const data = await cnpjService.getByCnpj(cnpj);
    if (!data) return NextResponse.json({ error: "CNPJ não encontrado." }, { status: 404 });
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Não foi possível consultar o CNPJ." }, { status: 502 });
  }
}
