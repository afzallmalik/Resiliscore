export type ImplementationEffort = "Low" | "Medium" | "High";
export type ImplementationCost = "£" | "££" | "£££";
export type ImplementationType = "Tool" | "Process" | "Policy" | "Tool + process" | "Policy + process";

export type ImplementationGuidance = {
  controlRequired: string;
  plainEnglish: string;
  technologyCategories: string[];
  technologyAsk: string;
  whatToAsk: string[];
  typicalSmeApproach: string;
  effort: ImplementationEffort;
  cost: ImplementationCost;
  maturityImpact: string;
  checklist: {
    controlCategory: string;
    implementationType: ImplementationType;
    priority: "High" | "Medium" | "Low";
    outcome: string;
  };
};

export type TechnologySnapshotItem = {
  area: string;
  whyItMatters: string;
  whatToAskFor: string[];
  evidenceToRequest: string[];
  typicalOwner: string;
  effort: ImplementationEffort;
  cost: ImplementationCost;
};

type KeywordRule = {
  match: string[];
  guidance: ImplementationGuidance;
};

const DEFAULT_GUIDANCE: ImplementationGuidance = {
  controlRequired: "Defined ownership and repeatable control routine",
  plainEnglish:
    "This area appears too informal. The business may rely on memory, individual effort, or undocumented routines rather than a control that works consistently.",
  technologyCategories: [
    "Policy and procedure management",
    "Action tracking",
    "Evidence storage",
    "Management reporting",
  ],
  technologyAsk:
    "Ask for a simple routine or tool that shows who owns the control, how often it runs, what is overdue, and what evidence proves completion.",
  whatToAsk: [
    "Who owns this control and how often is it reviewed?",
    "What evidence proves the control has operated?",
    "How are overdue actions and exceptions reported?",
  ],
  typicalSmeApproach:
    "Define the minimum control, assign one owner, agree how often it runs, and keep evidence in one shared place. Avoid buying more complexity until the routine is working.",
  effort: "Medium",
  cost: "£",
  maturityImpact: "Level 1 -> Level 2",
  checklist: {
    controlCategory: "Governance control",
    implementationType: "Policy + process",
    priority: "Medium",
    outcome: "A named owner, a repeatable routine, and evidence that the routine has happened at least once.",
  },
};

