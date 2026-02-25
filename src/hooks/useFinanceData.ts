import { useState, useEffect, useCallback } from "react";
import type { FinanceEvent, FinanceData } from "../types";
import { loadData, saveData } from "../utils/storage";

export function useFinanceData() {
  const [data, setData] = useState<FinanceData>(() => loadData());

  useEffect(() => {
    saveData(data);
  }, [data]);

  const setBalance = useCallback((balance: number) => {
    setData((prev) => ({ ...prev, currentBalance: balance }));
  }, []);

  const addEvent = useCallback((event: Omit<FinanceEvent, "id">) => {
    const newEvent: FinanceEvent = {
      ...event,
      id: crypto.randomUUID(),
    };
    setData((prev) => ({ ...prev, events: [...prev.events, newEvent] }));
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      events: prev.events.filter((e) => e.id !== id),
    }));
  }, []);

  const importData = useCallback((newData: FinanceData) => {
    setData(newData);
  }, []);

  const resetData = useCallback(() => {
    setData({ currentBalance: 0, events: [] });
  }, []);

  return {
    currentBalance: data.currentBalance,
    events: data.events,
    data,
    setBalance,
    addEvent,
    deleteEvent,
    importData,
    resetData,
  };
}
