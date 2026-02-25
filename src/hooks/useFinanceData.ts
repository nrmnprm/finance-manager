import { useState, useEffect, useCallback } from "react";
import type {
  FinanceEvent,
  FinanceData,
  RecurringPayment,
  Credit,
  SavingsAccount,
  DistributionRule,
  Confirmation,
} from "../types";
import { loadData, saveData } from "../utils/storage";

export function useFinanceData() {
  const [data, setData] = useState<FinanceData>(() => loadData());

  useEffect(() => {
    saveData(data);
  }, [data]);

  const setBalance = useCallback((balance: number) => {
    setData((prev) => ({ ...prev, currentBalance: balance }));
  }, []);

  // --- Events ---
  const addEvent = useCallback((event: Omit<FinanceEvent, "id">) => {
    const newEvent: FinanceEvent = { ...event, id: crypto.randomUUID() };
    setData((prev) => ({ ...prev, events: [...prev.events, newEvent] }));
  }, []);

  const updateEvent = useCallback((id: string, updates: Partial<FinanceEvent>) => {
    setData((prev) => ({
      ...prev,
      events: prev.events.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }));
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      events: prev.events.filter((e) => e.id !== id),
    }));
  }, []);

  // --- Recurring Payments ---
  const addRecurringPayment = useCallback((rp: Omit<RecurringPayment, "id">) => {
    const newRp: RecurringPayment = { ...rp, id: crypto.randomUUID() };
    setData((prev) => ({ ...prev, recurringPayments: [...prev.recurringPayments, newRp] }));
  }, []);

  const updateRecurringPayment = useCallback((id: string, updates: Partial<RecurringPayment>) => {
    setData((prev) => ({
      ...prev,
      recurringPayments: prev.recurringPayments.map((rp) =>
        rp.id === id ? { ...rp, ...updates } : rp
      ),
    }));
  }, []);

  const deleteRecurringPayment = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      recurringPayments: prev.recurringPayments.filter((rp) => rp.id !== id),
      confirmations: prev.confirmations.filter((c) => c.recurringId !== id),
    }));
  }, []);

  // --- Credits ---
  const addCredit = useCallback((credit: Omit<Credit, "id">) => {
    const newCredit: Credit = { ...credit, id: crypto.randomUUID() };
    setData((prev) => ({ ...prev, credits: [...prev.credits, newCredit] }));
  }, []);

  const updateCredit = useCallback((id: string, updates: Partial<Credit>) => {
    setData((prev) => ({
      ...prev,
      credits: prev.credits.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
  }, []);

  const deleteCredit = useCallback((id: string) => {
    setData((prev) => ({ ...prev, credits: prev.credits.filter((c) => c.id !== id) }));
  }, []);

  // --- Savings ---
  const addSavingsAccount = useCallback((account: Omit<SavingsAccount, "id">) => {
    const newAccount: SavingsAccount = { ...account, id: crypto.randomUUID() };
    setData((prev) => ({ ...prev, savings: [...prev.savings, newAccount] }));
  }, []);

  const updateSavingsAccount = useCallback((id: string, updates: Partial<SavingsAccount>) => {
    setData((prev) => ({
      ...prev,
      savings: prev.savings.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  }, []);

  const deleteSavingsAccount = useCallback((id: string) => {
    setData((prev) => ({ ...prev, savings: prev.savings.filter((s) => s.id !== id) }));
  }, []);

  // --- Distribution Rules ---
  const addDistributionRule = useCallback((rule: Omit<DistributionRule, "id">) => {
    const newRule: DistributionRule = { ...rule, id: crypto.randomUUID() };
    setData((prev) => ({ ...prev, distributionRules: [...prev.distributionRules, newRule] }));
  }, []);

  const updateDistributionRule = useCallback((id: string, updates: Partial<DistributionRule>) => {
    setData((prev) => ({
      ...prev,
      distributionRules: prev.distributionRules.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    }));
  }, []);

  const deleteDistributionRule = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      distributionRules: prev.distributionRules.filter((r) => r.id !== id),
    }));
  }, []);

  // --- Confirmations ---
  const addConfirmation = useCallback((confirmation: Confirmation) => {
    setData((prev) => ({
      ...prev,
      confirmations: [
        ...prev.confirmations.filter(
          (c) => !(c.recurringId === confirmation.recurringId && c.date === confirmation.date)
        ),
        confirmation,
      ],
    }));
  }, []);

  // --- Import / Reset ---
  const importData = useCallback((newData: FinanceData) => {
    setData(newData);
  }, []);

  const resetData = useCallback(() => {
    setData({
      currentBalance: 0,
      events: [],
      recurringPayments: [],
      credits: [],
      savings: [],
      distributionRules: [],
      confirmations: [],
    });
  }, []);

  return {
    currentBalance: data.currentBalance,
    events: data.events,
    recurringPayments: data.recurringPayments,
    credits: data.credits,
    savings: data.savings,
    distributionRules: data.distributionRules,
    confirmations: data.confirmations,
    data,
    setBalance,
    addEvent,
    updateEvent,
    deleteEvent,
    addRecurringPayment,
    updateRecurringPayment,
    deleteRecurringPayment,
    addCredit,
    updateCredit,
    deleteCredit,
    addSavingsAccount,
    updateSavingsAccount,
    deleteSavingsAccount,
    addDistributionRule,
    updateDistributionRule,
    deleteDistributionRule,
    addConfirmation,
    importData,
    resetData,
  };
}
