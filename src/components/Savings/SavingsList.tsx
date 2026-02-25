import { useState } from "react";
import type { SavingsAccount } from "../../types";
import { SavingsForm } from "./SavingsForm";
import styles from "./Savings.module.css";

interface SavingsListProps {
  accounts: SavingsAccount[];
  onAdd: (account: Omit<SavingsAccount, "id">) => void;
  onUpdate: (id: string, updates: Partial<SavingsAccount>) => void;
  onDelete: (id: string) => void;
}

export function SavingsList({ accounts, onAdd, onUpdate, onDelete }: SavingsListProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<SavingsAccount | null>(null);
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
      {accounts.length === 0 && (
        <div className={styles.empty}>Нет накопительных счетов</div>
      )}
      {accounts.map((account) => {
        const goalPercent =
          account.goal && account.goal > 0
            ? (account.balance / account.goal) * 100
            : null;

        return (
          <div key={account.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardLabel}>{account.label}</span>
              <div className={styles.cardAmounts}>
                <span className={styles.balanceAmount} style={{ color: "var(--savings)" }}>
                  {formatNumber(account.balance)} ₽
                </span>
                {account.goal && (
                  <span className={styles.goalAmount}>цель: {formatNumber(account.goal)} ₽</span>
                )}
              </div>
            </div>

            {goalPercent !== null && (
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{
                    width: `${Math.min(100, goalPercent)}%`,
                    background: "var(--savings)",
                  }}
                />
              </div>
            )}

            {account.interestRate > 0 && (
              <div className={styles.rate}>
                Ставка: <strong>{account.interestRate}% годовых</strong>
              </div>
            )}

            <div className={styles.cardActions}>
              <button className={styles.editBtn} onClick={() => setEditingAccount(account)}>
                Изменить
              </button>
              <button
                className={`${styles.deleteBtn} ${deletingId === account.id ? styles.deleteConfirm : ""}`}
                onClick={() => handleDelete(account.id)}
              >
                {deletingId === account.id ? "Удалить?" : "Удалить"}
              </button>
            </div>
          </div>
        );
      })}

      <button className={styles.addBtn} onClick={() => setShowForm(true)}>
        + Добавить счёт
      </button>

      {(showForm || editingAccount) && (
        <SavingsForm
          initial={editingAccount ?? undefined}
          onSave={(account) => {
            if (editingAccount) {
              onUpdate(editingAccount.id, account);
              setEditingAccount(null);
            } else {
              onAdd(account);
              setShowForm(false);
            }
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingAccount(null);
          }}
        />
      )}
    </div>
  );
}
