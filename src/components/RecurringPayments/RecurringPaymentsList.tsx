import { useState } from "react";
import type { RecurringPayment } from "../../types";
import { getNextOccurrence } from "../../utils/recurring";
import { formatDate } from "../../utils/date";
import { RecurringPaymentForm } from "./RecurringPaymentForm";
import styles from "./RecurringPayments.module.css";

interface RecurringPaymentsListProps {
  payments: RecurringPayment[];
  confirmations: unknown[];
  onAdd: (rp: Omit<RecurringPayment, "id">) => void;
  onUpdate: (id: string, updates: Partial<RecurringPayment>) => void;
  onDelete: (id: string) => void;
}

const FREQ_LABELS: Record<RecurringPayment["frequency"], string> = {
  monthly: "ежемесячно",
  weekly: "еженедельно",
  biweekly: "каждые 2 нед.",
};

export function RecurringPaymentsList({
  payments,
  onAdd,
  onUpdate,
  onDelete,
}: RecurringPaymentsListProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState<RecurringPayment | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const today = formatDate(new Date());

  const handleDelete = (id: string) => {
    if (deletingId === id) {
      onDelete(id);
      setDeletingId(null);
    } else {
      setDeletingId(id);
      setTimeout(() => setDeletingId((curr) => (curr === id ? null : curr)), 2000);
    }
  };

  const formatNumber = (n: number) =>
    n.toLocaleString("ru-RU", { maximumFractionDigits: 0 });

  const formatShortDate = (d: string | null) => {
    if (!d) return "—";
    const [, m, day] = d.split("-");
    return `${parseInt(day)}.${m}`;
  };

  return (
    <div className={styles.list}>
      {payments.length === 0 && (
        <div className={styles.empty}>Нет повторяющихся платежей</div>
      )}
      {payments.map((rp) => {
        const nextDate = getNextOccurrence(rp.anchorDate, rp.frequency, today);
        return (
          <div key={rp.id} className={styles.item}>
            <div className={styles.itemHeader}>
              <div className={styles.itemInfo}>
                <span className={styles.itemLabel}>{rp.label}</span>
                <div className={styles.itemMeta}>
                  <span className={`${styles.freqBadge} ${styles[`cat_${rp.category}`]}`}>
                    {FREQ_LABELS[rp.frequency]}
                  </span>
                  {nextDate && (
                    <span className={styles.nextDate}>след. {formatShortDate(nextDate)}</span>
                  )}
                </div>
              </div>
              <span className={`${styles.amount} ${rp.type === "income" ? styles.income : styles.expense}`}>
                {rp.type === "income" ? "+" : "-"}{formatNumber(rp.amount)}
              </span>
            </div>
            <div className={styles.itemActions}>
              <button className={styles.editBtn} onClick={() => setEditingPayment(rp)}>
                Изменить
              </button>
              <button
                className={`${styles.deleteBtn} ${deletingId === rp.id ? styles.deleteConfirm : ""}`}
                onClick={() => handleDelete(rp.id)}
              >
                {deletingId === rp.id ? "Удалить?" : "Удалить"}
              </button>
            </div>
          </div>
        );
      })}

      <button className={styles.addBtn} onClick={() => setShowForm(true)}>
        + Добавить платёж
      </button>

      {(showForm || editingPayment) && (
        <RecurringPaymentForm
          initial={editingPayment ?? undefined}
          onSave={(rp) => {
            if (editingPayment) {
              onUpdate(editingPayment.id, rp);
              setEditingPayment(null);
            } else {
              onAdd(rp);
              setShowForm(false);
            }
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingPayment(null);
          }}
        />
      )}
    </div>
  );
}
