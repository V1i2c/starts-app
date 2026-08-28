import { subDays } from "date-fns";
import type { DailyLog } from "@/types";
import { dateKey } from "./date";

function isActiveDay(log: DailyLog | undefined): boolean {
  if (!log) return false;
  return log.tasksCompleted > 0 || log.planEventsCompleted > 0 || log.errorsReviewed > 0;
}

export interface StreakInfo {
  current: number;
  best: number;
  activeToday: boolean;
  /** true when yesterday was missed and today hasn't been logged yet -> streak is "at risk" */
  atRisk: boolean;
}

/**
 * Derived (never stored) so it can't drift out of sync with the underlying logs.
 * A streak stays alive through "today" even if today has no activity yet — it only
 * breaks once a full day (yesterday) passes with nothing logged.
 */
export function computeStreak(logs: Record<string, DailyLog>, today: Date = new Date()): StreakInfo {
  const activeToday = isActiveDay(logs[dateKey(today)]);

  let current = 0;
  let cursor = today;
  if (!activeToday) {
    cursor = subDays(today, 1);
  }
  // walk backwards counting consecutive active days
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const key = dateKey(cursor);
    if (isActiveDay(logs[key])) {
      current += 1;
      cursor = subDays(cursor, 1);
    } else {
      break;
    }
  }

  // best streak across all recorded history
  const allDates = Object.keys(logs).sort();
  let best = 0;
  let running = 0;
  let prev: string | null = null;
  for (const key of allDates) {
    if (!isActiveDay(logs[key])) {
      running = 0;
      prev = key;
      continue;
    }
    if (prev) {
      const prevDate = new Date(prev);
      const expected = dateKey(new Date(prevDate.getTime() + 86400000));
      running = expected === key ? running + 1 : 1;
    } else {
      running = 1;
    }
    best = Math.max(best, running);
    prev = key;
  }
  best = Math.max(best, current);

  const yesterdayActive = isActiveDay(logs[dateKey(subDays(today, 1))]);
  const atRisk = !activeToday && yesterdayActive;

  return { current, best, activeToday, atRisk };
}

/** Last N days of activity, oldest first — used for the consistency heatmap. */
export function recentActivity(logs: Record<string, DailyLog>, days: number, today: Date = new Date()) {
  const out: { date: string; log: DailyLog | undefined; active: boolean }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = subDays(today, i);
    const key = dateKey(d);
    out.push({ date: key, log: logs[key], active: isActiveDay(logs[key]) });
  }
  return out;
}
