"use client";

import { Save, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PublicLeadResult } from "@/types/search";

const stateOptions = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO"
];

const cityOptions = [
  "Guarapuava",
  "Curitiba",
  "Ponta Grossa",
  "Cascavel",
  "Londrina",
  "Maringá",
  "Foz do Iguaçu",
  "Toledo",
  "Campo Mourão",
  "Irati",
  "Prudentópolis",
  "Pato Branco",
  "Francisco Beltrão",
  "União da Vitória",
  "São Paulo",
  "Rio de Janeiro",
  "Belo Horizonte",
  "Florianópolis",
  "Joinville",
  "Porto Alegre"
];

const nicheOptions = [
  "clínica estética",
  "odontologia",
  "restaurante",
  "pet shop",
  "advocacia",
  "imobiliária",
  "academia",
  "salão de beleza",
  "barbearia",
  "clínica médica",
  "fisioterapia",
  "psicologia",
  "auto escola",
  "oficina mecânica",
  "loja de roupas",
  "mercado",
  "hotel",
  "pousada",
  "contabilidade",
  "escola particular"
];

const limitOptions = [5, 10, 15, 20, 30, 40, 50];

export function PublicSearchClient() {
  const router = useRouter();
  const [form, setForm] = useState({
    city: "Guarapuava",
    state: "PR",
    niche: "clínica estética",
    maxResults: 10
  });
  const [results, setResults] = useState<PublicLeadResult[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function search(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setResults([]);
    const response = await fetch("/api/search", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form)
    });
    const json = await response.json();
    setBusy(false);
    if (!response.ok) {
      setMessage(json.error || "Não foi possível buscar.");
      return;
    }
    setResults(json.results);
    if (!json.results.length) setMessage("Nenhum resultado aproveitável encontrado.");
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
      <form className="card grid gap-3 p-5 md:grid-cols-4" onSubmit={search}>
        <label className="block">
          <span className="label">Cidade</span>
          <select
            className="field"
            value={form.city}
            onChange={(event) => setForm({ ...form, city: event.target.value })}
          >
            {cityOptions.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label">UF</span>
          <select
            className="field"
            value={form.state}
            onChange={(event) => setForm({ ...form, state: event.target.value })}
          >
            {stateOptions.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label">Nicho</span>
          <select
            className="field"
            value={form.niche}
            onChange={(event) => setForm({ ...form, niche: event.target.value })}
          >
            {nicheOptions.map((niche) => (
              <option key={niche} value={niche}>
                {niche}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label">Limite</span>
          <select
            className="field"
            value={form.maxResults}
            onChange={(event) => setForm({ ...form, maxResults: Number(event.target.value) })}
          >
            {limitOptions.map((limit) => (
              <option key={limit} value={limit}>
                {limit} resultados
              </option>
            ))}
          </select>
        </label>
        <button className="btn-primary md:col-span-4" disabled={busy} type="submit">
          <Search size={16} />
          {busy ? "Buscando com limite e delay..." : "Buscar leads públicos"}
        </button>
      </form>

      {message ? <p className="text-sm text-muted">{message}</p> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {results.map((result) => (
          <article key={`${result.website}-${result.businessName}`} className="card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-bold text-ink">{result.businessName}</h2>
                <p className="text-sm text-muted">{[result.city, result.state].filter(Boolean).join("/")}</p>
              </div>
              <button className="btn-secondary" onClick={() => save(result)} type="button">
                <Save size={16} />
                Salvar
              </button>
            </div>
            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <Item label="Telefone" value={result.phone} />
              <Item label="WhatsApp" value={result.whatsapp} />
              <Item label="E-mail" value={result.email} />
              <Item label="Instagram" value={result.instagram} />
              <Item label="Site" value={result.website} />
              <Item label="Fonte" value={result.sourceUrl} />
            </dl>
          </article>
        ))}
      </div>
    </div>
  );
}

function Item({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="label">{label}</dt>
      <dd className="break-words text-ink">{value || "-"}</dd>
    </div>
  );
}
