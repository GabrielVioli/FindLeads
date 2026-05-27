import { PageHeader } from "@/components/PageHeader";
import { ImportLeadsClient } from "@/components/tools/ImportLeadsClient";

export default function ImportPage() {
  return (
    <>
      <PageHeader title="Importar leads" description="Envie uma planilha CSV ou XLSX e o sistema validará linha a linha." />
      <ImportLeadsClient />
    </>
  );
}
