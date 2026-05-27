import * as cheerio from "cheerio";
import pLimit from "p-limit";
import { normalizeUrl } from "@/lib/format";
import type { PublicLeadResult } from "@/types/search";

const emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const phoneRegex =
  /(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?(?:9?\d{4})[-.\s]?\d{4}/g;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function firstMatch(text: string, regex: RegExp) {
  const matches = text.match(regex);
  return matches?.[0]?.trim();
}

function cleanTitle(title?: string) {
  return title?.replace(/\s[-|].*$/, "").trim();
}

export async function extractPublicLeadFromUrl(
  url: string,
  context?: { city?: string; state?: string; niche?: string }
): Promise<PublicLeadResult | null> {
  const normalized = normalizeUrl(url);
  if (!normalized) return null;

  const response = await fetch(normalized, {
    headers: {
      "user-agent": process.env.CRAWLER_USER_AGENT || "VioliSystems Lead CRM",
      accept: "text/html,application/xhtml+xml"
    },
    signal: AbortSignal.timeout(12_000)
  });

  if (!response.ok) return null;

  const html = await response.text();
  const $ = cheerio.load(html);
  const bodyText = $("body").text().replace(/\s+/g, " ");
  const title = cleanTitle($("meta[property='og:site_name']").attr("content") || $("title").text());
  const email = firstMatch(bodyText, emailRegex);
  const phone = firstMatch(bodyText, phoneRegex);
  const whatsappHref =
    $("a[href*='wa.me']").attr("href") ||
    $("a[href*='api.whatsapp.com']").attr("href") ||
    $("a[href*='whatsapp']").attr("href");
  const instagramHref = $("a[href*='instagram.com']").attr("href");

  if (!title && !email && !phone && !whatsappHref && !instagramHref) return null;

  return {
    businessName: title || new URL(normalized).hostname.replace(/^www\./, ""),
    phone,
    whatsapp: whatsappHref ? firstMatch(whatsappHref, phoneRegex) || phone : undefined,
    email,
    website: normalized,
    instagram: instagramHref,
    city: context?.city,
    state: context?.state,
    niche: context?.niche,
    source: "URL pública",
    sourceUrl: normalized
  };
}

export async function extractManyUrls(
  urls: string[],
  context?: { city?: string; state?: string; niche?: string }
) {
  const concurrency = Number(process.env.CRAWLER_CONCURRENCY || 2);
  const delayMs = Number(process.env.CRAWLER_DELAY_MS || 3000);
  const limit = pLimit(concurrency);

  return Promise.all(
    urls.map((url, index) =>
      limit(async () => {
        if (index > 0) await sleep(delayMs);
        try {
          return await extractPublicLeadFromUrl(url, context);
        } catch {
          return null;
        }
      })
    )
  ).then((items) => items.filter(Boolean) as PublicLeadResult[]);
}
