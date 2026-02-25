import type { FinanceData } from "../types";

const STORAGE_KEY = "finance-data";

const DEFAULT_DATA: FinanceData = {
  currentBalance: 0,
  events: [],
};

export function loadData(): FinanceData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DATA;
    const parsed = JSON.parse(raw);
    if (
      typeof parsed.currentBalance === "number" &&
      Array.isArray(parsed.events)
    ) {
      return parsed as FinanceData;
    }
    return DEFAULT_DATA;
  } catch {
    return DEFAULT_DATA;
  }
}

export function saveData(data: FinanceData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
