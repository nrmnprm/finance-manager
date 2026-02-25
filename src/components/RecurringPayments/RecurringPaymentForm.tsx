import { useState } from "react";
import type { RecurringPayment } from "../../types";
import { formatDate } from "../../utils/date";
import styles from "./RecurringPayments.module.css";

interface RecurringPaymentFormProps {
  initial?: RecurringPayment;
  onSave: (rp: Omit<RecurringPayment, "id">) => void;
  onCancel: () => void;
}

export function RecurringPaymentForm({ initial, onSave, onCancel }: RecurringPaymentFormProps) {
  const [type, setType] = useState<RecurringPayment["type"]>(initial?.type ?? "expense");
  const [label, setLabel] = useState(initial?.label ?? "");
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [frequency, setFrequency] = useState<RecurringPayment["frequency"]>(initial?.frequency ?? "monthly");
  const [anchorDate, setAnchorDate] = useState(initial?.anchorDate ?? formatDate(new Date()));
  const [flexAmount, setFlexAmount] = useState(initial?.flexAmount ?? false);
  const [flexDate, setFlexDate] = useState(initial ? String(initial.flexDate) : "3");
  const [category, setCategory] = useState<RecurringPayment["category"]>(initial?.category ?? "expense");

  const isValid = label.trim().length > 0 && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0;

  const handleSave = () => {
    if (!isValid) return;
    onSave({
      type,
      label: label.trim(),
      amount: parseFloat(amount),
      frequency,
      anchorDate,
      flexAmount,
      flexDate: parseInt(flexDate) || 0,
      category,
    });
  };

  return (
    <div className={styles.formOverlay} onClick={onCancel}>
      <div className={styles.formSheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.formTitle}>
          {initial ? "Изменить платёж" : "Новый платёж"}
        </div>

        <div className={styles.typeToggle}>
          <button
            className={`${styles.typeBtn} ${type === "expense" ? styles.typeBtnExpense : ""}`}
            onClick={() => { setType("expense"); setCategory("expense"); }}
          >
            Расход
          </button>
          <button
            className={`${styles.typeBtn} ${type === "income" ? styles.typeBtnIncome : ""}`}
            onClick={() => { setType("income"); setCategory("income"); }}
          >
            Доход
          </button>
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>Название</label>
          <input
            className={styles.input}
            type="text"
            placeholder="Например: Аренда"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            autoFocus
          />
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>Сумма</label>
          <input
            className={styles.input}
            type="number"
            inputMode="decimal"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>Периодичность</label>
          <div className={styles.freqToggle}>
            {(["monthly", "weekly", "biweekly"] as const).map((f) => (
              <button
                key={f}
                className={`${styles.freqBtn} ${frequency === f ? styles.freqBtnActive : ""}`}
                onClick={() => setFrequency(f)}
              >
                {f === "monthly" ? "Месяц" : f === "weekly" ? "Неделя" : "2 нед."}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>Опорная дата</label>
          <input
            className={styles.input}
            type="date"
            value={anchorDate}
            onChange={(e) => setAnchorDate(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>Категория</label>
          <div className={styles.catToggle}>
            {(type === "income"
              ? ["income"] as const
              : ["expense", "credit", "savings"] as const
            ).map((cat) => (
              <button
                key={cat}
                className={`${styles.catBtn} ${category === cat ? styles.catBtnActive : ""} ${styles[`cat_${cat}`]}`}
                onClick={() => setCategory(cat)}
              >
                {cat === "income" ? "Доход" : cat === "expense" ? "Расход" : cat === "credit" ? "Кредит" : "Накопления"}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.flexRow}>
          <label className={styles.flexLabel}>
            <input
              type="checkbox"
              checked={flexAmount}
              onChange={(e) => setFlexAmount(e.target.checked)}
              className={styles.checkbox}
            />
            Плавающая сумма
          </label>
          <div className={styles.flexDateField}>
            <span className={styles.flexDateLabel}>Разброс дней ±</span>
            <input
              className={`${styles.input} ${styles.flexDateInput}`}
              type="number"
              inputMode="numeric"
              value={flexDate}
              onChange={(e) => setFlexDate(e.target.value)}
              min="0"
              max="30"
            />
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
