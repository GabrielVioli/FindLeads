import ExcelJS from "exceljs";
import Papa from "papaparse";
import type { Lead } from "@prisma/client";
import { formatDate } from "@/lib/format";
import { priorityLabels, statusLabels } from "@/lib/constants";

const exportColumns = [
  ["businessName", "Nome"],
  ["tradeName", "Nome fantasia"],
  ["document", "CNPJ"],
  ["phone", "Telefone"],
  ["whatsapp", "WhatsApp"],
  ["email", "Email"],
  ["website", "Site"],
  ["instagram", "Instagram"],
  ["city", "Cidade"],
  ["state", "Estado"],
  ["niche", "Nicho"],
  ["status", "Status"],
  ["priority", "Prioridade"],
  ["score", "Score"],
  ["source", "Fonte"],
  ["createdAt", "Criado em"]
] as const;

function leadToRow(lead: Lead) {
  return {
    Nome: lead.businessName,
    "Nome fantasia": lead.tradeName ?? "",
    CNPJ: lead.document ?? "",
    Telefone: lead.phone ?? "",
    WhatsApp: lead.whatsapp ?? "",
    Email: lead.email ?? "",
    Site: lead.website ?? "",
    Instagram: lead.instagram ?? "",
    Cidade: lead.city ?? "",
    Estado: lead.state ?? "",
    Nicho: lead.niche ?? "",
    Status: statusLabels[lead.status],
    Prioridade: priorityLabels[lead.priority],
    Score: lead.score,
    Fonte: lead.source ?? "",
    "Criado em": formatDate(lead.createdAt)
  };
}

export function exportLeadsToCsv(leads: Lead[]) {
  return Papa.unparse(leads.map(leadToRow), {
    quotes: true,
    delimiter: ","
  });
}

export async function exportLeadsToXlsx(leads: Lead[]) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Lead CRM";
  workbook.created = new Date();
  const sheet = workbook.addWorksheet("Leads");

  sheet.columns = exportColumns.map(([, header]) => ({
    header,
    key: header,
    width: Math.max(14, header.length + 4)
  }));

  leads.map(leadToRow).forEach((row) => sheet.addRow(row));
  sheet.getRow(1).font = { bold: true };
  sheet.views = [{ state: "frozen", ySplit: 1 }];

  return workbook.xlsx.writeBuffer();
}
