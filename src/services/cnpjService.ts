import { onlyDigits } from "@/lib/format";
import type { CnpjData, CnpjProvider } from "@/types/cnpj";

type BrasilApiCnpjResponse = {
  cnpj: string;
  razao_social?: string;
  nome_fantasia?: string;
  descricao_situacao_cadastral?: string;
  data_inicio_atividade?: string;
  cnae_fiscal?: number;
  cnae_fiscal_descricao?: string;
  cnaes_secundarios?: Array<{
    codigo?: number;
    descricao?: string;
  }>;
  ddd_telefone_1?: string;
  ddd_telefone_2?: string;
  email?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  municipio?: string;
  uf?: string;
  capital_social?: number;
};

export class BrasilApiCnpjProvider implements CnpjProvider {
  private baseUrl = process.env.BRASILAPI_BASE_URL || "https://brasilapi.com.br/api";

  async getByCnpj(cnpj: string): Promise<CnpjData | null> {
    const digits = onlyDigits(cnpj);
    if (digits.length !== 14) return null;

    const response = await fetch(`${this.baseUrl}/cnpj/v1/${digits}`, {
      headers: {
        accept: "application/json",
        "user-agent": process.env.CRAWLER_USER_AGENT || "VioliSystems Lead CRM"
      },
      next: { revalidate: 60 * 60 * 24 }
    });

    if (response.status === 404) return null;
    if (!response.ok) {
      throw new Error("Falha ao consultar o provedor de CNPJ.");
    }

    const json = (await response.json()) as BrasilApiCnpjResponse;
    const address = [json.logradouro, json.numero, json.complemento].filter(Boolean).join(", ");

    return {
      cnpj: onlyDigits(json.cnpj),
      razaoSocial: json.razao_social,
      nomeFantasia: json.nome_fantasia,
      situacaoCadastral: json.descricao_situacao_cadastral,
      dataAbertura: json.data_inicio_atividade,
      cnaePrincipal: {
        code: json.cnae_fiscal ? String(json.cnae_fiscal) : undefined,
        description: json.cnae_fiscal_descricao
      },
      cnaesSecundarios: json.cnaes_secundarios?.map((cnae) => ({
        code: cnae.codigo ? String(cnae.codigo) : undefined,
        description: cnae.descricao
      })),
      telefone: json.ddd_telefone_1 || json.ddd_telefone_2,
      email: json.email,
      endereco: address || undefined,
      bairro: json.bairro,
      cidade: json.municipio,
      uf: json.uf,
      capitalSocial: json.capital_social
    };
  }
}

export class ReceitaDadosAbertosProvider implements CnpjProvider {
  async getByCnpj(): Promise<CnpjData | null> {
    throw new Error(
      "Provider de dados abertos da Receita Federal ainda não configurado. Importe os arquivos públicos e implemente a consulta local aqui."
    );
  }
}

export function getCnpjProvider(): CnpjProvider {
  const provider = process.env.CNPJ_PROVIDER || "brasilapi";
  if (provider === "receita-dados-abertos") return new ReceitaDadosAbertosProvider();
  return new BrasilApiCnpjProvider();
}

export const cnpjService = {
  getByCnpj(cnpj: string) {
    return getCnpjProvider().getByCnpj(cnpj);
  }
};