const RULES: KeywordRule[] = [
  {
    match: ["identity", "access", "password", "account", "user", "mfa", "admin", "login", "privilege"],
    guidance: {
      controlRequired: "Controlled access to key accounts and systems",
      plainEnglish:
        "Weak identity controls are one of the fastest routes into a small business. Email, cloud accounts, finance systems, shared logins, and admin privileges are especially risky if MFA and access reviews are inconsistent.",
      technologyCategories: [
        "Multi-factor authentication",
        "Identity and access management",
        "Privileged access control",
        "Password management",
      ],
      technologyAsk:
        "Ask for MFA coverage across email, cloud, finance, admin, and remote access; no shared admin logins; password vaulting; leaver removal; and quarterly access reviews.",
      whatToAsk: [
        "Is MFA enforced for email, cloud systems, finance tools, remote access, and admin accounts?",
        "Are admin accounts separated from everyday user accounts?",
        "How are joiners, movers, and leavers handled and evidenced?",
        "Can we see who has access to critical systems and when that access was last reviewed?",
      ],
      typicalSmeApproach:
        "Switch on MFA for email, cloud systems, finance tools, and admin accounts. Remove shared logins, use a password manager, separate admin accounts from daily accounts, and review access when people join, move role, or leave.",
      effort: "Low",
      cost: "£",
      maturityImpact: "Level 1 -> Level 3",
      checklist: {
        controlCategory: "Access control",
        implementationType: "Tool + process",
        priority: "High",
        outcome: "MFA is enabled for key accounts, admin access is limited, shared logins are removed, and leavers are removed quickly.",
      },
    },
  },
  {
    match: ["operation", "secure operations", "routine", "change", "configuration", "logging", "device"],
    guidance: {
      controlRequired: "Repeatable security operating routines",
      plainEnglish:
        "Many incidents start because routine tasks are inconsistent: updates, backup checks, endpoint alerts, device health, access changes, or basic reviews.",
      technologyCategories: [
        "Device management",
        "Patch management",
        "Endpoint protection management",
        "Backup monitoring",
      ],
      technologyAsk:
        "Ask for a monthly operational report showing patch status, device health, endpoint alerts, backup status, overdue items, exceptions, and actions closed.",
      whatToAsk: [
        "Do we get a monthly report showing patching, device health, endpoint alerts, and backup status?",
        "Who checks failed backups, missing updates, and unresolved endpoint alerts?",
        "How are exceptions recorded when something cannot be fixed immediately?",
        "Can the provider show evidence that routine checks actually happened?",
      ],
      typicalSmeApproach:
        "Create a weekly or monthly security routine covering updates, backup checks, endpoint alerts, access changes, and evidence checks. Keep the routine short enough that it actually happens.",
      effort: "Medium",
      cost: "££",
      maturityImpact: "Level 1 -> Level 3",
      checklist: {
        controlCategory: "Operational security",
        implementationType: "Tool + process",
        priority: "High",
        outcome: "Core security tasks run on a set schedule, exceptions are tracked, and there is proof the routine happened.",
      },
    },
  },
  {
    match: ["governance", "leadership", "board", "ownership", "management"],
    guidance: {
      controlRequired: "Clear cyber resilience ownership and decision routine",
      plainEnglish:
        "If nobody clearly owns cyber resilience, weak areas drift. Decisions become reactive and important actions stay open too long.",
      technologyCategories: [
        "Governance dashboard",
        "Risk and action tracker",
        "Policy and procedure management",
        "Evidence storage",
      ],
      technologyAsk:
        "Ask for a simple management view showing open cyber risks, overdue actions, policy status, control evidence, and who owns each item.",
      whatToAsk: [
        "Who is the named owner for cyber resilience?",
        "Is there a monthly or quarterly leadership review of risks and actions?",
        "Can we see overdue actions, accepted risks, and evidence in one place?",
        "How are cyber decisions recorded so they can be explained later?",
      ],
      typicalSmeApproach:
        "Nominate one accountable owner, run a short monthly review, track open actions, and keep evidence in one place. This can start in a spreadsheet, but should eventually be visible to leadership without chasing people.",
      effort: "Low",
      cost: "£",
      maturityImpact: "Level 1 -> Level 3",
      checklist: {
        controlCategory: "Governance and ownership",
        implementationType: "Policy + process",
        priority: "High",
        outcome: "A named owner exists, top risks are reviewed monthly, and open actions have owners and target dates.",
      },
    },
  },
  {
    match: ["risk", "compliance", "obligation", "policy"],
    guidance: {
      controlRequired: "Risk tracking, compliance evidence, and action ownership",
      plainEnglish:
        "Known risks become expensive when they are not tracked. A simple register stops issues disappearing into conversations or inboxes.",
      technologyCategories: [
        "Risk register",
        "Compliance evidence tracker",
        "Policy acknowledgement tracking",
        "Action management",
      ],
      technologyAsk:
        "Ask for a risk register that links each risk to an owner, action, target date, current status, and evidence of completion or accepted risk.",
      whatToAsk: [
        "Can we see the top risks, owners, target dates, and current status?",
        "How are overdue actions escalated?",
        "Where is evidence stored for client, insurer, or supplier assurance questions?",
        "How are accepted risks signed off and reviewed again later?",
      ],
      typicalSmeApproach:
        "Create a simple risk list, score each risk in business terms, assign an owner, and review progress every month. Keep evidence with the action rather than scattered across inboxes.",
      effort: "Low",
      cost: "£",
      maturityImpact: "Level 1 -> Level 3",
      checklist: {
        controlCategory: "Risk management",
        implementationType: "Process",
        priority: "High",
        outcome: "Top cyber risks are recorded, owned, reviewed, and linked to clear actions and evidence.",
      },
    },
  },
  {
    match: ["asset", "data", "information", "inventory", "system"],
    guidance: {
      controlRequired: "Critical asset and data inventory",
      plainEnglish:
        "You cannot protect or recover what you cannot identify quickly. This weakness slows decisions during incidents and makes protection inconsistent.",
      technologyCategories: [
        "Asset inventory",
        "Data classification",
        "Device management",
        "Secure disposal tracking",
      ],
      technologyAsk:
        "Ask for an inventory of devices, key systems, data locations, owners, criticality, lifecycle status, and where sensitive data is stored.",
      whatToAsk: [
        "Can we list all critical systems, devices, and data stores?",
        "Who owns each critical system or dataset?",
        "How are new devices, systems, and data locations added to the inventory?",
        "How is old equipment or data disposed of securely?",
      ],
      typicalSmeApproach:
        "List key systems, devices, and sensitive data. Mark what is critical, who owns it, where it is stored, and what must be recovered first if something goes wrong.",
      effort: "Medium",
      cost: "££",
      maturityImpact: "Level 1 -> Level 3",
      checklist: {
        controlCategory: "Asset and data control",
        implementationType: "Tool + process",
        priority: "High",
        outcome: "Critical systems and sensitive data are listed, owned, and reviewed when things change.",
      },
    },
  },
  {
    match: ["threat", "vulnerability", "patch", "scan", "weakness", "remediation"],
    guidance: {
      controlRequired: "Vulnerability and update management",
      plainEnglish:
        "Attackers often use known weaknesses that already have fixes. The issue is usually not complexity; it is lack of routine and visibility.",
      technologyCategories: [
        "Vulnerability scanning",
        "Patch management",
        "Endpoint protection",
        "Remediation tracking",
      ],
      technologyAsk:
        "Ask for regular vulnerability visibility, patch reporting, risk-based prioritisation, overdue fix tracking, and exception sign-off when something cannot be patched quickly.",
      whatToAsk: [
        "How often are systems scanned or reviewed for known weaknesses?",
        "Do we receive patch status and overdue remediation reports?",
        "How are high-risk weaknesses prioritised?",
        "How are exceptions signed off when a fix cannot be applied?",
      ],
      typicalSmeApproach:
        "Keep systems updated automatically where possible, scan important devices, and track higher-risk fixes to completion. Use criticality to decide what must be fixed first.",
      effort: "Medium",
      cost: "££",
      maturityImpact: "Level 1 -> Level 3",
      checklist: {
        controlCategory: "Threat and vulnerability control",
        implementationType: "Tool + process",
        priority: "High",
        outcome: "Important systems are updated, higher-risk weaknesses are tracked, and overdue fixes are visible.",
      },
    },
  },
  {
    match: ["incident", "response", "detection", "detect", "alert", "monitoring"],
    guidance: {
      controlRequired: "Incident monitoring, escalation, and response plan",
      plainEnglish:
        "When something goes wrong, delays and confusion increase damage. Clear alerts, response ownership, and escalation steps help people act quickly and consistently.",
      technologyCategories: [
        "Security monitoring and alerting",
        "Endpoint detection and response",
        "Log collection for key systems",
        "Incident response planning",
      ],
      technologyAsk:
        "Ask what alerts are monitored, who responds, expected response times, escalation steps, out-of-hours coverage, and whether incident notes and lessons learned are recorded.",
      whatToAsk: [
        "Which alerts are monitored and who responds to them?",
        "What is the expected response time for serious alerts?",
        "Is there an incident response plan and escalation route?",
        "Are incidents, exercises, and lessons learned recorded?",
      ],
      typicalSmeApproach:
        "Define who responds to common incidents, where alerts go, how escalation works, and what evidence is kept. Run a simple tabletop exercise at least once a year.",
      effort: "Medium",
      cost: "££",
      maturityImpact: "Level 1 -> Level 3",
      checklist: {
        controlCategory: "Incident response",
        implementationType: "Tool + process",
        priority: "High",
        outcome: "A response plan exists, alerts are reviewed, escalation is clear, and at least one exercise or incident review has been completed.",
      },
    },
  },
  {
    match: ["recovery", "resilience", "backup", "continuity", "restore", "disaster"],
    guidance: {
      controlRequired: "Backup, recovery, and continuity assurance",
      plainEnglish:
        "Backups only matter if they can be restored. Without testing, the business may discover problems at the worst possible time.",
      technologyCategories: [
        "Cloud backup",
        "Immutable or separated backup storage",
        "Disaster recovery",
        "Recovery testing",
      ],
      technologyAsk:
        "Ask what is backed up, how often, how long it is kept, whether ransomware can delete it, who monitors failures, and how quickly key systems can be restored.",
      whatToAsk: [
        "What systems and data are backed up, and what is excluded?",
        "How often are backups monitored and restore-tested?",
        "Is at least one backup copy protected from normal user access or ransomware deletion?",
        "What is the expected restore time for critical systems?",
      ],
      typicalSmeApproach:
        "Back up critical data automatically, keep at least one protected copy separated from normal user access, and test restoring a file or system. Document what must be restored first if the business is under pressure.",
      effort: "Low",
      cost: "££",
      maturityImpact: "Level 1 -> Level 3",
      checklist: {
        controlCategory: "Backup and recovery",
        implementationType: "Tool + process",
        priority: "High",
        outcome: "Critical data is backed up automatically and a recent restore test proves it can be recovered.",
      },
    },
  },
  {
    match: ["third", "supplier", "supply", "vendor", "party", "msp", "outsourced"],
    guidance: {
      controlRequired: "Supplier access, dependency, and assurance control",
      plainEnglish:
        "Suppliers can become hidden single points of failure. The risk is higher when access, responsibilities, or minimum expectations are unclear.",
      technologyCategories: [
        "Supplier risk management",
        "Third-party access review",
        "Contract and evidence storage",
        "Service continuity tracking",
      ],
      technologyAsk:
        "Ask for a list of critical suppliers, what they access, how incidents are reported, backup or service commitments, named owners, and evidence that basic controls are reviewed.",
      whatToAsk: [
        "Which suppliers support critical systems, data, or operations?",
        "What access does each supplier have and when was it reviewed?",
        "What evidence can suppliers provide about basic controls?",
        "What happens if a key supplier is unavailable or has an incident?",
      ],
      typicalSmeApproach:
        "List critical suppliers, confirm what systems or data they can access, document minimum security expectations, and review evidence annually. Focus first on suppliers that hold data or support critical systems.",
      effort: "Medium",
      cost: "£",
      maturityImpact: "Level 1 -> Level 3",
      checklist: {
        controlCategory: "Third-party control",
        implementationType: "Process",
        priority: "Medium",
        outcome: "Critical suppliers are listed, access is known, minimum security expectations are documented, and supplier evidence is reviewed at least annually.",
      },
    },
  },
];

