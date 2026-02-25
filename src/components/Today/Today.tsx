import { useState, useMemo } from "react";
import type { FinanceData } from "../../types";
import { formatDate } from "../../utils/date";
import { getBalanceForDayFromData, getDailyAllowanceForDayFromData, getAllEventsForRange } from "../../utils/calculations";
import { getOccurrencesInRange } from "../../utils/recurring";
import styles from "./Today.module.css";

interface TodayProps {
  data: FinanceData;
  onBalanceChange: (balance: number) => void;
  onAddEvent: () => void;
  onConfirmVirtualEvent: (recurringId: string, date: string, amount: number) => void;
}

export function Today({ data, onBalanceChange, onAddEvent, onConfirmVirtualEvent }: TodayProps) {
  const today = new Date();
  const todayStr = formatDate(today);
  const [editingBalance, setEditingBalance] = useState(false);
  const [balanceInput, setBalanceInput] = useState("");
  const [confirmingPayment, setConfirmingPayment] = useState<{ recurringId: string; date: string; amount: string } | null>(null);

  const currentBalance = getBalanceForDayFromData(data, todayStr);
  const dailyAllowance = getDailyAllowanceForDayFromData(data, todayStr);

  const formatNumber = (n: number) =>
    n.toLocaleString("ru-RU", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const startEditBalance = () => {
    setBalanceInput(String(data.currentBalance));
    setEditingBalance(true);
  };

  const saveBalance = () => {
    const v = parseFloat(balanceInput);
    if (!isNaN(v)) onBalanceChange(v);
    setEditingBalance(false);
  };

  // Next 7 days events
  const next7Days = useMemo(() => {
    const end = new Date(today);
    end.setDate(end.getDate() + 6);
    const endStr = formatDate(end);

    // We need multiple months potentially — get start of today's month and end of end month
    const startMonth = todayStr.slice(0, 7) + "-01";
    const endYear = endStr.slice(0, 4);
    const endMonth = endStr.slice(5, 7);
    const lastDay = new Date(parseInt(endYear), parseInt(endMonth), 0).getDate();
    const endMonthStr = `${endYear}-${endMonth}-${String(lastDay).padStart(2, "0")}`;

    const events = getAllEventsForRange(data, startMonth, endMonthStr);
    return events
      .filter((e) => e.date >= todayStr && e.date <= endStr)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [data, todayStr]);

  // Pending recurring payments (unconfirmed occurrences up to today)
  const pendingPayments = useMemo(() => {
    const result: { recurringId: string; label: string; amount: number; date: string; type: "income" | "expense" }[] = [];
    for (const rp of data.recurringPayments) {
      const occurrences = getOccurrencesInRange(rp.anchorDate, rp.frequency, "2000-01-01", todayStr);
      for (const date of occurrences) {
        const alreadyConfirmed = data.confirmations.some(
          (c) => c.recurringId === rp.id && c.date === date && c.confirmed
        );
        if (!alreadyConfirmed) {
          result.push({ recurringId: rp.id, label: rp.label, amount: rp.amount, date, type: rp.type });
        }
      }
    }
    return result;
  }, [data, todayStr]);

  const doConfirm = () => {
    if (!confirmingPayment) return;
    const amount = parseFloat(confirmingPayment.amount);
    if (isNaN(amount) || amount <= 0) return;
    onConfirmVirtualEvent(confirmingPayment.recurringId, confirmingPayment.date, amount);
    setConfirmingPayment(null);
  };

  const formatShortDate = (d: string) => {
    const [, m, day] = d.split("-");
    return `${parseInt(day)}.${m}`;
  };

  return (
    <div className={styles.screen}>
      {/* Balance */}
      <div className={styles.balanceSection}>
        {editingBalance ? (
          <div className={styles.balanceEdit}>
            <input
              className={styles.balanceInput}
              type="number"
              inputMode="decimal"
              value={balanceInput}
              onChange={(e) => setBalanceInput(e.target.value)}
              onBlur={saveBalance}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveBalance();
                if (e.key === "Escape") setEditingBalance(false);
              }}
              autoFocus
            />
          </div>
        ) : (
          <button className={styles.balanceBtn} onClick={startEditBalance}>
            <span className={`${styles.balanceAmount} ${currentBalance < 0 ? styles.balanceNegative : ""}`}>
              {formatNumber(currentBalance)} ₽
            </span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.editIcon}>
              <path d="M11 2l3 3-8 8H3v-3L11 2z" />
            </svg>
          </button>
        )}
        <div className={styles.allowance}>
          <span className={styles.allowanceLabel}>Можно тратить сегодня</span>
          <span className={`${styles.allowanceValue} ${dailyAllowance < 0 ? styles.allowanceNegative : ""}`}>
            {formatNumber(Math.round(dailyAllowance))} ₽/день
          </span>
        </div>
      </div>

      {/* Pending confirmations */}
      {pendingPayments.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Требуют подтверждения</div>
          <div className={styles.pendingList}>
            {pendingPayments.map((p) => (
              <div key={`${p.recurringId}-${p.date}`} className={styles.pendingCard}>
                <div className={styles.pendingInfo}>
                  <span className={styles.pendingLabel}>{p.label}</span>
                  <span className={styles.pendingDate}>{formatShortDate(p.date)}</span>
                </div>
                <span className={`${styles.pendingAmount} ${p.type === "income" ? styles.amountIncome : styles.amountExpense}`}>
                  {p.type === "income" ? "+" : "-"}{formatNumber(p.amount)}
                </span>
                {confirmingPayment?.recurringId === p.recurringId && confirmingPayment.date === p.date ? (
                  <div className={styles.confirmRow}>
                    <input
                      className={styles.confirmInput}
                      type="number"
                      inputMode="decimal"
                      value={confirmingPayment.amount}
                      onChange={(e) => setConfirmingPayment({ ...confirmingPayment, amount: e.target.value })}
                      autoFocus
                    />
                    <button className={styles.confirmOkBtn} onClick={doConfirm}>✓</button>
                    <button className={styles.confirmCancelBtn} onClick={() => setConfirmingPayment(null)}>✕</button>
                  </div>
                ) : (
                  <button
                    className={styles.confirmBtn}
                    onClick={() => setConfirmingPayment({ recurringId: p.recurringId, date: p.date, amount: String(p.amount) })}
                  >
                    Подтвердить
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next 7 days */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Ближайшие 7 дней</div>
        {next7Days.length > 0 ? (
          <div className={styles.eventList}>
            {next7Days.map((e) => (
              <div key={e.id} className={`${styles.eventRow} ${!e.confirmed ? styles.eventRowPending : ""}`}>
                <span className={styles.eventDate}>{formatShortDate(e.date)}</span>
                <span className={styles.eventLabel}>{e.label || "—"}</span>
                <span className={`${styles.eventAmount} ${e.type === "income" ? styles.amountIncome : styles.amountExpense}`}>
                  {e.type === "income" ? "+" : "-"}{formatNumber(e.amount)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>Нет запланированных событий</div>
        )}
      </div>

      {/* FAB */}
      <button className={styles.fab} onClick={onAddEvent} aria-label="Добавить событие">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  );
}
