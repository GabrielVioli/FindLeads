import type { LeadPriorityValue, LeadStatusValue } from "@/types/lead";

export const statusLabels: Record<LeadStatusValue, string> = {
  NEW: "Novo",
  QUALIFIED: "Qualificado",
  CONTACTED: "Contatado",
  RESPONDED: "Respondeu",
  PROPOSAL_SENT: "Proposta enviada",
  NEGOTIATION: "Negociação",
  WON: "Fechado",
  LOST: "Perdido",
  ARCHIVED: "Arquivado"
};

export const pipelineStatuses: LeadStatusValue[] = [
  "NEW",
  "QUALIFIED",
  "CONTACTED",
  "RESPONDED",
  "PROPOSAL_SENT",
  "NEGOTIATION",
  "WON",
  "LOST"
];

export const priorityLabels: Record<LeadPriorityValue, string> = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta"
};

export const statusOptions = Object.entries(statusLabels).map(([value, label]) => ({
  value,
  label
}));

export const priorityOptions = Object.entries(priorityLabels).map(([value, label]) => ({
  value,
  label
}));
