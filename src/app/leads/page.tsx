import { Download, FileSpreadsheet, Plus, Upload } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { LeadTable } from "@/components/leads/LeadTable";
import { prisma } from "@/lib/prisma";
import { priorityOptions, statusOptions } from "@/lib/constants";
import { buildLeadWhere, searchParamsFromRecord } from "@/services/leadFilters";

export default async function LeadsPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const paramsRecord = await searchParams;
  const params = searchParamsFromRecord(paramsRecord);
  const leads = await prisma.lead.findMany({
    where: buildLeadWhere(params),
    orderBy: [{ score: "desc" }, { createdAt: "desc" }],
    take: 500
  });
  const query = params.toString();

  return (
    <>
      <PageHeader
        title="Leads"
        description="Filtre, organize, importe e exporte oportunidades comerciais."
        actions={
          <>
            <Link className="btn-secondary" href="/import">
              <Upload size={16} />
              Importar
            </Link>
            <a className="btn-secondary" href={`/api/leads/export/csv${query ? `?${query}` : ""}`}>
              <Download size={16} />
              CSV
            </a>
            <a className="btn-secondary" href={`/api/leads/export/xlsx${query ? `?${query}` : ""}`}>
              <FileSpreadsheet size={16} />
              XLSX
            </a>
            <Link className="btn-primary" href="/leads/new">
              <Plus size={16} />
              Criar lead
            </Link>
          </>
        }
      />

      <form className="card mb-5 grid gap-3 p-4 md:grid-cols-5" action="/leads">
        <input className="field" name="q" placeholder="Buscar por nome" defaultValue={params.get("q") ?? ""} />
        <input className="field" name="city" placeholder="Cidade" defaultValue={params.get("city") ?? ""} />
        <input className="field" name="niche" placeholder="Nicho" defaultValue={params.get("niche") ?? ""} />
        <select className="field" name="status" defaultValue={params.get("status") ?? ""}>
          <option value="">Todos os status</option>
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select className="field" name="priority" defaultValue={params.get("priority") ?? ""}>
          <option value="">Todas prioridades</option>
          {priorityOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="flex gap-2 md:col-span-5">
          <button className="btn-primary" type="submit">
            Filtrar
          </button>
          <Link className="btn-secondary" href="/leads">
            Limpar
          </Link>
        </div>
      </form>

      <LeadTable leads={leads} />
    </>
  );
}
