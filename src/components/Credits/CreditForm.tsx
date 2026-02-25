import { useState } from "react";
import type { Credit, CreditSubPayment } from "../../types";
import styles from "./Credits.module.css";

interface CreditFormProps {
  initial?: Credit;
  onSave: (credit: Omit<Credit, "id">) => void;
  onCancel: () => void;
}

function newSubPayment(): CreditSubPayment {
  return { id: crypto.randomUUID(), label: "", amount: 0, interestRate: 0 };
}

export function CreditForm({ initial, onSave, onCancel }: CreditFormProps) {
  const [label, setLabel] = useState(initial?.label ?? "");
  const [totalDebt, setTotalDebt] = useState(initial ? String(initial.totalDebt) : "");
  const [limit, setLimit] = useState(initial ? String(initial.limit) : "");
  const [minPayment, setMinPayment] = useState(initial ? String(initial.minPayment) : "");
  const [paymentDate, setPaymentDate] = useState(initial ? String(initial.paymentDate) : "");
  const [subPayments, setSubPayments] = useState<CreditSubPayment[]>(
    initial?.subPayments ?? []
  );

  const isValid = label.trim().length > 0 && !isNaN(parseFloat(totalDebt));

  const handleSave = () => {
    if (!isValid) return;
    onSave({
      label: label.trim(),
      totalDebt: parseFloat(totalDebt) || 0,
      limit: parseFloat(limit) || 0,
      minPayment: parseFloat(minPayment) || 0,
      paymentDate: parseInt(paymentDate) || 0,
      subPayments,
    });
  };

  const updateSub = (id: string, field: keyof CreditSubPayment, value: string) => {
    setSubPayments((prev) =>
      prev.map((sp) =>
        sp.id === id
          ? {
              ...sp,
              [field]:
                field === "label"
                  ? value
                  : parseFloat(value) || 0,
            }
          : sp
      )
    );
  };

  return (
    <div className={styles.formOverlay} onClick={onCancel}>
      <div className={styles.formSheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.formTitle}>{initial ? "Изменить кредит" : "Новый кредит"}</div>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>Название</label>
          <input className={styles.input} type="text" placeholder="Тинькофф Платинум" value={label} onChange={(e) => setLabel(e.target.value)} autoFocus />
        </div>

        <div className={styles.row2}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Долг</label>
            <input className={styles.input} type="number" inputMode="decimal" placeholder="0" value={totalDebt} onChange={(e) => setTotalDebt(e.target.value)} />
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Лимит</label>
            <input className={styles.input} type="number" inputMode="decimal" placeholder="0" value={limit} onChange={(e) => setLimit(e.target.value)} />
          </div>
        </div>

        <div className={styles.row2}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Мин. платёж</label>
            <input className={styles.input} type="number" inputMode="decimal" placeholder="0" value={minPayment} onChange={(e) => setMinPayment(e.target.value)} />
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>День оплаты</label>
            <input className={styles.input} type="number" inputMode="numeric" placeholder="1–31" min="1" max="31" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
          </div>
        </div>

        <div className={styles.subSection}>
          <div className={styles.subSectionHeader}>
            <span className={styles.fieldLabel}>Субплатежи</span>
            <button className={styles.addSubBtn} onClick={() => setSubPayments((p) => [...p, newSubPayment()])}>
              + Добавить
            </button>
          </div>
          {subPayments.map((sp) => (
            <div key={sp.id} className={styles.subRow}>
              <input className={`${styles.input} ${styles.subLabelInput}`} type="text" placeholder="Название" value={sp.label} onChange={(e) => updateSub(sp.id, "label", e.target.value)} />
              <input className={`${styles.input} ${styles.subNumInput}`} type="number" inputMode="decimal" placeholder="Сумма" value={sp.amount || ""} onChange={(e) => updateSub(sp.id, "amount", e.target.value)} />
              <input className={`${styles.input} ${styles.subNumInput}`} type="number" inputMode="decimal" placeholder="%" value={sp.interestRate || ""} onChange={(e) => updateSub(sp.id, "interestRate", e.target.value)} />
              <button className={styles.removeSubBtn} onClick={() => setSubPayments((p) => p.filter((s) => s.id !== sp.id))}>×</button>
            </div>
          ))}
        </div>

        <div className={styles.formBtns}>
          <button className={styles.cancelBtn} onClick={onCancel}>Отмена</button>
          <button className={styles.saveBtn} onClick={handleSave} disabled={!isValid}>Сохранить</button>
        </div>
      </div>
    </div>
  );
}
