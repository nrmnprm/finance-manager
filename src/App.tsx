import { useState } from "react";
import { useFinanceData } from "./hooks/useFinanceData";
import type { FinanceEvent } from "./types";
import { formatDate } from "./utils/date";
import { TabBar, type TabName } from "./components/TabBar/TabBar";
import { Today } from "./components/Today/Today";
import { CalendarScreen } from "./components/CalendarScreen/CalendarScreen";
import { ObligationsScreen } from "./components/ObligationsScreen/ObligationsScreen";
import { Settings } from "./components/Settings/Settings";
import { EventForm } from "./components/EventForm/EventForm";
import styles from "./App.module.css";

function App() {
  const finance = useFinanceData();
  const [activeTab, setActiveTab] = useState<TabName>("today");
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventFormDate, setEventFormDate] = useState<string>(() => formatDate(new Date()));

  const handleConfirmVirtualEvent = (recurringId: string, date: string, amount: number) => {
    finance.addConfirmation({
      recurringId,
      date,
      actualAmount: amount,
      confirmed: true,
    });
  };

  const handleAddEvent = (event: Omit<FinanceEvent, "id">) => {
    finance.addEvent(event);
    setShowEventForm(false);
  };

  const openEventForm = (date?: string) => {
    setEventFormDate(date ?? formatDate(new Date()));
    setShowEventForm(true);
  };

  return (
    <div className={styles.app}>
      <div className={styles.screen}>
        {activeTab === "today" && (
          <Today
            data={finance.data}
            onBalanceChange={finance.setBalance}
            onAddEvent={() => openEventForm()}
            onConfirmVirtualEvent={handleConfirmVirtualEvent}
          />
        )}
        {activeTab === "calendar" && (
          <CalendarScreen
            data={finance.data}
            onAddEvent={handleAddEvent}
            onDeleteEvent={finance.deleteEvent}
            onConfirmVirtualEvent={handleConfirmVirtualEvent}
          />
        )}
        {activeTab === "obligations" && (
          <ObligationsScreen
            data={finance.data}
            onAddRecurringPayment={finance.addRecurringPayment}
            onUpdateRecurringPayment={finance.updateRecurringPayment}
            onDeleteRecurringPayment={finance.deleteRecurringPayment}
            onAddCredit={finance.addCredit}
            onUpdateCredit={finance.updateCredit}
            onDeleteCredit={finance.deleteCredit}
            onAddSavingsAccount={finance.addSavingsAccount}
            onUpdateSavingsAccount={finance.updateSavingsAccount}
            onDeleteSavingsAccount={finance.deleteSavingsAccount}
          />
        )}
        {activeTab === "settings" && (
          <Settings
            data={finance.data}
            onImport={finance.importData}
            onReset={finance.resetData}
            onAddDistributionRule={finance.addDistributionRule}
            onUpdateDistributionRule={finance.updateDistributionRule}
            onDeleteDistributionRule={finance.deleteDistributionRule}
          />
        )}
      </div>

      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

      {showEventForm && (
        <EventForm
          date={eventFormDate}
          onSave={handleAddEvent}
          onCancel={() => setShowEventForm(false)}
        />
      )}
    </div>
  );
}

export default App;
