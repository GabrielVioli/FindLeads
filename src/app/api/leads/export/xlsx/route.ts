import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildLeadWhere } from "@/services/leadFilters";
import { exportLeadsToXlsx } from "@/services/exportLeads";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const leads = await prisma.lead.findMany({
    where: buildLeadWhere(searchParams),
    orderBy: [{ score: "desc" }, { createdAt: "desc" }]
  });
  const buffer = await exportLeadsToXlsx(leads);

  return new NextResponse(buffer, {
    headers: {
      "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "content-disposition": 'attachment; filename="leads.xlsx"'
    }
  });
}
