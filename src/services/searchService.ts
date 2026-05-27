import * as cheerio from "cheerio";
import pLimit from "p-limit";
import { extractPublicLeadFromUrl } from "@/services/urlExtractor";
import type { PublicLeadResult } from "@/types/search";

type SearchInput = {
  city: string;
  state: string;
  niche: string;
  maxResults: number;
};

const searchSuffixes = ["contato", "whatsapp", "telefone", "site"];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function publicSearchUrl(query: string) {
  const params = new URLSearchParams({ q: query });
  return `https://html.duckduckgo.com/html/?${params.toString()}`;
}

async function getResultUrls(query: string) {
  const response = await fetch(publicSearchUrl(query), {
    headers: {
      "user-agent": process.env.CRAWLER_USER_AGENT || "VioliSystems Lead CRM",
      accept: "text/html"
    },
    signal: AbortSignal.timeout(12_000)
  });

  if (!response.ok) return [];
  const html = await response.text();
  const $ = cheerio.load(html);

  return $(".result__a")
    .map((_, element) => $(element).attr("href"))
    .get()
    .map((href) => {
      if (!href) return "";
      try {
        const parsed = new URL(href, "https://duckduckgo.com");
        const uddg = parsed.searchParams.get("uddg");
        return uddg || href;
      } catch {
        return href;
      }
    })
    .filter((href) => /^https?:\/\//i.test(href))
    .filter((href) => !/duckduckgo|google|facebook|linkedin/i.test(href));
}

export async function searchPublicLeads(input: SearchInput): Promise<PublicLeadResult[]> {
  const delayMs = Number(process.env.CRAWLER_DELAY_MS || 3000);
  const concurrency = Number(process.env.CRAWLER_CONCURRENCY || 2);
  const configuredMaxPages = Number(process.env.CRAWLER_MAX_PAGES || 50);
  const maxPages = Math.min(configuredMaxPages, input.maxResults * 3);
  const queries = searchSuffixes.map(
    (suffix) => `${input.niche} ${input.city} ${input.state} ${suffix}`
  );

  const urls = new Set<string>();
  for (const query of queries) {
    if (urls.size >= maxPages) break;
    try {
      const found = await getResultUrls(query);
      found.slice(0, 10).forEach((url) => urls.add(url));
    } catch {
      // A busca pública é best-effort e deve falhar isoladamente.
    }
    await sleep(delayMs);
  }

  const limit = pLimit(concurrency);
  const results = await Promise.all(
    [...urls].slice(0, maxPages).map((url, index) =>
      limit(async () => {
        if (index > 0) await sleep(delayMs);
        return extractPublicLeadFromUrl(url, {
          city: input.city,
          state: input.state,
          niche: input.niche
        }).catch(() => null);
      })
    )
  );

  const unique = new Map<string, PublicLeadResult>();
  for (const result of results) {
    if (!result) continue;
    const key = result.website || result.email || result.phone || result.businessName;
    if (!unique.has(key)) unique.set(key, result);
  }

  return [...unique.values()].slice(0, input.maxResults);
}
