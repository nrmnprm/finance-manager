import type { FinanceEvent } from "../types";
import { formatDate, getRemainingDaysInMonth } from "./date";

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

export function getDailyAllowance(
  currentBalance: number,
  events: FinanceEvent[],
  today: Date
): number {
  const todayStr = formatDate(today);
  const balance = getBalanceForDay(currentBalance, events, todayStr);

  const year = today.getFullYear();
  const month = today.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();
  const endOfMonth = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  let futureIncome = 0;
  let futureExpense = 0;

  for (const e of events) {
    if (e.date > todayStr && e.date <= endOfMonth) {
      if (e.type === "income") {
        futureIncome += e.amount;
      } else {
        futureExpense += e.amount;
      }
    }
  }

  const remaining = getRemainingDaysInMonth(today);
  const available = balance + futureIncome - futureExpense;
  return available / remaining;
}
