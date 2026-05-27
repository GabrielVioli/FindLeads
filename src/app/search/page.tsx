import { PageHeader } from "@/components/PageHeader";
import { PublicSearchClient } from "@/components/tools/PublicSearchClient";

export default function SearchPage() {
  return (
    <>
      <PageHeader
        title="Buscar leads"
        description="Busca best-effort em páginas públicas, sem login, sem API paga, com delay e limite de concorrência."
      />
      <PublicSearchClient />
    </>
  );
}
