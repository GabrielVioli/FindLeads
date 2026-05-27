import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [total, newLeads, contacted, proposals, won, lost, byCity, byNiche, latest, nextActions] =
    await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { status: "NEW" } }),
      prisma.lead.count({ where: { status: "CONTACTED" } }),
      prisma.lead.count({ where: { status: "PROPOSAL_SENT" } }),
      prisma.lead.count({ where: { status: "WON" } }),
      prisma.lead.count({ where: { status: "LOST" } }),
      prisma.lead.groupBy({
        by: ["city"],
        _count: true,
        where: { city: { not: null } },
        orderBy: { _count: { city: "desc" } },
        take: 8
      }),
      prisma.lead.groupBy({
        by: ["niche"],
        _count: true,
        where: { niche: { not: null } },
        orderBy: { _count: { niche: "desc" } },
        take: 8
      }),
      prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
      prisma.lead.findMany({
        where: { nextActionAt: { not: null } },
        orderBy: { nextActionAt: "asc" },
        take: 8
      })
    ]);

  const conversion = total ? Math.round((won / total) * 100) : 0;

  return (
    <>
      <PageHeader title="Dashboard" description="Visão resumida da prospecção e do pipeline comercial." />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total de leads" value={total} />
        <StatCard label="Leads novos" value={newLeads} />
        <StatCard label="Contatados" value={contacted} />
        <StatCard label="Propostas enviadas" value={proposals} />
        <StatCard label="Ganhos" value={won} />
        <StatCard label="Perdidos" value={lost} />
        <StatCard label="Taxa de conversão" value={`${conversion}%`} hint="Ganhos sobre total de leads" />
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-2">
        <Panel title="Leads por cidade">
          <MetricList items={byCity.map((item) => [item.city || "Sem cidade", item._count])} />
        </Panel>
        <Panel title="Leads por nicho">
          <MetricList items={byNiche.map((item) => [item.niche || "Sem nicho", item._count])} />
        </Panel>
        <Panel title="Últimos leads cadastrados">
          <LeadMiniList leads={latest} />
        </Panel>
        <Panel title="Próximos contatos">
          <LeadMiniList leads={nextActions} showNextAction />
        </Panel>
      </section>
    </>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted">{title}</h2>
      {children}
    </div>
  );
}

function MetricList({ items }: { items: Array<[string, number]> }) {
  if (!items.length) return <p className="text-sm text-muted">Sem dados.</p>;
  return (
    <div className="space-y-3">
      {items.map(([label, count]) => (
        <div key={label} className="flex items-center justify-between border-b border-line pb-2 text-sm">
          <span>{label}</span>
          <strong>{count}</strong>
        </div>
      ))}
    </div>
  );
}

function LeadMiniList({
  leads,
  showNextAction
}: {
  leads: Array<{ id: string; businessName: string; city: string | null; nextActionAt?: Date | null }>;
  showNextAction?: boolean;
}) {
  if (!leads.length) return <p className="text-sm text-muted">Sem leads.</p>;
  return (
    <div className="space-y-3">
      {leads.map((lead) => (
        <Link
          key={lead.id}
          href={`/leads/${lead.id}`}
          className="block rounded-md border border-line p-3 text-sm hover:bg-panel"
        >
          <span className="font-semibold text-ink">{lead.businessName}</span>
          <span className="mt-1 block text-muted">
            {showNextAction ? formatDate(lead.nextActionAt ?? null) : lead.city || "Sem cidade"}
          </span>
        </Link>
      ))}
    </div>
  );
}