export function getImplementationGuidance(domainNameOrCode: string): ImplementationGuidance {
  const value = String(domainNameOrCode || "").toLowerCase();
  const rule = RULES.find((item) => item.match.some((word) => value.includes(word)));
  return rule?.guidance ?? DEFAULT_GUIDANCE;
}

export function getImplementationAction(domainNameOrCode: string) {
  const guidance = getImplementationGuidance(domainNameOrCode);
  return {
    title: guidance.controlRequired,
    why: guidance.typicalSmeApproach,
    guidance,
  };
}

export function getTechnologySnapshotItem(domainNameOrCode: string): TechnologySnapshotItem {
  const guidance = getImplementationGuidance(domainNameOrCode);
  return {
    area: domainNameOrCode,
    whyItMatters: guidance.plainEnglish,
    whatToAskFor: [guidance.controlRequired, ...guidance.technologyCategories, ...guidance.whatToAsk],
    evidenceToRequest: [
      guidance.checklist.outcome,
      "Monthly or quarterly status report",
      "Proof the control has operated, not just that it exists",
    ],
    typicalOwner:
      guidance.checklist.controlCategory === "Access control"
        ? "IT owner, MSP, or operations lead"
        : guidance.checklist.controlCategory === "Governance and ownership"
        ? "Leadership owner or operations lead"
        : "Operational owner, IT support, or MSP",
    effort: guidance.effort,
    cost: guidance.cost,
  };
}

