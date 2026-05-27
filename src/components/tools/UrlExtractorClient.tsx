"use client";

import { FileSearch, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PublicLeadResult } from "@/types/search";

export function UrlExtractorClient() {
  const router = useRouter();
  const [urls, setUrls] = useState("");
  const [results, setResults] = useState<PublicLeadResult[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function analyze(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setResults([]);
    const response = await fetch("/api/url-extractor", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ urls })
    });
    const json = await response.json();
    setBusy(false);
    if (!response.ok) {
      setMessage(json.error || "Não foi possível analisar.");
      return;
    }
    setResults(json.results);
    if (!json.results.length) setMessage("Nenhum dado comercial público foi extraído.");
  }

  async function save(result: PublicLeadResult) {
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...result, status: "NEW", priority: "MEDIUM" })
    });
    const json = await response.json();
    if (response.ok) router.push(`/leads/${json.lead.id}`);
    else setMessage(json.error || "Não foi possível salvar.");
  }

  return (
    <div className="space-y-5">
      <form className="card p-5" onSubmit={analyze}>
        <label className="block">
          <span className="label">URLs públicas, uma por linha</span>
          <textarea
            className="field min-h-44"
            value={urls}
            onChange={(event) => setUrls(event.target.value)}
            placeholder="https://empresa.com.br"
          />
        </label>
        <button className="btn-primary mt-4" disabled={busy || !urls.trim()} type="submit">
          <FileSearch size={16} />
          {busy ? "Analisando..." : "Analisar URLs"}
        </button>
      </form>

      {message ? <p className="text-sm text-muted">{message}</p> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {results.map((result) => (
          <article key={`${result.sourceUrl}-${result.businessName}`} className="card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-bold text-ink">{result.businessName}</h2>
                <p className="break-all text-sm text-muted">{result.sourceUrl}</p>
              </div>
              <button className="btn-secondary" onClick={() => save(result)} type="button">
                <Save size={16} />
                Salvar
              </button>
            </div>
            <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <Info label="Telefone" value={result.phone} />
              <Info label="WhatsApp" value={result.whatsapp} />
              <Info label="E-mail" value={result.email} />
              <Info label="Instagram" value={result.instagram} />
              <Info label="Site" value={result.website} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="label">{label}</p>
      <p className="break-words text-sm text-ink">{value || "-"}</p>
    </div>
  );
}
