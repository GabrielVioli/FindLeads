import type { LeadInput } from "@/lib/leadSchema";
import type { CnpjData } from "@/types/cnpj";
import type { PublicLeadResult } from "@/types/search";

export function cnpjDataToLeadInput(data: CnpjData): LeadInput {
  return {
    businessName: data.razaoSocial || data.nomeFantasia || `CNPJ ${data.cnpj}`,
    tradeName: data.nomeFantasia,
    document: data.cnpj,
    documentType: "CNPJ",
    phone: data.telefone,
    whatsapp: data.telefone,
    email: data.email,
    website: undefined,
    instagram: undefined,
    city: data.cidade,
    state: data.uf,
    neighborhood: data.bairro,
    address: data.endereco,
    niche: data.cnaePrincipal?.description,
    cnaeCode: data.cnaePrincipal?.code,
    cnaeDescription: data.cnaePrincipal?.description,
    companyStatus: data.situacaoCadastral,
    openingDate: data.dataAbertura ? new Date(data.dataAbertura) : undefined,
    source: "BrasilAPI",
    sourceUrl: `https://brasilapi.com.br/api/cnpj/v1/${data.cnpj}`,
    status: "NEW",
    priority: "MEDIUM",
    notes: undefined,
    lastContactAt: undefined,
    nextActionAt: undefined
  };
}

export function publicResultToLeadInput(result: PublicLeadResult): LeadInput {
  return {
    businessName: result.businessName,
    tradeName: undefined,
    document: undefined,
    documentType: undefined,
    phone: result.phone,
    whatsapp: result.whatsapp,
    email: result.email,
    website: result.website,
    instagram: result.instagram,
    city: result.city,
    state: result.state,
    neighborhood: undefined,
    address: undefined,
    niche: result.niche,
    cnaeCode: undefined,
    cnaeDescription: undefined,
    companyStatus: undefined,
    openingDate: undefined,
    source: result.source,
    sourceUrl: result.sourceUrl,
    status: "NEW",
    priority: "MEDIUM",
    notes: undefined,
    lastContactAt: undefined,
    nextActionAt: undefined
  };
}
