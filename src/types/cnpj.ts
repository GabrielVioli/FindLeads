export type CnpjData = {
  cnpj: string;
  razaoSocial?: string;
  nomeFantasia?: string;
  situacaoCadastral?: string;
  dataAbertura?: string;
  cnaePrincipal?: {
    code?: string;
    description?: string;
  };
  cnaesSecundarios?: Array<{
    code?: string;
    description?: string;
  }>;
  telefone?: string;
  email?: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  capitalSocial?: number;
};

export interface CnpjProvider {
  getByCnpj(cnpj: string): Promise<CnpjData | null>;
}
