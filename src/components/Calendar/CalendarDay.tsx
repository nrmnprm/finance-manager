import type { FinanceEvent } from "../../types";
import styles from "./CalendarDay.module.css";

interface CalendarDayProps {
  date: Date;
  balance: number;
  events: FinanceEvent[];
  isToday: boolean;
  isSelected: boolean;
  isCurrentMonth: boolean;
  onClick: () => void;
}

export function CalendarDay({
  date,
  balance,
  events,
  isToday,
  isSelected,
  isCurrentMonth,
  onClick,
}: CalendarDayProps) {
  const hasIncome = events.some((e) => e.type === "income");
  const hasExpense = events.some((e) => e.type === "expense");

  const classNames = [
    styles.day,
    !isCurrentMonth && styles.otherMonth,
    isToday && styles.today,
    isSelected && styles.selected,
  ]
    .filter(Boolean)
    .join(" ");

  const formatBalance = (n: number) => {
    if (Math.abs(n) >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (Math.abs(n) >= 10000) return `${Math.round(n / 1000)}k`;
    return n.toLocaleString("ru-RU", { maximumFractionDigits: 0 });
  };

  return (
    <div className={classNames} onClick={onClick}>
      <span className={styles.dayNumber}>{date.getDate()}</span>
      <div className={styles.dots}>
        {hasIncome && <span className={`${styles.dot} ${styles.dotIncome}`} />}
        {hasExpense && (
          <span className={`${styles.dot} ${styles.dotExpense}`} />
        )}
      </div>
      {isCurrentMonth && (
        <span
          className={`${styles.balance} ${balance < 0 ? styles.negative : ""}`}
        >
          {formatBalance(balance)}
        </span>
      )}
    </div>
  );
}
