import { PageHeader } from "@/components/PageHeader";
import { UrlExtractorClient } from "@/components/tools/UrlExtractorClient";

export default function UrlExtractorPage() {
  return (
    <>
      <PageHeader
        title="Extrair URLs"
        description="Cole páginas públicas para extrair telefone, e-mail, WhatsApp, Instagram e site quando disponíveis."
      />
      <UrlExtractorClient />
    </>
  );
}
