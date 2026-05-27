import ExcelJS from "exceljs";
import Papa from "papaparse";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { importRowSchema } from "@/lib/leadSchema";
import { createLead } from "@/services/leadService";
import { checkRateLimit, getRequestKey } from "@/lib/rateLimit";
import type { LeadStatusValue } from "@/types/lead";

export const runtime = "nodejs";

type ImportRow = Record<string, string | undefined>;

const statusMap: Record<string, LeadStatusValue> = {
  novo: "NEW",
  new: "NEW",
  qualificado: "QUALIFIED",
  qualified: "QUALIFIED",
  contatado: "CONTACTED",
  contacted: "CONTACTED",
  respondeu: "RESPONDED",
  responded: "RESPONDED",
  "proposta enviada": "PROPOSAL_SENT",
  proposal_sent: "PROPOSAL_SENT",
  negociação: "NEGOTIATION",
  negociacao: "NEGOTIATION",
  negotiation: "NEGOTIATION",
  fechado: "WON",
  won: "WON",
  perdido: "LOST",
  lost: "LOST",
  arquivado: "ARCHIVED",
  archived: "ARCHIVED"
};

function mapStatus(value?: string) {
  if (!value) return "NEW";
  return statusMap[value.trim().toLowerCase()] || "NEW";
}

function normalizeImportRow(row: ImportRow): ImportRow {
  return {
    ...row,
    Observações: row["Observações"] || row.Observacoes
  };
}

async function parseXlsx(file: File): Promise<ImportRow[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await file.arrayBuffer());
  const sheet = workbook.worksheets[0];
  if (!sheet) return [];

  const headers: string[] = [];
  sheet.getRow(1).eachCell((cell, colNumber) => {
    headers[colNumber] = String(cell.text || cell.value || "").trim();
  });

  const rows: ImportRow[] = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const item: ImportRow = {};
    headers.forEach((header, colNumber) => {
      if (!header) return;
      item[header] = String(row.getCell(colNumber).text || row.getCell(colNumber).value || "").trim();
    });
    if (Object.values(item).some(Boolean)) rows.push(item);
  });
  return rows;
}

async function parseCsv(file: File): Promise<ImportRow[]> {
  const text = await file.text();
  const parsed = Papa.parse<ImportRow>(text, {
    header: true,
    skipEmptyLines: true
  });
  return parsed.data;
}

export async function POST(request: Request) {
  const rate = checkRateLimit(`import:${getRequestKey(request)}`, 8, 60_000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Muitas importações. Tente novamente em instantes." }, { status: 429 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Envie um arquivo CSV ou XLSX." }, { status: 400 });
  }

  const lowerName = file.name.toLowerCase();
  const rows = lowerName.endsWith(".xlsx") ? await parseXlsx(file) : await parseCsv(file);
  let importedRows = 0;
  let failedRows = 0;
  let duplicateRows = 0;
  const errors: Array<{ row: number; error: string }> = [];

  for (const [index, row] of rows.entries()) {
    const parsed = importRowSchema.safeParse(normalizeImportRow(row));
    if (!parsed.success) {
      failedRows += 1;
      errors.push({ row: index + 2, error: "Linha inválida." });
      continue;
    }

    try {
      const result = await createLead({
        businessName: parsed.data.Nome,
        phone: parsed.data.Telefone,
        whatsapp: parsed.data.WhatsApp,
        email: parsed.data.Email,
        website: parsed.data.Site,
        instagram: parsed.data.Instagram,
        city: parsed.data.Cidade,
        state: parsed.data.Estado,
        niche: parsed.data.Nicho,
        source: parsed.data.Fonte,
        notes: parsed.data.Observações,
        status: mapStatus(parsed.data.Status),
        priority: "MEDIUM"
      });
      if (result.duplicate) duplicateRows += 1;
      else importedRows += 1;
    } catch {
      failedRows += 1;
      errors.push({ row: index + 2, error: "Não foi possível salvar." });
    }
  }

  await prisma.leadImport.create({
    data: {
      fileName: file.name,
      totalRows: rows.length,
      importedRows,
      failedRows
    }
  });

  return NextResponse.json({
    summary: {
      fileName: file.name,
      totalRows: rows.length,
      importedRows,
      failedRows,
      duplicateRows
    },
    errors: errors.slice(0, 30)
  });
}
