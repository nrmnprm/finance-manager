import type { FinanceEvent, FinanceData } from "../types";
import { formatDate } from "./date";
import { generateVirtualEvents } from "./recurring";

/** Merge one-off events with virtual recurring events for a date range. */
export function getAllEventsForRange(
  data: FinanceData,
  rangeStart: string,
  rangeEnd: string
): FinanceEvent[] {
  const virtual = generateVirtualEvents(
    data.recurringPayments,
    data.confirmations,
    rangeStart,
    rangeEnd
  );
  // Real events filtered to range
  const real = data.events.filter((e) => e.date >= rangeStart && e.date <= rangeEnd);
  return [...real, ...virtual];
}

export function getBalanceForDay(
  currentBalance: number,
  events: FinanceEvent[],
  day: string
): number {
  let balance = currentBalance;
  for (const e of events) {
    if (e.date <= day) {
      balance += e.type === "income" ? e.amount : -e.amount;
    }
  }
  return balance;
}

/**
 * Considers all events (one-off + virtual recurring) for the month.
 */
export function getDailyAllowanceForDay(
  currentBalance: number,
  events: FinanceEvent[],
  day: string
): number {
  const balance = getBalanceForDay(currentBalance, events, day);

  const [yearStr, monthStr, dayStr] = day.split("-");
  const year = parseInt(yearStr);
  const month1 = parseInt(monthStr);
  const dayNum = parseInt(dayStr);

  const lastDayNum = new Date(year, month1, 0).getDate();
  const endOfMonth = `${yearStr}-${monthStr}-${String(lastDayNum).padStart(2, "0")}`;

  let futureIncome = 0;
  let futureExpense = 0;
  for (const e of events) {
    if (e.date > day && e.date <= endOfMonth) {
      if (e.type === "income") futureIncome += e.amount;
      else futureExpense += e.amount;
    }
  }

  const remainingDays = lastDayNum - dayNum + 1;
  const available = balance + futureIncome - futureExpense;
  return available / remainingDays;
}

export function getDisplayBalanceForDay(
  currentBalance: number,
  events: FinanceEvent[],
  day: string
): number {
  const balance = getBalanceForDay(currentBalance, events, day);
  const allowance = getDailyAllowanceForDay(currentBalance, events, day);
  return balance - allowance;
}

/** Wrapper using FinanceData (includes recurring events). */
export function getDailyAllowanceForDayFromData(
  data: FinanceData,
  day: string
): number {
  const [yearStr, monthStr] = day.split("-");
  const rangeStart = `${yearStr}-${monthStr}-01`;
  const lastDayNum = new Date(parseInt(yearStr), parseInt(monthStr), 0).getDate();
  const rangeEnd = `${yearStr}-${monthStr}-${String(lastDayNum).padStart(2, "0")}`;
  const events = getAllEventsForRange(data, rangeStart, rangeEnd);
  // Also include events before the month for balance calculation
  const allBeforeAndInMonth = [
    ...data.events.filter((e) => e.date < rangeStart),
    ...events,
  ];
  const result = getDailyAllowanceForDay(data.currentBalance, allBeforeAndInMonth, day);
  return isFinite(result) ? result : 0;
}

export function getBalanceForDayFromData(data: FinanceData, day: string): number {
  // Generate virtual events from far past to day
  const farPast = "2000-01-01";
  const virtual = generateVirtualEvents(
    data.recurringPayments,
    data.confirmations,
    farPast,
    day
  );
  const allEvents = [...data.events, ...virtual];
  return getBalanceForDay(data.currentBalance, allEvents, day);
}

export function getDisplayBalanceForDayFromData(data: FinanceData, day: string): number {
  const balance = getBalanceForDayFromData(data, day);
  const allowance = getDailyAllowanceForDayFromData(data, day);
  return balance - allowance;
}

/** Legacy compat wrapper */
export function getDailyAllowance(
  currentBalance: number,
  events: FinanceEvent[],
  today: Date
): number {
  return getDailyAllowanceForDay(currentBalance, events, formatDate(today));
}
