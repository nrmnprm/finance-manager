import { useState } from "react";
import type { FinanceEvent } from "../../types";
import styles from "./DayDetail.module.css";

interface DayDetailProps {
  date: string;
  events: FinanceEvent[];
  balance: number;
  dailyAllowance: number;
  onAddEvent: () => void;
  onDeleteEvent: (id: string) => void;
  onConfirmVirtualEvent: (recurringId: string, date: string, amount: number) => void;
  onClose: () => void;
}

export function DayDetail({
  date,
  events,
  balance,
  dailyAllowance,
  onAddEvent,
  onDeleteEvent,
  onConfirmVirtualEvent,
  onClose,
}: DayDetailProps) {
  const isPositiveAllowance = dailyAllowance > 0;
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const [confirmingPayment, setConfirmingPayment] = useState<{ id: string; amount: string } | null>(null);

  const formatNumber = (n: number) =>
    n.toLocaleString("ru-RU", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  const formatDateDisplay = (d: string) => {
    const [y, m, day] = d.split("-");
    return `${parseInt(day)}.${m}.${y}`;
  };

  const isVirtual = (id: string) => id.startsWith("recurring-");

  const handleDelete = (id: string) => {
    if (isVirtual(id)) return;
    if (confirmingDelete === id) {
      onDeleteEvent(id);
      setConfirmingDelete(null);
    } else {
      setConfirmingDelete(id);
      setTimeout(() => setConfirmingDelete((curr) => (curr === id ? null : curr)), 2000);
    }
  };

  const doConfirm = (event: FinanceEvent) => {
    if (!confirmingPayment) return;
    const amount = parseFloat(confirmingPayment.amount);
    if (isNaN(amount) || amount <= 0) return;
    const withoutPrefix = event.id.slice("recurring-".length);
    const datePart = withoutPrefix.slice(-10);
    const recurringId = withoutPrefix.slice(0, withoutPrefix.length - 11);
    onConfirmVirtualEvent(recurringId, datePart, amount);
    setConfirmingPayment(null);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.dateTitle}>{formatDateDisplay(date)}</span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Закрыть">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="5" y1="5" x2="15" y2="15" />
              <line x1="15" y1="5" x2="5" y2="15" />
            </svg>
          </button>
        </div>

        {events.length > 0 ? (
          <div className={styles.eventsList}>
            {events.map((event) => (
              <div
                key={event.id}
                className={`${styles.eventItem} ${!event.confirmed ? styles.eventPending : ""}`}
              >
                <div
                  className={`${styles.eventIndicator} ${
                    event.type === "income"
                      ? styles.indicatorIncome
                      : styles.indicatorExpense
                  }`}
                />
                <div className={styles.eventInfo}>
                  {event.label && (
                    <div className={styles.eventLabel}>
                      {event.label}
                      {!event.confirmed && (
                        <span className={styles.pendingBadge}>ожидает</span>
                      )}
                    </div>
                  )}
                  <div
                    className={`${styles.eventAmount} ${
                      event.type === "income" ? styles.amountIncome : styles.amountExpense
                    } ${!event.confirmed ? styles.amountPending : ""}`}
                  >
                    {event.type === "income" ? "+" : "-"}
                    {formatNumber(event.amount)}
                  </div>
                </div>

                {!event.confirmed && isVirtual(event.id) && (
                  confirmingPayment?.id === event.id ? (
                    <div className={styles.confirmInline} onClick={(e) => e.stopPropagation()}>
                      <input
                        className={styles.confirmAmountInput}
                        type="number"
                        inputMode="decimal"
                        value={confirmingPayment.amount}
                        onChange={(e) =>
                          setConfirmingPayment({ id: event.id, amount: e.target.value })
                        }
                        autoFocus
                      />
                      <button className={styles.confirmOkBtn} onClick={() => doConfirm(event)}>
                        ✓
                      </button>
                      <button
                        className={styles.confirmCancelBtn}
                        onClick={() => setConfirmingPayment(null)}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      className={styles.confirmBtn}
                      onClick={() => setConfirmingPayment({ id: event.id, amount: String(event.amount) })}
                    >
                      Подтвердить
                    </button>
                  )
                )}

                {!isVirtual(event.id) && (
                  <button
                    className={`${styles.deleteBtn} ${
                      confirmingDelete === event.id ? styles.deleteConfirm : ""
                    }`}
                    onClick={() => handleDelete(event.id)}
                  >
                    {confirmingDelete === event.id ? (
                      "Да?"
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <polyline points="3,4 4,13 12,13 13,4" />
                        <line x1="2" y1="4" x2="14" y2="4" />
                        <line x1="6" y1="2" x2="10" y2="2" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>Нет событий</div>
        )}

        <div className={styles.footer}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Баланс на этот день</span>
            <span className={`${styles.statValue} ${balance < 0 ? styles.statNegative : ""}`}>
              {formatNumber(balance)}
            </span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Можно тратить</span>
            <span className={isPositiveAllowance ? styles.allowanceValue : styles.statNegative}>
              {formatNumber(Math.round(dailyAllowance))} / день
            </span>
          </div>
        </div>

        <button className={styles.addBtn} onClick={onAddEvent}>
          Добавить событие
        </button>
      </div>
    </div>
  );
}
