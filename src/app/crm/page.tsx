import { PageHeader } from "@/components/PageHeader";
import { CrmBoard } from "@/components/crm/CrmBoard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CrmPage() {
  const leads = await prisma.lead.findMany({
    where: { status: { not: "ARCHIVED" } },
    orderBy: [{ score: "desc" }, { updatedAt: "desc" }],
    take: 500
  });

  return (
    <>
      <PageHeader
        title="CRM"
        description="Pipeline simples por status. Troque o status pelo seletor dentro de cada card."
      />
      <CrmBoard leads={leads} />
    </>
  );
}
