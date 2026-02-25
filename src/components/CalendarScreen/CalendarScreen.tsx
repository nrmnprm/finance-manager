import { useState } from "react";
import type { FinanceData, FinanceEvent } from "../../types";
import { getAllEventsForRange, getBalanceForDayFromData, getDailyAllowanceForDayFromData } from "../../utils/calculations";
import { Calendar } from "../Calendar/Calendar";
import { DayDetail } from "../DayDetail/DayDetail";
import { EventForm } from "../EventForm/EventForm";
import styles from "./CalendarScreen.module.css";

interface CalendarScreenProps {
  data: FinanceData;
  onAddEvent: (event: Omit<FinanceEvent, "id">) => void;
  onDeleteEvent: (id: string) => void;
  onConfirmVirtualEvent: (recurringId: string, date: string, amount: number) => void;
}

export function CalendarScreen({
  data,
  onAddEvent,
  onDeleteEvent,
  onConfirmVirtualEvent,
}: CalendarScreenProps) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);

  const handleDayClick = (date: string) => {
    setSelectedDay(date);
    setShowEventForm(false);
  };

  const handleCloseDayDetail = () => {
    setSelectedDay(null);
    setShowEventForm(false);
  };

  const handleSaveEvent = (event: Omit<FinanceEvent, "id">) => {
    onAddEvent(event);
    setShowEventForm(false);
  };

  const selectedDayBalance = selectedDay
    ? getBalanceForDayFromData(data, selectedDay)
    : 0;

  const selectedDayAllowance = selectedDay
    ? getDailyAllowanceForDayFromData(data, selectedDay)
    : 0;

  // Get events for the selected day (real + virtual)
  const selectedDayEvents = selectedDay
    ? (() => {
        const [yearStr, monthStr] = selectedDay.split("-");
        const rangeStart = `${yearStr}-${monthStr}-01`;
        const lastDayNum = new Date(parseInt(yearStr), parseInt(monthStr), 0).getDate();
        const rangeEnd = `${yearStr}-${monthStr}-${String(lastDayNum).padStart(2, "0")}`;
        const monthEvents = getAllEventsForRange(data, rangeStart, rangeEnd);
        // Include real events before the month too for context but only show day's events
        return monthEvents.filter((e) => e.date === selectedDay);
      })()
    : [];

  return (
    <div className={styles.screen}>
      <Calendar
        data={data}
        selectedDay={selectedDay}
        onDayClick={handleDayClick}
      />

      {selectedDay && (
        <DayDetail
          date={selectedDay}
          events={selectedDayEvents}
          balance={selectedDayBalance}
          dailyAllowance={selectedDayAllowance}
          onAddEvent={() => setShowEventForm(true)}
          onDeleteEvent={onDeleteEvent}
          onConfirmVirtualEvent={onConfirmVirtualEvent}
          onClose={handleCloseDayDetail}
        />
      )}

      {showEventForm && selectedDay && (
        <EventForm
          date={selectedDay}
          onSave={handleSaveEvent}
          onCancel={() => setShowEventForm(false)}
        />
      )}
    </div>
  );
}
