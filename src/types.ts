export interface FinanceEvent {
  id: string;
  date: string; // "YYYY-MM-DD"
  type: "income" | "expense";
  amount: number;
  label: string;
  confirmed: boolean;
}

export interface RecurringPayment {
  id: string;
  type: "income" | "expense";
  label: string;
  amount: number;
  frequency: "monthly" | "weekly" | "biweekly";
  anchorDate: string; // "YYYY-MM-DD"
  flexAmount: boolean;
  flexDate: number;
  category: "income" | "expense" | "credit" | "savings";
}

export interface CreditSubPayment {
  id: string;
  label: string;
  amount: number;
  interestRate: number;
}

export interface Credit {
  id: string;
  label: string;
  totalDebt: number;
  limit: number;
  subPayments: CreditSubPayment[];
  minPayment: number;
  paymentDate: number; // day of month
}

export interface SavingsAccount {
  id: string;
  label: string;
  balance: number;
  interestRate: number;
  goal: number | null;
}

export interface DistributionRule {
  id: string;
  label: string;
  percentage: number;
  targetType: "expense" | "credit" | "savings";
  targetId: string | null;
}

export interface Confirmation {
  recurringId: string;
  date: string; // "YYYY-MM-DD"
  actualAmount: number;
  confirmed: boolean;
}

export interface FinanceData {
  currentBalance: number;
  events: FinanceEvent[];
  recurringPayments: RecurringPayment[];
  credits: Credit[];
  savings: SavingsAccount[];
  distributionRules: DistributionRule[];
  confirmations: Confirmation[];
}
