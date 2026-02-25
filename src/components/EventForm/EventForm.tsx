import { useState, useRef, useEffect } from "react";
import type { FinanceEvent } from "../../types";
import styles from "./EventForm.module.css";

interface EventFormProps {
  date: string;
  onSave: (event: Omit<FinanceEvent, "id">) => void;
  onCancel: () => void;
}

export function EventForm({ date, onSave, onCancel }: EventFormProps) {
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [label, setLabel] = useState("");
  const [eventDate, setEventDate] = useState(date);
  const amountRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    amountRef.current?.focus();
  }, []);

  const handleSave = () => {
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) return;
    onSave({
      type,
      amount: parsed,
      label: label.trim(),
      date: eventDate,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") onCancel();
  };

  const isValid = !isNaN(parseFloat(amount)) && parseFloat(amount) > 0;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.title}>Новое событие</div>

        <div className={styles.typeToggle}>
          <button
            className={`${styles.typeBtn} ${
              type === "expense" ? styles.typeBtnExpense : ""
            }`}
            onClick={() => setType("expense")}
          >
            Расход
          </button>
          <button
            className={`${styles.typeBtn} ${
              type === "income" ? styles.typeBtnIncome : ""
            }`}
            onClick={() => setType("income")}
          >
            Доход
          </button>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Сумма</label>
          <input
            ref={amountRef}
            type="number"
            inputMode="decimal"
            className={`${styles.input} ${styles.inputAmount}`}
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Описание</label>
          <input
            type="text"
            className={styles.input}
            placeholder="Необязательно"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Дата</label>
          <input
            type="date"
            className={styles.input}
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
          />
        </div>

        <div className={styles.buttons}>
          <button className={styles.cancelBtn} onClick={onCancel}>
            Отмена
          </button>
          <button
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={!isValid}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}
