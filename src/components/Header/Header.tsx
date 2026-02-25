import { useState, useRef, useEffect } from "react";
import styles from "./Header.module.css";

interface HeaderProps {
  currentBalance: number;
  dailyAllowance: number;
  onBalanceChange: (balance: number) => void;
  onSettingsClick: () => void;
}

export function Header({
  currentBalance,
  dailyAllowance,
  onBalanceChange,
  onSettingsClick,
}: HeaderProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const startEdit = () => {
    setEditValue(String(currentBalance));
    setEditing(true);
  };

  const confirmEdit = () => {
    const parsed = parseFloat(editValue);
    if (!isNaN(parsed)) {
      onBalanceChange(parsed);
    }
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") confirmEdit();
    if (e.key === "Escape") setEditing(false);
  };

  const formatNumber = (n: number) =>
    n.toLocaleString("ru-RU", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  return (
    <header className={styles.header}>
      <div className={styles.balanceArea}>
        <div className={styles.balanceLabel}>Баланс</div>
        {editing ? (
          <input
            ref={inputRef}
            type="number"
            className={styles.balanceInput}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={confirmEdit}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <div className={styles.balanceValue} onClick={startEdit}>
            {formatNumber(currentBalance)}
          </div>
        )}
        <div className={styles.allowance}>
          <span className={styles.allowanceAmount}>
            {formatNumber(Math.round(dailyAllowance))}
          </span>{" "}
          / день
        </div>
      </div>
      <button
        className={styles.settingsBtn}
        onClick={onSettingsClick}
        aria-label="Настройки"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>
    </header>
  );
}
