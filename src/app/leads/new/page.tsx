import { PageHeader } from "@/components/PageHeader";
import { LeadForm } from "@/components/leads/LeadForm";

export default function NewLeadPage() {
  return (
    <>
      <PageHeader title="Novo lead" description="Cadastre manualmente uma oportunidade comercial." />
      <LeadForm />
    </>
  );
}