/**
 * ------------------------------
 * Dynamic provider brief logic
 * ------------------------------
 * This keeps the report vendor-neutral, but makes the provider brief more specific
 * when individual assessment responses are available. If response rows are not
 * available in the current environment, it safely falls back to domain-level guidance.
 */
export type DynamicProviderContext = {
  questions?: any[];
  responses?: any[];
};

type DynamicFinding = {
  key: string;
  label: string;
  severity: number;
  plainEnglish: string;
  technologyAsk: string;
  whatToAsk: string[];
  typicalSmeApproach: string;
  evidence: string[];
};

function normaliseText(value: unknown) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function questionKey(question: any) {
  const id = question?.id ?? question?.questionId ?? question?.question_id;
  if (id) return normaliseText(id);
  const domain = question?.domain ?? question?.domain_name ?? question?.domainName ?? "";
  const order = question?.order ?? question?.position ?? question?.number ?? "";
  return normaliseText(`${domain}-${order}`);
}

function responseQuestionKey(response: any) {
  const id = response?.questionId ?? response?.question_id ?? response?.questionKey ?? response?.question_key ?? response?.id;
  if (id) return normaliseText(id);
  const domain = response?.domain ?? response?.domain_name ?? response?.domainName ?? "";
  const order = response?.order ?? response?.position ?? response?.number ?? "";
  return normaliseText(`${domain}-${order}`);
}

