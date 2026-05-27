import { Prisma } from "@prisma/client";
import { leadPriorities, leadStatuses } from "@/types/lead";

export function buildLeadWhere(searchParams: URLSearchParams): Prisma.LeadWhereInput {
  const q = searchParams.get("q")?.trim();
  const city = searchParams.get("city")?.trim();
  const niche = searchParams.get("niche")?.trim();
  const status = searchParams.get("status")?.trim();
  const priority = searchParams.get("priority")?.trim();

  return {
    AND: [
      q
        ? {
            OR: [
              { businessName: { contains: q } },
              { tradeName: { contains: q } },
              { email: { contains: q } },
              { document: { contains: q } }
            ]
          }
        : {},
      city ? { city: { contains: city } } : {},
      niche ? { niche: { contains: niche } } : {},
      status && leadStatuses.includes(status as never) ? { status: status as never } : {},
      priority && leadPriorities.includes(priority as never) ? { priority: priority as never } : {}
    ]
  };
}

export function searchParamsFromRecord(record?: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(record ?? {})) {
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
    } else if (value) {
      params.set(key, value);
    }
  }
  return params;
}
