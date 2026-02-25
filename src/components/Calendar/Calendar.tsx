import { useState, useMemo, useRef } from "react";
import type { FinanceEvent } from "../../types";
import { getMonthDays, getFirstWeekday, formatDate, isToday, getMonthName } from "../../utils/date";
import { getBalanceForDay } from "../../utils/calculations";
import { CalendarDay } from "./CalendarDay";
import styles from "./Calendar.module.css";

interface CalendarProps {
  events: FinanceEvent[];
  currentBalance: number;
  selectedDay: string | null;
  onDayClick: (date: string) => void;
}

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export function Calendar({
  events,
  currentBalance,
  selectedDay,
  onDayClick,
}: CalendarProps) {
  const [viewDate, setViewDate] = useState(() => new Date());
  const touchStartX = useRef(0);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const days = useMemo(() => getMonthDays(year, month), [year, month]);
  const firstWeekday = useMemo(() => getFirstWeekday(year, month), [year, month]);

  // Previous month fill days
  const prevMonthDays = useMemo(() => {
    if (firstWeekday === 0) return [];
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const allPrevDays = getMonthDays(prevYear, prevMonth);
    return allPrevDays.slice(-firstWeekday);
  }, [year, month, firstWeekday]);

  // Next month fill days
  const nextMonthDays = useMemo(() => {
    const totalCells = prevMonthDays.length + days.length;
    const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    return getMonthDays(nextYear, nextMonth).slice(0, remaining);
  }, [year, month, prevMonthDays.length, days.length]);

  const balances = useMemo(() => {
    const map: Record<string, number> = {};
    for (const d of days) {
      const key = formatDate(d);
      map[key] = getBalanceForDay(currentBalance, events, key);
    }
    return map;
  }, [days, currentBalance, events]);

  const eventsByDay = useMemo(() => {
    const map: Record<string, FinanceEvent[]> = {};
    for (const e of events) {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    }
    return map;
  }, [events]);

  const goToPrev = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const goToNext = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dx > 50) goToPrev();
    else if (dx < -50) goToNext();
  };

  const renderDay = (date: Date, isCurrent: boolean) => {
    const key = formatDate(date);
    return (
      <CalendarDay
        key={key}
        date={date}
        balance={isCurrent ? (balances[key] ?? 0) : 0}
        events={isCurrent ? (eventsByDay[key] ?? []) : []}
        isToday={isToday(date)}
        isSelected={selectedDay === key}
        isCurrentMonth={isCurrent}
        onClick={() => onDayClick(key)}
      />
    );
  };

  return (
    <div
      className={styles.calendar}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className={styles.monthHeader}>
        <button className={styles.navBtn} onClick={goToPrev} aria-label="Предыдущий месяц">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="12,4 6,10 12,16" />
          </svg>
        </button>
        <span className={styles.monthTitle}>
          {getMonthName(month)} {year}
        </span>
        <button className={styles.navBtn} onClick={goToNext} aria-label="Следующий месяц">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="8,4 14,10 8,16" />
          </svg>
        </button>
      </div>
      <div className={styles.weekdays}>
        {WEEKDAYS.map((d) => (
          <span key={d} className={styles.weekday}>{d}</span>
        ))}
      </div>
      <div className={styles.grid}>
        {prevMonthDays.map((d) => renderDay(d, false))}
        {days.map((d) => renderDay(d, true))}
        {nextMonthDays.map((d) => renderDay(d, false))}
      </div>
    </div>
  );
}
