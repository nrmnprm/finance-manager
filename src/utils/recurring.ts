import type { RecurringPayment, Confirmation, FinanceEvent } from "../types";

/**
 * Add months to a date, clamping the day to the last day of the resulting month.
 */
function addMonths(date: Date, n: number): Date {
  const d = new Date(date);
  const targetMonth = d.getMonth() + n;
  const targetYear = d.getFullYear() + Math.floor(targetMonth / 12);
  const normalizedMonth = ((targetMonth % 12) + 12) % 12;
  const lastDay = new Date(targetYear, normalizedMonth + 1, 0).getDate();
  d.setFullYear(targetYear, normalizedMonth, Math.min(date.getDate(), lastDay));
  return d;
}

function parseDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Returns all occurrence dates for a recurring payment within [rangeStart, rangeEnd].
 */
export function getOccurrencesInRange(
  anchorDate: string,
  frequency: RecurringPayment["frequency"],
  rangeStart: string,
  rangeEnd: string
): string[] {
  const anchor = parseDate(anchorDate);
  const start = parseDate(rangeStart);
  const end = parseDate(rangeEnd);
  const results: string[] = [];

  if (frequency === "monthly") {
    // Find first occurrence on or after start
    let current = new Date(anchor);
    // Step back to anchor in the same month as start, then iterate forward
    const startYear = start.getFullYear();
    const startMonth = start.getMonth();
    const anchorMonth = anchor.getMonth();
    const anchorYear = anchor.getFullYear();

    // Number of months from anchor to reach start's month
    const monthDiff = (startYear - anchorYear) * 12 + (startMonth - anchorMonth);
    // Start from the occurrence in startMonth (or one before)
    current = addMonths(anchor, Math.max(0, monthDiff - 1));

    while (current <= end) {
      if (current >= start) {
        results.push(toDateString(current));
      }
      current = addMonths(current, 1);
    }
  } else {
    const step = frequency === "weekly" ? 7 : 14;
    // Find first occurrence >= start
    const anchor0 = anchor.getTime();
    const start0 = start.getTime();
    const diffDays = Math.ceil((start0 - anchor0) / 86400000);
    const stepsNeeded = diffDays > 0 ? Math.ceil(diffDays / step) : 0;
    let current = new Date(anchor.getTime() + stepsNeeded * step * 86400000);

    while (current <= end) {
      if (current >= start) {
        results.push(toDateString(current));
      }
      current = new Date(current.getTime() + step * 86400000);
    }
  }

  return results;
}

export function findConfirmation(
  recurringId: string,
  occurrenceDate: string,
  confirmations: Confirmation[],
  flexDate: number
): Confirmation | undefined {
  const occurrence = parseDate(occurrenceDate);
  return confirmations.find((c) => {
    if (c.recurringId !== recurringId) return false;
    const confDate = parseDate(c.date);
    const diffDays = Math.abs(
      (confDate.getTime() - occurrence.getTime()) / 86400000
    );
    return diffDays <= Math.max(0, flexDate);
  });
}

/**
 * Generates virtual FinanceEvent objects from recurring payments.
 * Virtual events have IDs of the form "recurring-{paymentId}-{YYYY-MM-DD}".
 */
export function generateVirtualEvents(
  recurringPayments: RecurringPayment[],
  confirmations: Confirmation[],
  rangeStart: string,
  rangeEnd: string
): FinanceEvent[] {
  const events: FinanceEvent[] = [];

  for (const rp of recurringPayments) {
    const occurrences = getOccurrencesInRange(
      rp.anchorDate,
      rp.frequency,
      rangeStart,
      rangeEnd
    );

    for (const date of occurrences) {
      const conf = findConfirmation(rp.id, date, confirmations, rp.flexDate);
      events.push({
        id: `recurring-${rp.id}-${date}`,
        date,
        type: rp.type,
        amount: conf ? conf.actualAmount : rp.amount,
        label: rp.label,
        confirmed: conf ? conf.confirmed : false,
      });
    }
  }

  return events;
}

/** Returns the next occurrence date after today (or today itself if applicable). */
export function getNextOccurrence(
  anchorDate: string,
  frequency: RecurringPayment["frequency"],
  afterDate: string
): string | null {
  // Look 2 years ahead
  const endDate = (() => {
    const d = parseDate(afterDate);
    d.setFullYear(d.getFullYear() + 2);
    return toDateString(d);
  })();
  const occurrences = getOccurrencesInRange(anchorDate, frequency, afterDate, endDate);
  return occurrences[0] ?? null;
}
