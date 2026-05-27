import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { urlExtractorSchema } from "@/lib/leadSchema";
import { checkRateLimit, getRequestKey } from "@/lib/rateLimit";
import { extractManyUrls } from "@/services/urlExtractor";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const rate = checkRateLimit(`extract:${getRequestKey(request)}`, 10, 60_000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Muitas análises. Tente novamente em instantes." }, { status: 429 });
  }

  try {
    const body = await request.json();
    const parsed = urlExtractorSchema.parse(body);
    const results = await extractManyUrls(parsed.urls);
    return NextResponse.json({ results });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Informe URLs válidas, uma por linha." }, { status: 400 });
    }
    return NextResponse.json({ error: "Não foi possível analisar as URLs." }, { status: 502 });
  }
}
