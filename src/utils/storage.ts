import type { FinanceData, FinanceEvent } from "../types";

const STORAGE_KEY = "finance-data";

const DEFAULT_DATA: FinanceData = {
  currentBalance: 0,
  events: [],
  recurringPayments: [],
  credits: [],
  savings: [],
  distributionRules: [],
  confirmations: [],
};

function migrateData(raw: Record<string, unknown>): FinanceData {
  const events = Array.isArray(raw.events)
    ? (raw.events as FinanceEvent[]).map((e) => ({
        ...e,
        confirmed: typeof e.confirmed === "boolean" ? e.confirmed : true,
      }))
    : [];

  return {
    currentBalance: typeof raw.currentBalance === "number" ? raw.currentBalance : 0,
    events,
    recurringPayments: Array.isArray(raw.recurringPayments) ? raw.recurringPayments : [],
    credits: Array.isArray(raw.credits) ? raw.credits : [],
    savings: Array.isArray(raw.savings) ? raw.savings : [],
    distributionRules: Array.isArray(raw.distributionRules) ? raw.distributionRules : [],
    confirmations: Array.isArray(raw.confirmations) ? raw.confirmations : [],
  };
}

export function loadData(): FinanceData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DATA;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return migrateData(parsed as Record<string, unknown>);
    }
    return DEFAULT_DATA;
  } catch {
    return DEFAULT_DATA;
  }
}

export function saveData(data: FinanceData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
