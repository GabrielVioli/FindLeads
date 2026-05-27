"use client";

import { Upload } from "lucide-react";
import { useState } from "react";

type Summary = {
  fileName: string;
  totalRows: number;
  importedRows: number;
  failedRows: number;
  duplicateRows: number;
};

export function ImportLeadsClient() {
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!file) return;
    setBusy(true);
    setMessage("");
    setSummary(null);
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/leads/import", { method: "POST", body: formData });
    const json = await response.json();
    setBusy(false);
    if (!response.ok) {
      setMessage(json.error || "Não foi possível importar.");
      return;
    }
    setSummary(json.summary);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
      <form className="card p-5" onSubmit={submit}>
        <label className="block">
          <span className="label">Arquivo CSV ou XLSX</span>
          <input
            className="field"
            type="file"
            accept=".csv,.xlsx"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
        </label>
        <button className="btn-primary mt-4" disabled={!file || busy} type="submit">
          <Upload size={16} />
          {busy ? "Importando..." : "Importar planilha"}
        </button>
        {message ? <p className="mt-3 text-sm text-red-600">{message}</p> : null}
      </form>

      <section className="card p-5">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted">Formato esperado</h2>
        <p className="text-sm text-muted">
          Nome, Telefone, WhatsApp, Email, Site, Instagram, Cidade, Estado, Nicho, Fonte,
          Observações, Status.
        </p>
        {summary ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Metric label="Arquivo" value={summary.fileName} />
            <Metric label="Linhas" value={summary.totalRows} />
            <Metric label="Importados" value={summary.importedRows} />
            <Metric label="Duplicados" value={summary.duplicateRows} />
            <Metric label="Falhas" value={summary.failedRows} />
          </div>
        ) : null}
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-line p-3">
      <p className="label">{label}</p>
      <p className="text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}
