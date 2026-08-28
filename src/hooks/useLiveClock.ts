import { useEffect, useState } from "react";

/**
 * Drives the Dashboard's live date/time display and lets the app notice a
 * midnight rollover (new "today") while it's sitting open — e.g. a task list
 * left open overnight should re-bucket into a new day without a manual refresh.
 */
export function useLiveClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    // tick every second, but a full re-render every second is only cheap because
    // this hook is used in exactly one small header component, not the whole tree.
    const id = window.setInterval(() => setNow(new Date()), 1000);
    const onVisible = () => {
      if (document.visibilityState === "visible") setNow(new Date());
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return now;
}
