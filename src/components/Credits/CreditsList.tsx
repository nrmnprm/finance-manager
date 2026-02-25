import { useState } from "react";
import type { Credit } from "../../types";
import { CreditForm } from "./CreditForm";
import styles from "./Credits.module.css";

interface CreditsListProps {
  credits: Credit[];
  onAdd: (credit: Omit<Credit, "id">) => void;
  onUpdate: (id: string, updates: Partial<Credit>) => void;
  onDelete: (id: string) => void;
}

export function CreditsList({ credits, onAdd, onUpdate, onDelete }: CreditsListProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingCredit, setEditingCredit] = useState<Credit | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const formatNumber = (n: number) =>
    n.toLocaleString("ru-RU", { maximumFractionDigits: 0 });

  const handleDelete = (id: string) => {
    if (deletingId === id) {
      onDelete(id);
      setDeletingId(null);
    } else {
      setDeletingId(id);
      setTimeout(() => setDeletingId((c) => (c === id ? null : c)), 2000);
    }
  };

  return (
    <div className={styles.list}>
      {credits.length === 0 && (
        <div className={styles.empty}>Нет кредитов</div>
      )}
      {credits.map((credit) => {
        const usedPercent = credit.limit > 0 ? (credit.totalDebt / credit.limit) * 100 : 0;
        return (
          <div key={credit.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardLabel}>{credit.label}</span>
              <div className={styles.cardAmounts}>
                <span className={styles.debtAmount} style={{ color: "var(--credit)" }}>
                  {formatNumber(credit.totalDebt)} ₽
                </span>
                {credit.limit > 0 && (
                  <span className={styles.limitAmount}>из {formatNumber(credit.limit)} ₽</span>
                )}
              </div>
            </div>

            {credit.limit > 0 && (
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{
                    width: `${Math.min(100, usedPercent)}%`,
                    background: "var(--credit)",
                  }}
                />
              </div>
            )}

            {credit.subPayments.length > 0 && (
              <div className={styles.subPayments}>
                {credit.subPayments.map((sp) => (
                  <div key={sp.id} className={styles.subPayment}>
                    <span className={styles.subLabel}>{sp.label}</span>
                    <span className={styles.subRate}>{sp.interestRate}%</span>
                    <span className={styles.subAmount}>{formatNumber(sp.amount)} ₽</span>
                  </div>
                ))}
              </div>
            )}

            <div className={styles.cardFooter}>
              <span className={styles.minPayment}>
                Мин. платёж: <strong>{formatNumber(credit.minPayment)} ₽</strong>
              </span>
              {credit.paymentDate > 0 && (
                <span className={styles.paymentDate}>
                  Дата: <strong>{credit.paymentDate}-го</strong>
                </span>
              )}
            </div>

            <div className={styles.cardActions}>
              <button className={styles.editBtn} onClick={() => setEditingCredit(credit)}>
                Изменить
              </button>
              <button
                className={`${styles.deleteBtn} ${deletingId === credit.id ? styles.deleteConfirm : ""}`}
                onClick={() => handleDelete(credit.id)}
              >
                {deletingId === credit.id ? "Удалить?" : "Удалить"}
              </button>
            </div>
          </div>
        );
      })}

      <button className={styles.addBtn} onClick={() => setShowForm(true)}>
        + Добавить кредит
      </button>

      {(showForm || editingCredit) && (
        <CreditForm
          initial={editingCredit ?? undefined}
          onSave={(credit) => {
            if (editingCredit) {
              onUpdate(editingCredit.id, credit);
              setEditingCredit(null);
            } else {
              onAdd(credit);
              setShowForm(false);
            }
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingCredit(null);
          }}
        />
      )}
    </div>
  );
}
