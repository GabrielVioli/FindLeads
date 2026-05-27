"use client";

import { Save, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CnpjData } from "@/types/cnpj";

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

const nicheOptions = [
  "qualquer",
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

const statusOptions = [
  { value: "ATIVA", label: "Ativa" },
  { value: "BAIXADA", label: "Baixada" },
  { value: "INAPTA", label: "Inapta" },
  { value: "SUSPENSA", label: "Suspensa" },
  { value: "ANY", label: "Qualquer situação" }
];

const openingOptions = [
  { value: "24", label: "Aberta nos últimos 24 meses" },
  { value: "12", label: "Aberta nos últimos 12 meses" },
  { value: "6", label: "Aberta nos últimos 6 meses" },
  { value: "60", label: "Aberta nos últimos 5 anos" },
  { value: "any", label: "Qualquer data de abertura" }
];

const limitOptions = [5, 10, 15, 20, 30, 40, 50];

export function CnpjSearchClient() {
  const router = useRouter();
  const [form, setForm] = useState({
    city: "Guarapuava",
    state: "PR",
    niche: "qualquer",
    companyStatus: "ATIVA",
    openingRangeMonths: "24",
    maxResults: 10
  });
  const [results, setResults] = useState<CnpjData[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function search(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setResults([]);

    const response = await fetch("/api/cnpj/search", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form)
    });
    const json = await response.json();
    setBusy(false);

    if (!response.ok) {
      setMessage(json.error || "Não foi possível buscar empresas.");
      return;
    }

    setResults(json.results);
    if (!json.results.length) {
      setMessage("Nenhuma empresa encontrada com esses filtros. Tente ampliar data, nicho ou limite.");
    }
  }

  async function saveAsLead(data: CnpjData) {
    setBusy(true);
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        businessName: data.razaoSocial || data.nomeFantasia || `CNPJ ${data.cnpj}`,
        tradeName: data.nomeFantasia,
        document: data.cnpj,
        documentType: "CNPJ",
        phone: data.telefone,
        whatsapp: data.telefone,
        email: data.email,
        city: data.cidade,
        state: data.uf,
        neighborhood: data.bairro,
        address: data.endereco,
        niche: data.cnaePrincipal?.description,
        cnaeCode: data.cnaePrincipal?.code,
        cnaeDescription: data.cnaePrincipal?.description,
        companyStatus: data.situacaoCadastral,
        openingDate: data.dataAbertura,
        source: "Busca CNPJ por filtros",
        sourceUrl: `https://brasilapi.com.br/api/cnpj/v1/${data.cnpj}`,
        status: "NEW",
        priority: "MEDIUM"
      })
    });
    const json = await response.json();
    setBusy(false);

    if (!response.ok) {
      setMessage(json.error || "Não foi possível salvar.");
      return;
    }

    router.push(`/leads/${json.lead.id}`);
  }

  return (
    <div className="space-y-5">
      <form className="card grid gap-3 p-5 md:grid-cols-3 xl:grid-cols-6" onSubmit={search}>
        <SelectField label="Cidade" value={form.city} onChange={(city) => setForm({ ...form, city })}>
          {cityOptions.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </SelectField>

        <SelectField label="UF" value={form.state} onChange={(state) => setForm({ ...form, state })}>
          {stateOptions.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </SelectField>

        <SelectField label="Nicho / CNAE" value={form.niche} onChange={(niche) => setForm({ ...form, niche })}>
          {nicheOptions.map((niche) => (
            <option key={niche} value={niche}>
              {niche}
            </option>
          ))}
        </SelectField>

        <SelectField
          label="Situação"
          value={form.companyStatus}
          onChange={(companyStatus) => setForm({ ...form, companyStatus })}
        >
          {statusOptions.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </SelectField>

        <SelectField
          label="Abertura"
          value={form.openingRangeMonths}
          onChange={(openingRangeMonths) => setForm({ ...form, openingRangeMonths })}
        >
          {openingOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>

        <label className="block">
          <span className="label">Limite</span>
          <select
            className="field"
            value={form.maxResults}
            onChange={(event) => setForm({ ...form, maxResults: Number(event.target.value) })}
          >
            {limitOptions.map((limit) => (
              <option key={limit} value={limit}>
                {limit} empresas
              </option>
            ))}
          </select>
        </label>

        <button className="btn-primary md:col-span-3 xl:col-span-6" disabled={busy} type="submit">
          <Search size={16} />
          {busy ? "Buscando empresas..." : "Buscar empresas por filtros"}
        </button>
      </form>

      {message ? <p className="text-sm text-muted">{message}</p> : null}

      <div className="grid gap-4 xl:grid-cols-2">
        {results.map((data) => (
          <article key={data.cnpj} className="card p-5">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-ink">{data.razaoSocial || data.nomeFantasia}</h2>
                <p className="text-sm text-muted">{data.nomeFantasia || data.cnpj}</p>
              </div>
              <button className="btn-primary" onClick={() => saveAsLead(data)} disabled={busy} type="button">
                <Save size={16} />
                Salvar lead
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Info label="CNPJ" value={data.cnpj} />
              <Info label="Situação" value={data.situacaoCadastral} />
              <Info label="Abertura" value={data.dataAbertura} />
              <Info label="CNAE principal" value={data.cnaePrincipal?.description} />
              <Info label="Telefone" value={data.telefone} />
              <Info label="E-mail" value={data.email} />
              <Info label="Cidade/UF" value={[data.cidade, data.uf].filter(Boolean).join("/")} />
              <Info label="Endereço" value={data.endereco} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  children
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <select className="field" value={value} onChange={(event) => onChange(event.target.value)}>
        {children}
      </select>
    </label>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-md border border-line p-3">
      <p className="label">{label}</p>
      <p className="break-words text-sm text-ink">{value || "-"}</p>
    </div>
  );
}
