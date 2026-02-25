import { useState } from "react";
import type { SavingsAccount } from "../../types";
import styles from "./Savings.module.css";

interface SavingsFormProps {
  initial?: SavingsAccount;
  onSave: (account: Omit<SavingsAccount, "id">) => void;
  onCancel: () => void;
}

export function SavingsForm({ initial, onSave, onCancel }: SavingsFormProps) {
  const [label, setLabel] = useState(initial?.label ?? "");
  const [balance, setBalance] = useState(initial ? String(initial.balance) : "");
  const [interestRate, setInterestRate] = useState(initial ? String(initial.interestRate) : "");
  const [goal, setGoal] = useState(initial?.goal ? String(initial.goal) : "");

  const isValid = label.trim().length > 0 && !isNaN(parseFloat(balance));

  const handleSave = () => {
    if (!isValid) return;
    onSave({
      label: label.trim(),
      balance: parseFloat(balance) || 0,
      interestRate: parseFloat(interestRate) || 0,
      goal: goal ? parseFloat(goal) || null : null,
    });
  };

  return (
    <div className={styles.formOverlay} onClick={onCancel}>
      <div className={styles.formSheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.formTitle}>{initial ? "Изменить счёт" : "Новый счёт"}</div>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>Название</label>
          <input className={styles.input} type="text" placeholder="Подушка безопасности" value={label} onChange={(e) => setLabel(e.target.value)} autoFocus />
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>Текущий баланс</label>
          <input className={styles.input} type="number" inputMode="decimal" placeholder="0" value={balance} onChange={(e) => setBalance(e.target.value)} />
        </div>

        <div className={styles.row2}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Ставка (% год.)</label>
            <input className={styles.input} type="number" inputMode="decimal" placeholder="0" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} />
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Цель</label>
            <input className={styles.input} type="number" inputMode="decimal" placeholder="Необязательно" value={goal} onChange={(e) => setGoal(e.target.value)} />
          </div>
        </div>

        <div className={styles.formBtns}>
          <button className={styles.cancelBtn} onClick={onCancel}>Отмена</button>
          <button className={styles.saveBtn} onClick={handleSave} disabled={!isValid}>Сохранить</button>
        </div>
      </div>
    </div>
  );
}
