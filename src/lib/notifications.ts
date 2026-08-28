import { LocalNotifications } from "@capacitor/local-notifications";
import type { PlanEvent } from "@/types";
import { isNative } from "./platform";
import { combineDateAndTime } from "./date";

/** Stable 31-bit int id from a string, required because LocalNotifications ids must be numbers. */
function numericId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % 2147483647;
}

// In-memory timers for the browser fallback path (best-effort: only fires while
// this tab/app is open and in memory — a real background alarm on the web needs a
// push server, which is out of scope for a client-only study app). On a native
// Android build this is unused; @capacitor/local-notifications schedules a real
// OS-level notification that survives the app being backgrounded or killed.
const webTimers = new Map<string, number>();

export async function requestNotificationPermission(): Promise<"granted" | "denied" | "prompt"> {
  if (isNative()) {
    const res = await LocalNotifications.requestPermissions();
    return res.display === "granted" ? "granted" : res.display === "denied" ? "denied" : "prompt";
  }
  if (!("Notification" in window)) return "denied";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  const result = await Notification.requestPermission();
  return result === "granted" ? "granted" : result === "denied" ? "denied" : "prompt";
}

export async function checkNotificationPermission(): Promise<"granted" | "denied" | "prompt"> {
  if (isNative()) {
    const res = await LocalNotifications.checkPermissions();
    return res.display === "granted" ? "granted" : res.display === "denied" ? "denied" : "prompt";
  }
  if (!("Notification" in window)) return "denied";
  return Notification.permission === "default" ? "prompt" : Notification.permission;
}

export async function scheduleEventReminder(event: PlanEvent): Promise<void> {
  if (!event.reminder) return;
  const fireAt = combineDateAndTime(event.date, event.time);
  // 5 minutes ahead of the plan slot so the student has a heads-up, not a post-mortem.
  fireAt.setMinutes(fireAt.getMinutes() - 5);
  if (fireAt.getTime() <= Date.now()) return;

  await cancelEventReminder(event.id);

  if (isNative()) {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: numericId(event.id),
          title: "Upcoming on your plan",
          body: event.time ? `${event.title} at ${event.time}` : event.title,
          schedule: { at: fireAt, allowWhileIdle: true },
        },
      ],
    });
    return;
  }

  if (!("Notification" in window) || Notification.permission !== "granted") return;
  const delay = fireAt.getTime() - Date.now();
  if (delay > 2_147_000_000) return; // setTimeout max ~24.8 days, ignore far-future web fallback
  const timer = window.setTimeout(() => {
    new Notification("Upcoming on your plan", { body: event.time ? `${event.title} at ${event.time}` : event.title });
    webTimers.delete(event.id);
  }, delay);
  webTimers.set(event.id, timer);
}

export async function cancelEventReminder(eventId: string): Promise<void> {
  if (isNative()) {
    await LocalNotifications.cancel({ notifications: [{ id: numericId(eventId) }] });
    return;
  }
  const timer = webTimers.get(eventId);
  if (timer) {
    window.clearTimeout(timer);
    webTimers.delete(eventId);
  }
}
