import { useState } from "react";
import type { DistributionRule, Credit, SavingsAccount } from "../../types";
import styles from "./DistributionRules.module.css";

interface DistributionRulesEditorProps {
  rules: DistributionRule[];
  credits: Credit[];
  savings: SavingsAccount[];
  onAdd: (rule: Omit<DistributionRule, "id">) => void;
  onUpdate: (id: string, updates: Partial<DistributionRule>) => void;
  onDelete: (id: string) => void;
}

interface RuleFormState {
  label: string;
  percentage: string;
  targetType: DistributionRule["targetType"];
  targetId: string;
}

function emptyForm(): RuleFormState {
  return { label: "", percentage: "", targetType: "expense", targetId: "" };
}

export function DistributionRulesEditor({
  rules,
  credits,
  savings,
  onAdd,
  onUpdate,
  onDelete,
}: DistributionRulesEditorProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<RuleFormState>(emptyForm());
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const totalPercent = rules.reduce((sum, r) => sum + r.percentage, 0);

  const openAdd = () => {
    setForm(emptyForm());
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (rule: DistributionRule) => {
    setForm({
      label: rule.label,
      percentage: String(rule.percentage),
      targetType: rule.targetType,
      targetId: rule.targetId ?? "",
    });
    setEditingId(rule.id);
    setShowForm(true);
  };

  const handleSave = () => {
    const pct = parseFloat(form.percentage);
    if (!form.label.trim() || isNaN(pct) || pct <= 0) return;
    const rule: Omit<DistributionRule, "id"> = {
      label: form.label.trim(),
      percentage: pct,
      targetType: form.targetType,
      targetId: form.targetId || null,
    };
    if (editingId) {
      onUpdate(editingId, rule);
    } else {
      onAdd(rule);
    }
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (deletingId === id) {
      onDelete(id);
      setDeletingId(null);
    } else {
      setDeletingId(id);
      setTimeout(() => setDeletingId((c) => (c === id ? null : c)), 2000);
    }
  };

  const targetOptions = form.targetType === "credit"
    ? credits.map((c) => ({ id: c.id, label: c.label }))
    : form.targetType === "savings"
    ? savings.map((s) => ({ id: s.id, label: s.label }))
    : [];

  return (
    <div className={styles.editor}>
      {rules.length > 0 && (
        <div className={`${styles.totalBar} ${Math.abs(totalPercent - 100) > 0.01 ? styles.totalWarn : ""}`}>
          Итого: {totalPercent}%{Math.abs(totalPercent - 100) > 0.01 ? " ≠ 100% ⚠️" : " ✓"}
        </div>
      )}

      {rules.length === 0 && (
        <div className={styles.empty}>Нет правил распределения</div>
      )}

      {rules.map((rule) => (
        <div key={rule.id} className={styles.ruleItem}>
          <div className={styles.ruleInfo}>
            <span className={styles.ruleLabel}>{rule.label}</span>
            <span className={styles.ruleTarget}>
              {rule.targetType === "credit"
                ? credits.find((c) => c.id === rule.targetId)?.label ?? "Кредит"
                : rule.targetType === "savings"
                ? savings.find((s) => s.id === rule.targetId)?.label ?? "Накопления"
                : "Свободные средства"}
            </span>
          </div>
          <span className={styles.rulePct}>{rule.percentage}%</span>
          <button className={styles.ruleEditBtn} onClick={() => openEdit(rule)}>✎</button>
          <button
            className={`${styles.ruleDeleteBtn} ${deletingId === rule.id ? styles.deleteConfirm : ""}`}
            onClick={() => handleDelete(rule.id)}
          >
            {deletingId === rule.id ? "?" : "×"}
          </button>
        </div>
      ))}

      <button className={styles.addRuleBtn} onClick={openAdd}>
        + Добавить правило
      </button>

      {showForm && (
        <div className={styles.formOverlay} onClick={() => setShowForm(false)}>
          <div className={styles.formSheet} onClick={(e) => e.stopPropagation()}>
            <div className={styles.formTitle}>
              {editingId ? "Изменить правило" : "Новое правило"}
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>Название</label>
              <input
                className={styles.input}
                type="text"
                placeholder="На жизнь"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                autoFocus
              />
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>Процент (%)</label>
              <input
                className={styles.input}
                type="number"
                inputMode="decimal"
                placeholder="0"
                value={form.percentage}
                onChange={(e) => setForm({ ...form, percentage: e.target.value })}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>Тип</label>
              <div className={styles.typeToggle}>
                {(["expense", "credit", "savings"] as const).map((t) => (
                  <button
                    key={t}
                    className={`${styles.typeBtn} ${form.targetType === t ? styles.typeBtnActive : ""}`}
                    onClick={() => setForm({ ...form, targetType: t, targetId: "" })}
                  >
                    {t === "expense" ? "Расход" : t === "credit" ? "Кредит" : "Накопления"}
                  </button>
                ))}
              </div>
            </div>

            {targetOptions.length > 0 && (
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Привязка</label>
                <select
                  className={styles.select}
                  value={form.targetId}
                  onChange={(e) => setForm({ ...form, targetId: e.target.value })}
                >
                  <option value="">— не выбрано —</option>
                  {targetOptions.map((o) => (
                    <option key={o.id} value={o.id}>{o.label}</option>
                  ))}
                </select>
              </div>
            )}

            <div className={styles.formBtns}>
              <button className={styles.cancelBtn} onClick={() => setShowForm(false)}>Отмена</button>
              <button className={styles.saveBtn} onClick={handleSave}>Сохранить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
