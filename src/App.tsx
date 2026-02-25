import { useState } from "react";
import { useFinanceData } from "./hooks/useFinanceData";
import { formatDate } from "./utils/date";
import { getBalanceForDay, getDailyAllowance } from "./utils/calculations";
import { Header } from "./components/Header/Header";
import { Calendar } from "./components/Calendar/Calendar";
import { DayDetail } from "./components/DayDetail/DayDetail";
import { EventForm } from "./components/EventForm/EventForm";
import { Settings } from "./components/Settings/Settings";
import styles from "./App.module.css";

function App() {
  const finance = useFinanceData();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const today = new Date();
  const todayStr = formatDate(today);
  const dailyAllowance = getDailyAllowance(
    finance.currentBalance,
    finance.events,
    today
  );

  const handleDayClick = (date: string) => {
    setSelectedDay(date);
  };

  const handleCloseDayDetail = () => {
    setSelectedDay(null);
  };

  const handleAddEventClick = () => {
    setShowEventForm(true);
  };

  const handleSaveEvent = (event: Parameters<typeof finance.addEvent>[0]) => {
    finance.addEvent(event);
    setShowEventForm(false);
  };

  const selectedDayBalance = selectedDay
    ? getBalanceForDay(finance.currentBalance, finance.events, selectedDay)
    : 0;

  const selectedDayEvents = selectedDay
    ? finance.events.filter((e) => e.date === selectedDay)
    : [];

  const selectedDayAllowance = selectedDay === todayStr ? dailyAllowance : null;

  return (
    <div className={styles.app}>
      <Header
        currentBalance={finance.currentBalance}
        dailyAllowance={dailyAllowance}
        onBalanceChange={finance.setBalance}
        onSettingsClick={() => setShowSettings(true)}
      />
      <Calendar
        events={finance.events}
        currentBalance={finance.currentBalance}
        selectedDay={selectedDay}
        onDayClick={handleDayClick}
      />

      {selectedDay && (
        <DayDetail
          date={selectedDay}
          events={selectedDayEvents}
          balance={selectedDayBalance}
          dailyAllowance={selectedDayAllowance}
          onAddEvent={handleAddEventClick}
          onDeleteEvent={finance.deleteEvent}
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

      {showSettings && (
        <Settings
          data={finance.data}
          onImport={finance.importData}
          onReset={finance.resetData}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

export default App;
