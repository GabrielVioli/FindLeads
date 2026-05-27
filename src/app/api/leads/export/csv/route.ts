import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildLeadWhere } from "@/services/leadFilters";
import { exportLeadsToCsv } from "@/services/exportLeads";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const leads = await prisma.lead.findMany({
    where: buildLeadWhere(searchParams),
    orderBy: [{ score: "desc" }, { createdAt: "desc" }]
  });
  const csv = exportLeadsToCsv(leads);

  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="leads.csv"'
    }
  });
}
