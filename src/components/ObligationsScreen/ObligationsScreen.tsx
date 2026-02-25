import { useState } from "react";
import type { FinanceData, RecurringPayment, Credit, SavingsAccount } from "../../types";
import { RecurringPaymentsList } from "../RecurringPayments/RecurringPaymentsList";
import { CreditsList } from "../Credits/CreditsList";
import { SavingsList } from "../Savings/SavingsList";
import styles from "./ObligationsScreen.module.css";

type SubTab = "payments" | "credits" | "savings";

interface ObligationsScreenProps {
  data: FinanceData;
  onAddRecurringPayment: (rp: Omit<RecurringPayment, "id">) => void;
  onUpdateRecurringPayment: (id: string, updates: Partial<RecurringPayment>) => void;
  onDeleteRecurringPayment: (id: string) => void;
  onAddCredit: (credit: Omit<Credit, "id">) => void;
  onUpdateCredit: (id: string, updates: Partial<Credit>) => void;
  onDeleteCredit: (id: string) => void;
  onAddSavingsAccount: (account: Omit<SavingsAccount, "id">) => void;
  onUpdateSavingsAccount: (id: string, updates: Partial<SavingsAccount>) => void;
  onDeleteSavingsAccount: (id: string) => void;
}

export function ObligationsScreen({
  data,
  onAddRecurringPayment,
  onUpdateRecurringPayment,
  onDeleteRecurringPayment,
  onAddCredit,
  onUpdateCredit,
  onDeleteCredit,
  onAddSavingsAccount,
  onUpdateSavingsAccount,
  onDeleteSavingsAccount,
}: ObligationsScreenProps) {
  const [subTab, setSubTab] = useState<SubTab>("payments");

  return (
    <div className={styles.screen}>
      <div className={styles.subTabs}>
        <button
          className={`${styles.subTab} ${subTab === "payments" ? styles.subTabActive : ""}`}
          onClick={() => setSubTab("payments")}
        >
          Платежи
        </button>
        <button
          className={`${styles.subTab} ${subTab === "credits" ? styles.subTabActive : ""}`}
          onClick={() => setSubTab("credits")}
        >
          Кредиты
        </button>
        <button
          className={`${styles.subTab} ${subTab === "savings" ? styles.subTabActive : ""}`}
          onClick={() => setSubTab("savings")}
        >
          Накопления
        </button>
      </div>

      <div className={styles.content}>
        {subTab === "payments" && (
          <RecurringPaymentsList
            payments={data.recurringPayments}
            confirmations={data.confirmations}
            onAdd={onAddRecurringPayment}
            onUpdate={onUpdateRecurringPayment}
            onDelete={onDeleteRecurringPayment}
          />
        )}
        {subTab === "credits" && (
          <CreditsList
            credits={data.credits}
            onAdd={onAddCredit}
            onUpdate={onUpdateCredit}
            onDelete={onDeleteCredit}
          />
        )}
        {subTab === "savings" && (
          <SavingsList
            accounts={data.savings}
            onAdd={onAddSavingsAccount}
            onUpdate={onUpdateSavingsAccount}
            onDelete={onDeleteSavingsAccount}
          />
        )}
      </div>
    </div>
  );
}
