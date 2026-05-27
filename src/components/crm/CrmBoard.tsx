"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { pipelineStatuses, statusLabels } from "@/lib/constants";
import type { LeadStatusValue } from "@/types/lead";

type CrmLead = {
  id: string;
  businessName: string;
  city?: string | null;
  state?: string | null;
  niche?: string | null;
  score: number;
  status: LeadStatusValue;
};

export function CrmBoard({ leads }: { leads: CrmLead[] }) {
  const router = useRouter();

  async function moveLead(id: string, status: LeadStatusValue) {
    await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status })
    });
    router.refresh();
  }

  return (
    <div className="grid gap-4 xl:grid-cols-4 2xl:grid-cols-8">
      {pipelineStatuses.map((status) => {
        const items = leads.filter((lead) => lead.status === status);
        return (
          <section key={status} className="min-h-96 rounded-lg border border-line bg-white">
            <header className="flex items-center justify-between border-b border-line px-3 py-3">
              <h2 className="text-sm font-bold text-ink">{statusLabels[status]}</h2>
              <span className="rounded-full bg-panel px-2 py-1 text-xs font-semibold text-muted">{items.length}</span>
            </header>
            <div className="space-y-3 p-3">
              {items.map((lead) => (
                <article key={lead.id} className="rounded-md border border-line bg-panel p-3">
                  <Link className="font-semibold text-brand hover:underline" href={`/leads/${lead.id}`}>
                    {lead.businessName}
                  </Link>
                  <p className="mt-1 text-xs text-muted">{[lead.city, lead.state].filter(Boolean).join("/") || "Sem cidade"}</p>
                  <p className="mt-1 text-xs text-muted">{lead.niche || "Sem nicho"} · Score {lead.score}</p>
                  <select
                    className="field mt-3"
                    value={lead.status}
                    onChange={(event) => moveLead(lead.id, event.target.value as LeadStatusValue)}
                  >
                    {pipelineStatuses.map((option) => (
                      <option key={option} value={option}>
                        {statusLabels[option]}
                      </option>
                    ))}
                  </select>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
