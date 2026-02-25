import type { FinanceEvent } from "../../types";
import styles from "./CalendarDay.module.css";

interface CalendarDayProps {
  date: Date;
  balance: number;
  allowance: number;
  events: FinanceEvent[];
  isToday: boolean;
  isSelected: boolean;
  isCurrentMonth: boolean;
  onClick: () => void;
}

export function CalendarDay({
  date,
  balance,
  allowance,
  events,
  isToday,
  isSelected,
  isCurrentMonth,
  onClick,
}: CalendarDayProps) {
  const hasIncome = events.some((e) => e.type === "income" && e.confirmed);
  const hasExpense = events.some((e) => e.type === "expense" && e.confirmed);
  const hasPendingIncome = events.some((e) => e.type === "income" && !e.confirmed);
  const hasPendingExpense = events.some((e) => e.type === "expense" && !e.confirmed);

  const classNames = [
    styles.day,
    !isCurrentMonth && styles.otherMonth,
    isToday && styles.today,
    isSelected && styles.selected,
  ]
    .filter(Boolean)
    .join(" ");

  const fmt = (n: number) => {
    if (!isFinite(n) || isNaN(n)) return "—";
    const abs = Math.abs(n);
    if (abs >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (abs >= 10000) return `${Math.round(n / 1000)}k`;
    return Math.round(n).toLocaleString("ru-RU");
  };

  return (
    <div className={classNames} onClick={onClick}>
      <span className={styles.dayNumber}>{date.getDate()}</span>
      <div className={styles.dots}>
        {hasIncome && <span className={`${styles.dot} ${styles.dotIncome}`} />}
        {hasExpense && <span className={`${styles.dot} ${styles.dotExpense}`} />}
        {hasPendingIncome && <span className={`${styles.dot} ${styles.dotPendingIncome}`} />}
        {hasPendingExpense && <span className={`${styles.dot} ${styles.dotPendingExpense}`} />}
      </div>
      {isCurrentMonth && (
        <div className={styles.numbers}>
          <span className={`${styles.allowance} ${allowance < 0 ? styles.negative : ""}`}>
            {fmt(allowance)}
          </span>
          <span className={`${styles.balance} ${balance < 0 ? styles.negative : ""}`}>
            {fmt(balance)}
          </span>
        </div>
      )}
    </div>
  );
}
