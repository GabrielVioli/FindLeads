import { PageHeader } from "@/components/PageHeader";
import { CnpjSearchClient } from "@/components/tools/CnpjSearchClient";

export default function CnpjSearchPage() {
  return (
    <>
      <PageHeader
        title="Buscar empresas por CNPJ"
        description="Filtre empresas por cidade, UF, nicho, situação cadastral e data de abertura. O sistema encontra CNPJs públicos e enriquece os resultados."
      />
      <CnpjSearchClient />
    </>
  );
}
