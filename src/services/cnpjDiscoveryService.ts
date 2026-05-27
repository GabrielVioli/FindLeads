import * as cheerio from "cheerio";
import pLimit from "p-limit";
import { cnpjService } from "@/services/cnpjService";
import type { CnpjData } from "@/types/cnpj";

export type CnpjDiscoveryInput = {
  city: string;
  state: string;
  niche: string;
  companyStatus: string;
  openingRangeMonths: number | "any";
  maxResults: number;
};

const cnpjRegex = /\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/g;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalize(value?: string | null) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function publicSearchUrl(query: string) {
  const params = new URLSearchParams({ q: query });
  return `https://html.duckduckgo.com/html/?${params.toString()}`;
}

async function fetchHtml(url: string) {
  const response = await fetch(url, {
    headers: {
      "user-agent": process.env.CRAWLER_USER_AGENT || "VioliSystems Lead CRM",
      accept: "text/html,application/xhtml+xml"
    },
    signal: AbortSignal.timeout(12_000)
  });

  if (!response.ok) return "";
  return response.text();
}

async function searchCnpjCandidates(query: string) {
  const html = await fetchHtml(publicSearchUrl(query));
  if (!html) return { cnpjs: new Set<string>(), urls: [] as string[] };

  const $ = cheerio.load(html);
  const cnpjs = new Set<string>();
  const urls: string[] = [];

  $(".result").each((_, element) => {
    const text = $(element).text();
    for (const match of text.match(cnpjRegex) ?? []) {
      const digits = onlyDigits(match);
      if (digits.length === 14) cnpjs.add(digits);
    }

    const href = $(element).find(".result__a").attr("href");
    if (!href) return;
    try {
      const parsed = new URL(href, "https://duckduckgo.com");
      const uddg = parsed.searchParams.get("uddg");
      const finalUrl = uddg || href;
      if (/^https?:\/\//i.test(finalUrl) && !/google|facebook|linkedin|instagram/i.test(finalUrl)) {
        urls.push(finalUrl);
      }
    } catch {
      // Ignore malformed search result URLs.
    }
  });

  return { cnpjs, urls };
}

async function extractCnpjsFromUrl(url: string) {
  try {
    const html = await fetchHtml(url);
    const cnpjs = new Set<string>();
    for (const match of html.match(cnpjRegex) ?? []) {
      const digits = onlyDigits(match);
      if (digits.length === 14) cnpjs.add(digits);
    }
    return cnpjs;
  } catch {
    return new Set<string>();
  }
}

function passesFilters(company: CnpjData, input: CnpjDiscoveryInput) {
  if (company.uf && normalize(company.uf) !== normalize(input.state)) return false;
  if (company.cidade && normalize(company.cidade) !== normalize(input.city)) return false;

  if (input.companyStatus !== "ANY") {
    const status = normalize(company.situacaoCadastral);
    if (!status.includes(normalize(input.companyStatus))) return false;
  }

  if (input.openingRangeMonths !== "any") {
    if (!company.dataAbertura) return false;
    const openingDate = new Date(company.dataAbertura);
    if (Number.isNaN(openingDate.getTime())) return false;
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - input.openingRangeMonths);
    if (openingDate < cutoff) return false;
  }

  if (input.niche !== "qualquer") {
    const haystack = normalize(
      [
        company.razaoSocial,
        company.nomeFantasia,
        company.cnaePrincipal?.description,
        ...(company.cnaesSecundarios?.map((cnae) => cnae.description) ?? [])
      ].join(" ")
    );
    if (!haystack.includes(normalize(input.niche))) return false;
  }

  return true;
}

export async function discoverCompaniesByCnpjFilters(input: CnpjDiscoveryInput) {
  const delayMs = Number(process.env.CRAWLER_DELAY_MS || 1000);
  const concurrency = Number(process.env.CRAWLER_CONCURRENCY || 4);
  const maxPages = Math.min(Number(process.env.CRAWLER_MAX_PAGES || 24), input.maxResults * 4);
  const limit = pLimit(concurrency);

  const statusQuery = input.companyStatus === "ANY" ? "" : input.companyStatus;
  const queries = [
    `"${input.niche}" "${input.city}" "${input.state}" CNPJ ${statusQuery}`,
    `site:cnpj.biz "${input.city}" "${input.state}" "${input.niche}"`,
    `site:casadosdados.com.br "${input.city}" "${input.state}" "${input.niche}"`,
    `"${input.city}" "${input.state}" "CNPJ" "${input.niche}" "situação cadastral"`
  ];

  const candidateCnpjs = new Set<string>();
  const candidateUrls = new Set<string>();

  for (const query of queries) {
    const { cnpjs, urls } = await searchCnpjCandidates(query);
    cnpjs.forEach((cnpj) => candidateCnpjs.add(cnpj));
    urls.slice(0, 8).forEach((url) => candidateUrls.add(url));
    if (candidateCnpjs.size >= input.maxResults * 3) break;
    await sleep(delayMs);
  }

  const urlCnpjs = await Promise.all(
    [...candidateUrls].slice(0, maxPages).map((url, index) =>
      limit(async () => {
        if (index > 0) await sleep(delayMs);
        return extractCnpjsFromUrl(url);
      })
    )
  );

  urlCnpjs.forEach((set) => set.forEach((cnpj) => candidateCnpjs.add(cnpj)));

  const enriched: CnpjData[] = [];
  await Promise.all(
    [...candidateCnpjs].slice(0, input.maxResults * 5).map((cnpj, index) =>
      limit(async () => {
        if (index > 0) await sleep(Math.floor(delayMs / 2));
        const company = await cnpjService.getByCnpj(cnpj).catch(() => null);
        if (company && passesFilters(company, input)) enriched.push(company);
      })
    )
  );

  const unique = new Map<string, CnpjData>();
  for (const company of enriched) {
    if (!unique.has(company.cnpj)) unique.set(company.cnpj, company);
  }

  return [...unique.values()].slice(0, input.maxResults);
}
