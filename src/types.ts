export interface FinanceEvent {
  id: string;
  date: string; // "YYYY-MM-DD"
  type: "income" | "expense";
  amount: number;
  label: string;
}

export interface FinanceData {
  currentBalance: number;
  events: FinanceEvent[];
}
