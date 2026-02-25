import styles from "./TabBar.module.css";

export type TabName = "today" | "calendar" | "obligations" | "settings";

interface TabBarProps {
  activeTab: TabName;
  onTabChange: (tab: TabName) => void;
}

const tabs: { id: TabName; label: string; icon: React.ReactNode }[] = [
  {
    id: "today",
    label: "Сегодня",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="9" />
        <polyline points="11,6 11,11 14,13" />
      </svg>
    ),
  },
  {
    id: "calendar",
    label: "Календарь",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="16" height="15" rx="3" />
        <line x1="3" y1="9" x2="19" y2="9" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="14" y1="2" x2="14" y2="6" />
      </svg>
    ),
  },
  {
    id: "obligations",
    label: "Обязательства",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
        <line x1="6" y1="9" x2="16" y2="9" />
        <line x1="6" y1="13" x2="12" y2="13" />
      </svg>
    ),
  },
  {
    id: "settings",
    label: "Настройки",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="3" />
        <path d="M11 2v2m0 16v2M4.22 4.22l1.42 1.42m10.7 10.7 1.42 1.42M2 11h2m16 0h2M4.22 17.78l1.42-1.42m10.7-10.7 1.42-1.42" />
      </svg>
    ),
  },
];

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <nav className={styles.tabBar}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`${styles.tab} ${activeTab === tab.id ? styles.active : ""}`}
          onClick={() => onTabChange(tab.id)}
        >
          <span className={styles.icon}>{tab.icon}</span>
          <span className={styles.label}>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
