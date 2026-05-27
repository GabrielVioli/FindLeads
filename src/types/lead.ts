export const leadStatuses = [
  "NEW",
  "QUALIFIED",
  "CONTACTED",
  "RESPONDED",
  "PROPOSAL_SENT",
  "NEGOTIATION",
  "WON",
  "LOST",
  "ARCHIVED"
] as const;

export const leadPriorities = ["LOW", "MEDIUM", "HIGH"] as const;

export type LeadStatusValue = (typeof leadStatuses)[number];
export type LeadPriorityValue = (typeof leadPriorities)[number];
