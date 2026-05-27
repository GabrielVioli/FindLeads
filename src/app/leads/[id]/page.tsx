import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { LeadDetailPanel } from "@/components/leads/LeadDetailPanel";
import { prisma } from "@/lib/prisma";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: { leadNotes: { orderBy: { createdAt: "desc" } } }
  });

  if (!lead) notFound();

  return (
    <>
      <PageHeader title={lead.businessName} description="Dados completos, histórico e acompanhamento comercial." />
      <LeadDetailPanel lead={lead} />
    </>
  );
}
