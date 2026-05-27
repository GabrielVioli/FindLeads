# Lead CRM

Sistema web local para prospeccao e organizacao de leads comerciais para venda de sites, landing pages, sistemas e automacoes.

O MVP inclui cadastro manual, importacao CSV/XLSX, exportacao CSV/XLSX, dashboard, CRM por status, busca por CNPJ via provider publico, extracao de dados em URLs publicas e busca publica controlada por nicho/cidade.

## Stack

- Next.js 15.5
- TypeScript
- Tailwind CSS
- Prisma ORM
- SQLite para desenvolvimento local
- Zod
- React Hook Form
- TanStack Table
- ExcelJS
- PapaParse e csv-writer
- Cheerio
- p-limit
- dotenv

## Instalacao

```bash
npm install
```

Crie o arquivo `.env` a partir de `.env.example`:

```bash
cp .env.example .env
```

No Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

## Variaveis de ambiente

```env
DATABASE_URL="file:./dev.db"
APP_URL="http://localhost:3000"
AUTH_SECRET="change-this-secret"
CNPJ_PROVIDER="brasilapi"
BRASILAPI_BASE_URL="https://brasilapi.com.br/api"
CNPJ_API_KEY=""
CNPJ_API_BASE_URL=""
CRAWLER_USER_AGENT="VioliSystems Lead CRM"
CRAWLER_DELAY_MS="1000"
CRAWLER_CONCURRENCY="4"
CRAWLER_MAX_PAGES="24"
```

## Banco local com SQLite

O projeto usa Prisma com SQLite em desenvolvimento. Para criar ou atualizar o banco:

```bash
npx prisma migrate dev
```

Para abrir o Prisma Studio:

```bash
npx prisma studio
```

## Rodar o projeto

```bash
npm run dev
```

Acesse:

```text
http://localhost:3000
```

## Build

```bash
npm run build
```

## Uso principal

- Dashboard: `/dashboard`
- Lista de leads: `/leads`
- Criar lead manualmente: `/leads/new`
- CRM: `/crm`
- Importar planilha: `/import`
- Buscar CNPJ: `/cnpj-search`
- Buscar leads publicos: `/search`
- Extrair dados de URLs: `/tools/url-extractor`

## Importacao

A tela `/import` aceita arquivos `.csv` ou `.xlsx` com estas colunas:

```text
Nome, Telefone, WhatsApp, Email, Site, Instagram, Cidade, Estado, Nicho, Fonte, Observacoes, Status
```

Tambem e aceito o cabecalho `Observações` com acento.

O importador valida linhas, ignora duplicados, registra resumo em `LeadImport` e mostra totais de importados, duplicados e falhas.

## Exportacao

Na tela `/leads`, os botoes CSV e XLSX geram:

- `leads.csv`
- `leads.xlsx`

Os filtros aplicados na listagem sao enviados para a exportacao.

## Deduplicacao

O sistema evita duplicados usando:

- CNPJ
- WhatsApp
- telefone
- e-mail
- site
- nome da empresa + cidade

## Score

O score e recalculado ao criar ou atualizar lead:

- Tem WhatsApp: +3
- Tem e-mail: +2
- Tem site: +1
- Nao tem site: +4
- Tem Instagram: +2
- Cidade prioritaria configurada em `PRIORITY_CITIES`: +1
- Nicho prioritario: +2
- Empresa ativa: +2
- Aberta nos ultimos 24 meses: +2

## CNPJ

O servico `cnpjService` usa uma interface modular:

```ts
interface CnpjProvider {
  getByCnpj(cnpj: string): Promise<CnpjData | null>
}
```

O provider inicial usa BrasilAPI sem chave paga. Tambem existe um provider placeholder para dados abertos da Receita Federal, preparado para uma futura consulta local em arquivos publicos estruturados.

## Busca publica

A busca em `/search` e best-effort:

- nao usa Google Maps;
- nao depende de login em redes sociais;
- nao burla captcha;
- aplica delay;
- controla concorrencia;
- limita resultados;
- isola o adaptador de busca em `searchService`.

Por depender de resultados publicos e paginas de terceiros, a qualidade pode variar. Para uso comercial serio, revise manualmente os resultados antes de salvar ou contatar qualquer empresa.

## Uso responsavel e LGPD

Este projeto foi desenhado para organizar dados comerciais publicos e contatos manuais. Ele nao implementa disparo em massa, bot de WhatsApp, envio automatico de mensagens ou scraping agressivo.

Use apenas dados obtidos de fontes publicas legitimas, mantenha base legal adequada para contato comercial, respeite pedidos de remocao e registre observacoes relevantes no historico do lead.

## Proximos passos

- Autenticacao real de usuarios.
- Edicao completa do lead em tela separada.
- Drag and drop no kanban.
- Configuracao visual de nichos e cidades prioritarias.
- Importador local dos dados abertos da Receita Federal.
- Testes automatizados para importacao, score e deduplicacao.
