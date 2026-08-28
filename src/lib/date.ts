import {
  addDays,
  addWeeks,
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
  isToday as fnsIsToday,
  parseISO,
  startOfWeek,
  subDays,
} from "date-fns";

/** Canonical "date key" used everywhere in storage: local calendar date, no time. */
export function dateKey(d: Date = new Date()): string {
  return format(d, "yyyy-MM-dd");
}

export function todayKey(): string {
  return dateKey(new Date());
}

export function combineDateAndTime(dateISO: string, time: string | null): Date {
  if (!time) {
    // No explicit time chosen -> deadline is implicitly end of day, 23:59.
    return parseISO(`${dateISO}T23:59:00`);
  }
  return parseISO(`${dateISO}T${time}:00`);
}

export function formatDeadline(time: string | null): string {
  if (!time) return "11:59 PM";
  const [h, m] = time.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return format(d, "h:mm a");
}

export function formatFriendlyDate(dateISO: string): string {
  return format(parseISO(dateISO), "EEE, d MMM yyyy");
}

export function weekRange(anchor: Date): { start: Date; end: Date } {
  return {
    start: startOfWeek(anchor, { weekStartsOn: 1 }),
    end: endOfWeek(anchor, { weekStartsOn: 1 }),
  };
}

export function daysOfWeek(anchor: Date): Date[] {
  const { start, end } = weekRange(anchor);
  return eachDayOfInterval({ start, end });
}

export function shiftWeek(anchor: Date, delta: number): Date {
  return addWeeks(anchor, delta);
}

export { addDays, subDays, isSameDay, fnsIsToday as isToday, parseISO, format };
