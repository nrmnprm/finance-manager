import { useState, useRef } from "react";
import type { FinanceData, DistributionRule } from "../../types";
import { formatDate } from "../../utils/date";
import { DistributionRulesEditor } from "../DistributionRules/DistributionRulesEditor";
import styles from "./Settings.module.css";

interface SettingsProps {
  data: FinanceData;
  onImport: (data: FinanceData) => void;
  onReset: () => void;
  onAddDistributionRule: (rule: Omit<DistributionRule, "id">) => void;
  onUpdateDistributionRule: (id: string, updates: Partial<DistributionRule>) => void;
  onDeleteDistributionRule: (id: string) => void;
}

function validateFinanceData(data: unknown): data is FinanceData {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  if (typeof d.currentBalance !== "number") return false;
  if (!Array.isArray(d.events)) return false;
  const eventsOk = d.events.every((e: unknown) => {
    if (!e || typeof e !== "object") return false;
    const ev = e as Record<string, unknown>;
    return (
      typeof ev.id === "string" &&
      typeof ev.date === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(ev.date as string) &&
      (ev.type === "income" || ev.type === "expense") &&
      typeof ev.amount === "number" &&
      typeof ev.label === "string"
    );
  });
  if (!eventsOk) return false;
  const optionalArrays = ["recurringPayments", "credits", "savings", "distributionRules", "confirmations"];
  for (const key of optionalArrays) {
    if (key in d && !Array.isArray(d[key])) return false;
  }
  return true;
}

export function Settings({
  data,
  onImport,
  onReset,
  onAddDistributionRule,
  onUpdateDistributionRule,
  onDeleteDistributionRule,
}: SettingsProps) {
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmImport, setConfirmImport] = useState<FinanceData | null>(null);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `finance-backup-${formatDate(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage({ text: "Данные экспортированы", isError: false });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (validateFinanceData(parsed)) {
          setConfirmImport(parsed);
        } else {
          setMessage({ text: "Неверный формат файла", isError: true });
        }
      } catch {
        setMessage({ text: "Ошибка чтения файла", isError: true });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const doImport = () => {
    if (confirmImport) {
      onImport(confirmImport);
      setConfirmImport(null);
      setMessage({ text: "Данные импортированы", isError: false });
    }
  };

  const doReset = () => {
    onReset();
    setConfirmReset(false);
    setMessage({ text: "Все данные удалены", isError: false });
  };

  return (
    <div className={styles.screen}>
      <div className={styles.title}>Настройки</div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Распределение дохода</div>
        <DistributionRulesEditor
          rules={data.distributionRules}
          credits={data.credits}
          savings={data.savings}
          onAdd={onAddDistributionRule}
          onUpdate={onUpdateDistributionRule}
          onDelete={onDeleteDistributionRule}
        />
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Данные</div>
        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={handleExport}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 14v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" />
              <polyline points="6,8 10,4 14,8" />
              <line x1="10" y1="4" x2="10" y2="13" />
            </svg>
            Экспорт данных
          </button>
          <button className={styles.actionBtn} onClick={() => fileRef.current?.click()}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 14v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" />
              <polyline points="6,10 10,14 14,10" />
              <line x1="10" y1="14" x2="10" y2="3" />
            </svg>
            Импорт данных
          </button>
          <button className={`${styles.actionBtn} ${styles.dangerBtn}`} onClick={() => setConfirmReset(true)}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4,5 5,16 15,16 16,5" />
              <line x1="2" y1="5" x2="18" y2="5" />
              <line x1="7" y1="3" x2="13" y2="3" />
            </svg>
            Удалить все данные
          </button>
        </div>
      </div>

      <input ref={fileRef} type="file" accept=".json" className={styles.hidden} onChange={handleFileSelect} />

      {message && (
        <div className={`${styles.message} ${message.isError ? styles.error : ""}`}>
          {message.text}
        </div>
      )}

      {confirmReset && (
        <div className={styles.confirmOverlay}>
          <div className={styles.confirmDialog}>
            <div className={styles.confirmText}>Удалить все данные? Это действие нельзя отменить.</div>
            <div className={styles.confirmButtons}>
              <button className={styles.confirmCancel} onClick={() => setConfirmReset(false)}>Отмена</button>
              <button className={styles.confirmOk} onClick={doReset}>Удалить</button>
            </div>
          </div>
        </div>
      )}

      {confirmImport && (
        <div className={styles.confirmOverlay}>
          <div className={styles.confirmDialog}>
            <div className={styles.confirmText}>Импортировать данные? Текущие данные будут заменены.</div>
            <div className={styles.confirmButtons}>
              <button className={styles.confirmCancel} onClick={() => setConfirmImport(null)}>Отмена</button>
              <button className={styles.confirmOk} onClick={doImport}>Импортировать</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