function responseScore(response: any): number | null {
  const raw =
    response?.score ??
    response?.value ??
    response?.answerScore ??
    response?.maturityScore ??
    response?.maturity_score ??
    response?.rating;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function domainMatches(question: any, domainNameOrCode: string) {
  const domain = normaliseText(question?.domain ?? question?.domain_name ?? question?.domainName ?? question?.domain_code ?? "");
  const target = normaliseText(domainNameOrCode);
  if (!domain || !target) return false;
  return target.includes(domain) || domain.includes(target.split(" ")[0]);
}

function buildQuestionResponsePairs(domainNameOrCode: string, context?: DynamicProviderContext) {
  const questions = Array.isArray(context?.questions) ? context!.questions! : [];
  const responses = Array.isArray(context?.responses) ? context!.responses! : [];
  if (!questions.length || !responses.length) return [] as { question: any; response: any; score: number }[];

  const responsesByKey = new Map<string, any>();
  for (const response of responses) {
    const key = responseQuestionKey(response);
    if (key) responsesByKey.set(key, response);
  }

  const pairs: { question: any; response: any; score: number }[] = [];
  for (const question of questions) {
    if (!domainMatches(question, domainNameOrCode)) continue;

    const candidates = [
      questionKey(question),
      normaliseText(`${question?.domain ?? question?.domain_name ?? ""}-${question?.order ?? ""}`),
      normaliseText(`${question?.domain ?? question?.domain_name ?? ""}:${question?.order ?? ""}`),
      normaliseText(`${question?.domain ?? question?.domain_name ?? ""}_${question?.order ?? ""}`),
    ].filter(Boolean);

    let response: any = undefined;
    for (const key of candidates) {
      response = responsesByKey.get(key);
      if (response) break;
    }

    // Fallback: match by domain/order when rows store those directly.
    if (!response) {
      response = responses.find((r) => {
        const sameDomain = normaliseText(r?.domain ?? r?.domain_name ?? r?.domainName ?? "") === normaliseText(question?.domain ?? question?.domain_name ?? "");
        const sameOrder = String(r?.order ?? r?.position ?? r?.number ?? "") === String(question?.order ?? question?.position ?? question?.number ?? "");
        return sameDomain && sameOrder;
      });
    }

    const score = responseScore(response);
    if (response && score !== null) pairs.push({ question, response, score });
  }

  return pairs;
}

function hasAny(text: string, words: string[]) {
  return words.some((word) => text.includes(word));
}

function buildDynamicFindings(domainNameOrCode: string, context?: DynamicProviderContext): DynamicFinding[] {
  const target = normaliseText(domainNameOrCode);
  const pairs = buildQuestionResponsePairs(domainNameOrCode, context);
  const weakPairs = pairs.filter((p) => p.score <= 2.4);
  const sourcePairs = weakPairs.length ? weakPairs : pairs.filter((p) => p.score <= 3);

  const findings: DynamicFinding[] = [];
  const add = (finding: DynamicFinding) => {
    if (!findings.some((f) => f.key === finding.key)) findings.push(finding);
  };

  for (const pair of sourcePairs) {
    const prompt = normaliseText(`${pair.question?.prompt ?? ""} ${pair.question?.helpText ?? ""}`);
    const severity = pair.score;

    if (target.includes("recovery") || target.includes("resilience")) {
      if (hasAny(prompt, ["backup", "backups"]) && !hasAny(prompt, ["restore", "test"])) {
        add({
          key: "backup-coverage",
          label: "Backup coverage appears weak or unproven",
          severity,
          plainEnglish: "The issue appears to be backup coverage or backup monitoring, not just general recovery planning.",
          technologyAsk: "Ask for automated backup coverage across critical data, monitored failures, retention periods, and a protected backup copy.",
          whatToAsk: [
            "Which systems and data are backed up, and which are excluded?",
            "How are backup failures monitored and escalated?",
            "Is at least one copy protected from normal user access or ransomware deletion?",
          ],
          typicalSmeApproach: "Confirm the critical systems first, turn on automated backup for those systems, monitor failures, and keep at least one protected copy.",
          evidence: ["Backup coverage report", "Recent backup success/failure report", "Protected copy or retention configuration"],
        });
      }
      if (hasAny(prompt, ["restore", "test", "tested", "recovered"])) {
        add({
          key: "restore-testing",
          label: "Recovery testing is the main gap",
          severity,
          plainEnglish: "Backups may exist, but the weak point appears to be proving they can actually be restored under pressure.",
          technologyAsk: "Ask for scheduled restore testing, restore evidence, recovery time expectations, and documented recovery priorities.",
          whatToAsk: [
            "When was the last restore test completed?",
            "How long did recovery take for a critical file or system?",
            "What evidence proves the restore worked?",
          ],
          typicalSmeApproach: "Do not start by buying more tools. First test restoring a critical file or system, record the result, and agree how often restore testing will repeat.",
          evidence: ["Restore test result", "Recovery time record", "Recovery runbook or priority list"],
        });
      }
      if (hasAny(prompt, ["dependency", "dependencies", "critical service", "continuity", "runbook"])) {
        add({
          key: "recovery-dependencies",
          label: "Recovery priorities are not clear enough",
          severity,
          plainEnglish: "The business may not have a clear enough view of which systems, people, suppliers, and data must recover first.",
          technologyAsk: "Ask for a simple recovery runbook that lists critical systems, dependencies, owners, recovery priorities, and fallback steps.",
          whatToAsk: [
            "Which systems must be restored first?",
            "Who owns each recovery step?",
            "Which suppliers or people are required to recover operations?",
          ],
          typicalSmeApproach: "Create a one-page recovery runbook before adding complexity. List critical services, owners, dependencies, and the first actions during disruption.",
          evidence: ["Critical services list", "Recovery runbook", "Dependency map"],
        });
      }
    }

    if (target.includes("identity") || target.includes("access")) {
      if (hasAny(prompt, ["mfa", "multi factor", "multifactor", "two factor", "2fa"])) {
        add({
          key: "mfa",
          label: "MFA coverage is the immediate identity priority",
          severity,
          plainEnglish: "The response pattern suggests the business should prioritise MFA coverage before more advanced identity tooling.",
          technologyAsk: "Ask for MFA enforcement across email, cloud apps, finance systems, admin accounts, and remote access.",
          whatToAsk: [
            "Is MFA enforced for email, cloud, finance, admin, and remote access?",
            "Are any users or systems excluded from MFA?",
            "Can we see a report showing MFA status?",
          ],
          typicalSmeApproach: "Switch on MFA for the highest-risk accounts first: email, admin, finance, cloud platforms, and remote access.",
          evidence: ["MFA status report", "List of exclusions", "Admin MFA confirmation"],
        });
      }
      if (hasAny(prompt, ["admin", "privilege", "privileged", "administrator"])) {
        add({
          key: "admin-access",
          label: "Admin access needs tightening",
          severity,
          plainEnglish: "The weakness appears to involve privileged accounts, which can create serious disruption if misused or compromised.",
          technologyAsk: "Ask for admin account separation, privileged access review, logging, and removal of unnecessary admin rights.",
          whatToAsk: [
            "Who has admin access and why?",
            "Are admin accounts separate from daily accounts?",
            "When was admin access last reviewed?",
          ],
          typicalSmeApproach: "Separate admin accounts from everyday accounts, remove unused privileges, and review admin access quarterly.",
          evidence: ["Admin access list", "Quarterly access review", "Removed privilege evidence"],
        });
      }
      if (hasAny(prompt, ["joiner", "mover", "leaver", "starter", "leavers", "removed", "access review", "reviewed"])) {
        add({
          key: "jml-access",
          label: "Joiner, mover, leaver control is weak",
          severity,
          plainEnglish: "Access may remain active too long or change informally when people join, move role, or leave.",
          technologyAsk: "Ask for a joiner/mover/leaver process, access review evidence, and prompt removal of old accounts.",
          whatToAsk: [
            "How quickly are leavers removed from systems?",
            "Who approves access changes?",
            "Can we see recent access review evidence?",
          ],
          typicalSmeApproach: "Use a simple checklist for every joiner, mover, and leaver. Keep evidence that accounts were created, changed, or removed.",
          evidence: ["Joiner/mover/leaver checklist", "Leaver removal evidence", "Access review record"],
        });
      }
    }

    if (target.includes("incident") || target.includes("response") || target.includes("detection")) {
      if (hasAny(prompt, ["alert", "monitor", "monitoring", "detect", "detection", "log", "logging"])) {
        add({
          key: "monitoring-alerts",
          label: "Alerting and monitoring need clearer ownership",
          severity,
          plainEnglish: "The business may not have enough clarity on which alerts are monitored, who receives them, and what happens next.",
          technologyAsk: "Ask for monitored alerts across key systems, named responders, expected response times, and escalation rules.",
          whatToAsk: [
            "Which alerts are monitored and by whom?",
            "What response times apply to serious alerts?",
            "Are email, cloud, endpoint, and admin activity included?",
          ],
          typicalSmeApproach: "Start with alerts from email, cloud admin, endpoint protection, and backup failures. Define who responds and how urgent issues escalate.",
          evidence: ["Alert report", "Monitoring scope", "Escalation record"],
        });
      }
      if (hasAny(prompt, ["tabletop", "exercise", "tested", "test", "lessons", "learned"])) {
        add({
          key: "response-testing",
          label: "Incident response needs testing",
          severity,
          plainEnglish: "A plan may exist, but the weak point appears to be practice, evidence, and lessons learned.",
          technologyAsk: "Ask for a tabletop exercise, incident notes, lessons learned, and action tracking after the exercise.",
          whatToAsk: [
            "When was the last tabletop exercise run?",
            "What actions came out of it?",
            "Who tracks lessons learned to closure?",
          ],
          typicalSmeApproach: "Run a simple one-hour incident exercise using a realistic scenario such as email compromise, ransomware, or supplier outage.",
          evidence: ["Exercise notes", "Lessons learned tracker", "Closed action evidence"],
        });
      }
      if (hasAny(prompt, ["escalation", "roles", "responsibilities", "who", "contact"])) {
        add({
          key: "response-ownership",
          label: "Response roles and escalation are unclear",
          severity,
          plainEnglish: "The business may lose time during an incident because ownership and escalation are not clear enough.",
          technologyAsk: "Ask for a one-page response plan with named contacts, escalation routes, decision authority, and out-of-hours arrangements.",
          whatToAsk: [
            "Who makes decisions during an incident?",
            "Who contacts customers, suppliers, insurers, or IT support?",
            "Is there an out-of-hours escalation route?",
          ],
          typicalSmeApproach: "Create a one-page response plan with named roles, escalation steps, and contact routes. Review it after any incident or exercise.",
          evidence: ["One-page response plan", "Contact list", "Escalation route"],
        });
      }
    }

    if (target.includes("risk") || target.includes("compliance")) {
      if (hasAny(prompt, ["risk register", "register", "top risks", "risk list"])) {
        add({
          key: "risk-register",
          label: "A practical risk register is missing or weak",
          severity,
          plainEnglish: "Risks may be known informally but not visible enough to drive decisions, ownership, and action.",
          technologyAsk: "Ask for a simple risk register showing risks, owners, impact, treatment actions, target dates, and status.",
          whatToAsk: [
            "Can we see the top cyber and disruption risks?",
            "Who owns each risk?",
            "What action, target date, and status is recorded?",
          ],
          typicalSmeApproach: "Start with the top 10 risks. Keep the register simple, business-focused, and reviewed monthly or quarterly.",
          evidence: ["Risk register", "Risk owner list", "Review notes"],
        });
      }
      if (hasAny(prompt, ["treatment", "actions", "closure", "owner", "deadline", "overdue"])) {
        add({
          key: "risk-actions",
          label: "Risk actions are not being tracked tightly enough",
          severity,
          plainEnglish: "The issue may not be knowing the risks; it may be weak follow-through on treatment actions.",
          technologyAsk: "Ask for risk action tracking with owners, due dates, overdue escalation, and completion evidence.",
          whatToAsk: [
            "Which risk actions are overdue?",
            "Who owns each treatment action?",
            "What evidence proves each action is complete?",
          ],
          typicalSmeApproach: "Attach every important risk to a named owner and one next action. Review overdue items regularly until closed or formally accepted.",
          evidence: ["Action tracker", "Closed action evidence", "Overdue action report"],
        });
      }
      if (hasAny(prompt, ["accepted", "accept", "exception", "sign off", "sign-off"])) {
        add({
          key: "accepted-risk",
          label: "Accepted risks and exceptions need sign-off",
          severity,
          plainEnglish: "Some risks may be tolerated without clear approval, review dates, or evidence of the decision.",
          technologyAsk: "Ask for accepted-risk records with rationale, owner approval, expiry or review date, and evidence.",
          whatToAsk: [
            "Which risks have been accepted rather than fixed?",
            "Who approved them and why?",
            "When will they be reviewed again?",
          ],
          typicalSmeApproach: "Document accepted risks clearly. Include rationale, owner, review date, and sign-off so the decision can be defended later.",
          evidence: ["Accepted risk log", "Sign-off record", "Review date"],
        });
      }
    }

    if (target.includes("operation") || target.includes("secure operations")) {
      if (hasAny(prompt, ["patch", "update", "updates", "maintenance"])) {
        add({
          key: "patching",
          label: "Patch visibility is weak",
          severity,
          plainEnglish: "Routine updates may not be visible enough, which increases preventable exposure.",
          technologyAsk: "Ask for patch status reporting, overdue update tracking, exception sign-off, and coverage across key devices and systems.",
          whatToAsk: [
            "Which systems are included in patch reporting?",
            "What is overdue and why?",
            "How are exceptions approved?",
          ],
          typicalSmeApproach: "Create a monthly patch report. Focus first on critical systems, internet-facing systems, and devices used for admin or finance work.",
          evidence: ["Patch status report", "Overdue patch list", "Exception record"],
        });
      }
      if (hasAny(prompt, ["logging", "logs", "monitor", "alerts", "reviewed"])) {
        add({
          key: "operational-logs",
          label: "Operational logging is not visible enough",
          severity,
          plainEnglish: "Key logs or alerts may exist, but they may not be reviewed consistently enough to support early detection or evidence.",
          technologyAsk: "Ask for basic log collection and monthly review for email, cloud admin, endpoints, backups, and critical systems.",
          whatToAsk: [
            "Which logs are collected and reviewed?",
            "Who checks exceptions or alerts?",
            "Can we see a monthly review report?",
          ],
          typicalSmeApproach: "Do not start with complex monitoring. Start by confirming which key alerts are reviewed, who owns them, and where the evidence is kept.",
          evidence: ["Log review report", "Alert handling evidence", "Exception list"],
        });
      }
      if (hasAny(prompt, ["configuration", "baseline", "hardening", "standard", "change"])) {
        add({
          key: "configuration-baseline",
          label: "Configuration standards need tightening",
          severity,
          plainEnglish: "Systems may be set up inconsistently, which can create avoidable weaknesses and make support harder.",
          technologyAsk: "Ask for baseline configuration standards, secure defaults, change tracking, and evidence that key systems follow the baseline.",
          whatToAsk: [
            "What secure baseline is used for devices and key systems?",
            "How are configuration changes approved?",
            "How is drift detected and corrected?",
          ],
          typicalSmeApproach: "Define a simple baseline for laptops, cloud accounts, admin settings, and critical systems. Track changes and exceptions.",
          evidence: ["Baseline configuration", "Change log", "Exception list"],
        });
      }
    }

    if (target.includes("threat") || target.includes("vulnerability")) {
      if (hasAny(prompt, ["vulnerability", "scan", "scanning", "weakness", "exposure"])) {
        add({
          key: "vulnerability-scanning",
          label: "Vulnerability visibility is weak",
          severity,
          plainEnglish: "The business may not be finding known weaknesses early enough to fix them before they create exposure.",
          technologyAsk: "Ask for vulnerability scanning or exposure review across key systems, with risk-based prioritisation and closure tracking.",
          whatToAsk: [
            "Which systems are scanned or reviewed?",
            "How often does scanning happen?",
            "How are high-risk issues prioritised?",
          ],
          typicalSmeApproach: "Start with external-facing systems and critical devices. Track higher-risk findings to closure before expanding complexity.",
          evidence: ["Recent scan output", "Remediation tracker", "Exception record"],
        });
      }
      if (hasAny(prompt, ["remediation", "fix", "closure", "overdue", "sla", "target"])) {
        add({
          key: "remediation-tracking",
          label: "Fixes need stronger tracking",
          severity,
          plainEnglish: "Known issues may be found but not closed quickly or visibly enough.",
          technologyAsk: "Ask for remediation targets, overdue tracking, ownership, and reporting for high-risk findings.",
          whatToAsk: [
            "What remediation target applies to high-risk issues?",
            "Who owns overdue fixes?",
            "How are exceptions signed off?",
          ],
          typicalSmeApproach: "Agree simple remediation targets and track open items weekly until high-risk issues are closed or formally accepted.",
          evidence: ["Remediation tracker", "Overdue report", "Exception sign-off"],
        });
      }
    }

    if (target.includes("asset") || target.includes("data")) {
      if (hasAny(prompt, ["inventory", "asset", "systems", "devices", "critical"])) {
        add({
          key: "asset-inventory",
          label: "Critical asset visibility is weak",
          severity,
          plainEnglish: "The business may not be able to quickly identify important systems, devices, or owners during an incident.",
          technologyAsk: "Ask for an asset inventory covering critical systems, devices, owners, business criticality, and review dates.",
          whatToAsk: [
            "Can we list critical systems and devices quickly?",
            "Who owns each system or dataset?",
            "How is the inventory kept up to date?",
          ],
          typicalSmeApproach: "Start with critical systems and devices rather than every asset. Add owners, importance, location, and review date.",
          evidence: ["Asset inventory", "Owner list", "Review date"],
        });
      }
      if (hasAny(prompt, ["data", "classification", "confidential", "sensitive", "retention", "disposal"])) {
        add({
          key: "data-handling",
          label: "Data handling rules need clarity",
          severity,
          plainEnglish: "Sensitive data may not be consistently identified, retained, shared, or disposed of.",
          technologyAsk: "Ask for simple data classification, retention, disposal rules, and evidence for sensitive data handling.",
          whatToAsk: [
            "Which data is sensitive or critical?",
            "How long is it kept?",
            "How is it securely deleted or disposed of?",
          ],
          typicalSmeApproach: "Use simple labels such as public, internal, confidential. Define retention and disposal for the most important data first.",
          evidence: ["Data classification rules", "Retention schedule", "Disposal evidence"],
        });
      }
    }

    if (target.includes("supplier") || target.includes("third") || target.includes("supply")) {
      if (hasAny(prompt, ["supplier", "third party", "vendor", "critical", "outsourced"])) {
        add({
          key: "supplier-criticality",
          label: "Critical supplier visibility is weak",
          severity,
          plainEnglish: "The business may not know clearly enough which suppliers can disrupt operations or access important data.",
          technologyAsk: "Ask for a critical supplier list showing service provided, system/data access, owner, assurance status, and dependency risk.",
          whatToAsk: [
            "Which suppliers are critical to trading?",
            "What access do they have?",
            "What happens if they are unavailable?",
          ],
          typicalSmeApproach: "List critical suppliers first. Record what they support, what they access, who owns the relationship, and what evidence is held.",
          evidence: ["Critical supplier register", "Supplier access list", "Relationship owner list"],
        });
      }
      if (hasAny(prompt, ["contract", "sla", "assurance", "review", "evidence", "security expectation"])) {
        add({
          key: "supplier-assurance",
          label: "Supplier assurance needs stronger evidence",
          severity,
          plainEnglish: "Supplier expectations may exist informally, but evidence and review rhythm may be too weak.",
          technologyAsk: "Ask for supplier security expectations, review schedule, assurance evidence, and contract/SLA evidence where relevant.",
          whatToAsk: [
            "What security evidence do critical suppliers provide?",
            "How often is supplier risk reviewed?",
            "Are expectations included in contracts or onboarding?",
          ],
          typicalSmeApproach: "Review critical suppliers annually. Ask for basic control evidence and record gaps, owners, and follow-up actions.",
          evidence: ["Supplier evidence pack", "Review notes", "Contract/SLA extract"],
        });
      }
    }

    if (target.includes("governance") || target.includes("leadership")) {
      if (hasAny(prompt, ["named", "owner", "accountable", "roles", "responsibilities"])) {
        add({
          key: "named-owner",
          label: "Ownership is not clear enough",
          severity,
          plainEnglish: "Cyber resilience may be supported in principle, but accountability is not clear enough to drive action.",
          technologyAsk: "Ask for a simple governance dashboard or action tracker showing owner, status, due date, and evidence for priority controls.",
          whatToAsk: [
            "Who is accountable for cyber resilience?",
            "Who owns each open action?",
            "How is progress reported to leadership?",
          ],
          typicalSmeApproach: "Name one senior owner and one operational owner. Use a simple monthly action tracker until responsibilities are embedded.",
          evidence: ["Named owner", "Action tracker", "Review notes"],
        });
      }
      if (hasAny(prompt, ["review", "cadence", "monthly", "quarterly", "leadership", "board"])) {
        add({
          key: "leadership-review",
          label: "Leadership review rhythm is weak",
          severity,
          plainEnglish: "Risks and actions may not be reviewed often enough to prevent drift.",
          technologyAsk: "Ask for a monthly or quarterly leadership view of risks, actions, overdue items, exceptions, and evidence.",
          whatToAsk: [
            "How often does leadership review cyber resilience?",
            "Which risks and actions are shown?",
            "How are overdue items escalated?",
          ],
          typicalSmeApproach: "Create a one-page leadership dashboard and review it monthly or quarterly. Keep notes and action closure evidence.",
          evidence: ["Leadership dashboard", "Meeting notes", "Closed action evidence"],
        });
      }
      if (hasAny(prompt, ["budget", "resource", "funding", "decision", "escalation"])) {
        add({
          key: "governance-decisions",
          label: "Decision and funding route needs clarity",
          severity,
          plainEnglish: "Important improvements may stall because decision authority, budget, or escalation is unclear.",
          technologyAsk: "Ask for decision tracking that records approvals, accepted risks, budget decisions, and escalations.",
          whatToAsk: [
            "Who approves control improvements?",
            "How are blockers escalated?",
            "Where are accepted risk decisions recorded?",
          ],
          typicalSmeApproach: "Agree how security decisions are made, who can approve spend, and how exceptions are recorded when action is delayed.",
          evidence: ["Decision log", "Budget approval", "Escalation record"],
        });
      }
    }
  }

  return findings.sort((a, b) => a.severity - b.severity).slice(0, 3);
}

export function getDynamicImplementationGuidance(domainNameOrCode: string, context?: DynamicProviderContext): ImplementationGuidance {
  const base = getImplementationGuidance(domainNameOrCode);
  const findings = buildDynamicFindings(domainNameOrCode, context);
  if (!findings.length) return base;

  const primary = findings[0];
  const extraQuestions = findings.flatMap((f) => f.whatToAsk).slice(0, 4);
  const extraEvidence = findings.flatMap((f) => f.evidence).slice(0, 3);

  return {
    ...base,
    plainEnglish: primary.plainEnglish,
    technologyAsk: primary.technologyAsk,
    whatToAsk: extraQuestions.length ? extraQuestions : base.whatToAsk,
    typicalSmeApproach: primary.typicalSmeApproach,
    checklist: {
      ...base.checklist,
      outcome: extraEvidence.length
        ? `${base.checklist.outcome} Priority evidence: ${extraEvidence.join("; ")}.`
        : base.checklist.outcome,
    },
  };
}

export function getDynamicTechnologySnapshotItem(domainNameOrCode: string, context?: DynamicProviderContext): TechnologySnapshotItem {
  const guidance = getDynamicImplementationGuidance(domainNameOrCode, context);
  const findings = buildDynamicFindings(domainNameOrCode, context);
  const evidence = findings.flatMap((f) => f.evidence).filter(Boolean);

  return {
    area: domainNameOrCode,
    whyItMatters: guidance.plainEnglish,
    whatToAskFor: [guidance.controlRequired, ...guidance.technologyCategories, ...guidance.whatToAsk].filter(Boolean),
    evidenceToRequest: [
      ...(evidence.length ? evidence : []),
      guidance.checklist.outcome,
      "Status report showing coverage, exceptions, and actions closed",
      "Evidence that the control has operated, not just been purchased",
    ].filter(Boolean),
    typicalOwner:
      guidance.checklist.controlCategory === "Access control"
        ? "IT owner, MSP, or operations lead"
        : guidance.checklist.controlCategory === "Governance and ownership"
        ? "Leadership owner or operations lead"
        : "Operational owner, IT support, or MSP",
    effort: guidance.effort,
    cost: guidance.cost,
  };
}

