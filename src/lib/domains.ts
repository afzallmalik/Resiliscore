// src/lib/domains.ts

export type DomainDef = {
  code: string;   // must match Question.domain exactly in DB
  short: string;  // short label for charts
  order: number;  // fixed display order
};

export const ACTIVE_MODEL_VERSION = "v3.0";

// v1.3 domain registry (single source of truth)
export const DOMAINS_V13: DomainDef[] = [
  { code: "Governance & Leadership", short: "Governance", order: 1 },
  { code: "Risk & Compliance", short: "Risk", order: 2 },
  { code: "Asset & Data Management", short: "Assets", order: 3 },
  { code: "Identity & Access Management", short: "Identity", order: 4 },
  { code: "Secure Operations", short: "Operations", order: 5 },
  { code: "Threat & Vulnerability Management", short: "Exposure", order: 6 },
  { code: "Incident Detection & Response", short: "Response", order: 7 },
  { code: "Resilience & Recovery", short: "Recovery", order: 8 },
  { code: "Third-Party & Supply Chain", short: "Suppliers", order: 9 },
];

export const DOMAIN_SHORT_BY_CODE: Record<string, string> = Object.fromEntries(
  DOMAINS_V13.map((d) => [d.code, d.short])
);

export const DOMAIN_ORDER_BY_CODE: Record<string, number> = Object.fromEntries(
  DOMAINS_V13.map((d) => [d.code, d.order])
);