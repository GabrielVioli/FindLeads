"use client";

import { CalendarClock, ExternalLink, MessageCircle, RefreshCcw, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatDate, formatDateTimeInput, whatsappLink } from "@/lib/format";
import { priorityOptions, statusOptions, priorityLabels, statusLabels } from "@/lib/constants";
import type { LeadPriorityValue, LeadStatusValue } from "@/types/lead";

type LeadDetail = {
  id: string;
  businessName: string;
  tradeName?: string | null;
  document?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  website?: string | null;
  instagram?: string | null;
  city?: string | null;
  state?: string | null;
  neighborhood?: string | null;
  address?: string | null;
  niche?: string | null;
  cnaeCode?: string | null;
  cnaeDescription?: string | null;
  companyStatus?: string | null;
  openingDate?: string | Date | null;
  source?: string | null;
  sourceUrl?: string | null;
  score: number;
  status: LeadStatusValue;
  priority: LeadPriorityValue;
  notes?: string | null;
  lastContactAt?: string | Date | null;
  nextActionAt?: string | Date | null;
  leadNotes: Array<{ id: string; content: string; createdAt: string | Date }>;
};

export function LeadDetailPanel({ lead }: { lead: LeadDetail }) {
  const router = useRouter();
  const [status, setStatus] = useState(lead.status);
  const [priority, setPriority] = useState(lead.priority);
  const [lastContactAt, setLastContactAt] = useState(formatDateTimeInput(lead.lastContactAt));
  const [nextActionAt, setNextActionAt] = useState(formatDateTimeInput(lead.nextActionAt));
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function updateLead(extra: Record<string, unknown> = {}) {
    setBusy(true);
    setMessage("");
    const response = await fetch(`/api/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        status,
        priority,
        lastContactAt,
        nextActionAt,
        ...extra
      })
    });
    const json = await response.json();
    setBusy(false);
    if (!response.ok) {
      setMessage(json.error || "Não foi possível atualizar.");
      return;
    }
    setMessage("Lead atualizado.");
    router.refresh();
  }

  async function addNote() {
    if (!note.trim()) return;
    setBusy(true);
    const response = await fetch(`/api/leads/${lead.id}/notes`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ content: note })
    });
    setBusy(false);
    if (response.ok) {
      setNote("");
      router.refresh();
    } else {
      setMessage("Não foi possível salvar a observação.");
    }
  }

  async function enrichCnpj() {
    setBusy(true);
    setMessage("");
    const response = await fetch(`/api/leads/${lead.id}/enrich-cnpj`, { method: "POST" });
    const json = await response.json();
    setBusy(false);
    if (!response.ok) {
      setMessage(json.error || "Não foi possível enriquecer com CNPJ.");
      return;
    }
    setMessage("Dados públicos de CNPJ aplicados aos campos vazios.");
    router.refresh();
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
      <section className="card p-5">
        <div className="mb-5 flex flex-wrap gap-2">
          {lead.whatsapp ? (
            <a className="btn-primary" href={whatsappLink(lead.whatsapp)} target="_blank" rel="noreferrer">
              <MessageCircle size={16} />
              Abrir WhatsApp
            </a>
          ) : null}
          {lead.website ? (
            <a className="btn-secondary" href={lead.website} target="_blank" rel="noreferrer">
              <ExternalLink size={16} />
              Site
            </a>
          ) : null}
          {lead.instagram ? (
            <a className="btn-secondary" href={lead.instagram} target="_blank" rel="noreferrer">
              <ExternalLink size={16} />
              Instagram
            </a>
          ) : null}
          <button className="btn-secondary" onClick={enrichCnpj} disabled={busy || !lead.document} type="button">
            <RefreshCcw size={16} />
            Enriquecer com CNPJ
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Info label="Empresa" value={lead.businessName} />
          <Info label="Nome fantasia" value={lead.tradeName} />
          <Info label="CNPJ" value={lead.document} />
          <Info label="Telefone" value={lead.phone} />
          <Info label="WhatsApp" value={lead.whatsapp} />
          <Info label="E-mail" value={lead.email} />
          <Info label="Cidade/UF" value={[lead.city, lead.state].filter(Boolean).join("/")} />
          <Info label="Bairro" value={lead.neighborhood} />
          <Info label="Endereço" value={lead.address} />
          <Info label="Nicho" value={lead.niche} />
          <Info label="CNAE" value={[lead.cnaeCode, lead.cnaeDescription].filter(Boolean).join(" - ")} />
          <Info label="Situação" value={lead.companyStatus} />
          <Info label="Abertura" value={formatDate(lead.openingDate)} />
          <Info label="Fonte" value={lead.source} />
          <Info label="Score" value={String(lead.score)} />
          <Info label="Status atual" value={statusLabels[lead.status]} />
          <Info label="Prioridade atual" value={priorityLabels[lead.priority]} />
        </div>

        {lead.notes ? (
          <div className="mt-5 rounded-md border border-line bg-panel p-4 text-sm">
            <p className="label">Observações iniciais</p>
            <p className="whitespace-pre-wrap">{lead.notes}</p>
          </div>
        ) : null}
      </section>

      <aside className="space-y-5">
        <section className="card p-5">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted">Acompanhamento</h2>
          <div className="space-y-3">
            <label className="block">
              <span className="label">Status</span>
              <select className="field" value={status} onChange={(event) => setStatus(event.target.value as LeadStatusValue)}>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="label">Prioridade</span>
              <select
                className="field"
                value={priority}
                onChange={(event) => setPriority(event.target.value as LeadPriorityValue)}
              >
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="label">Último contato</span>
              <input className="field" type="datetime-local" value={lastContactAt} onChange={(event) => setLastContactAt(event.target.value)} />
            </label>
            <label className="block">
              <span className="label">Próxima ação</span>
              <input className="field" type="datetime-local" value={nextActionAt} onChange={(event) => setNextActionAt(event.target.value)} />
            </label>
            <button className="btn-primary w-full" onClick={() => updateLead()} disabled={busy} type="button">
              <Save size={16} />
              Salvar acompanhamento
            </button>
            {message ? <p className="text-sm text-muted">{message}</p> : null}
          </div>
        </section>

        <section className="card p-5">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted">Histórico de contato</h2>
          <textarea
            className="field min-h-28"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Adicionar observação"
          />
          <button className="btn-secondary mt-3 w-full" onClick={addNote} disabled={busy} type="button">
            <CalendarClock size={16} />
            Adicionar observação
          </button>
          <div className="mt-5 space-y-3">
            {lead.leadNotes.length ? (
              lead.leadNotes.map((item) => (
                <div key={item.id} className="rounded-md border border-line p-3 text-sm">
                  <p className="whitespace-pre-wrap">{item.content}</p>
                  <p className="mt-2 text-xs text-muted">{formatDate(item.createdAt)}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted">Nenhuma observação cadastrada.</p>
            )}
          </div>
        </section>
      </aside>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-md border border-line p-3">
      <p className="label">{label}</p>
      <p className="min-h-5 break-words text-sm text-ink">{value || "-"}</p>
    </div>
  );
}
