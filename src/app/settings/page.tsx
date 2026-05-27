import { PageHeader } from "@/components/PageHeader";

export default function SettingsPage() {
  const envItems = [
    ["DATABASE_URL", process.env.DATABASE_URL],
    ["CNPJ_PROVIDER", process.env.CNPJ_PROVIDER || "brasilapi"],
    ["BRASILAPI_BASE_URL", process.env.BRASILAPI_BASE_URL || "https://brasilapi.com.br/api"],
    ["CRAWLER_DELAY_MS", process.env.CRAWLER_DELAY_MS || "3000"],
    ["CRAWLER_CONCURRENCY", process.env.CRAWLER_CONCURRENCY || "2"],
    ["CRAWLER_MAX_PAGES", process.env.CRAWLER_MAX_PAGES || "50"]
  ];

  return (
    <>
      <PageHeader title="Configurações" description="Resumo das variáveis usadas pelo MVP local." />
      <section className="card overflow-hidden">
        <table className="min-w-full text-sm">
          <tbody className="divide-y divide-line">
            {envItems.map(([key, value]) => (
              <tr key={key}>
                <th className="w-64 bg-panel px-4 py-3 text-left font-semibold text-muted">{key}</th>
                <td className="px-4 py-3 text-ink">{value || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
