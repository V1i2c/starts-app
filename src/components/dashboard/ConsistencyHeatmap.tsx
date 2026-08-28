import { useMemo } from "react";
import type { DailyLog } from "@/types";
import { recentActivity } from "@/lib/streak";
import { format, parseISO } from "date-fns";
import { cn } from "@/utils/cn";

function intensity(log: DailyLog | undefined): number {
  if (!log) return 0;
  const score = log.tasksCompleted + log.planEventsCompleted + log.errorsReviewed * 1.5;
  if (score <= 0) return 0;
  if (score < 2) return 1;
  if (score < 4) return 2;
  if (score < 7) return 3;
  return 4;
}

const SHADES = ["bg-ink/[0.06]", "bg-brand-200", "bg-brand-300", "bg-brand-500", "bg-brand-700"];

export function ConsistencyHeatmap({ logs }: { logs: Record<string, DailyLog> }) {
  const days = useMemo(() => recentActivity(logs, 70), [logs]);
  const weeks = useMemo(() => {
    const out: (typeof days)[] = [];
    for (let i = 0; i < days.length; i += 7) out.push(days.slice(i, i + 7));
    return out;
  }, [days]);

  const activeDays = days.filter((d) => d.active).length;

  return (
    <div className="rounded-3xl border border-ink/10 bg-white/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-ink">Consistency, last 10 weeks</p>
        <span className="text-xs text-ink-soft">{activeDays} active days</span>
      </div>
      <div className="flex gap-1 overflow-x-auto pb-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day) => (
              <div
                key={day.date}
                title={`${format(parseISO(day.date), "d MMM")} — ${day.log?.tasksCompleted ?? 0} tasks, ${day.log?.errorsReviewed ?? 0} reviews`}
                className={cn("h-3 w-3 rounded-[3px]", SHADES[intensity(day.log)])}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-ink-soft/70">
        <span>less</span>
        {SHADES.map((s) => (
          <span key={s} className={cn("h-2.5 w-2.5 rounded-[2px]", s)} />
        ))}
        <span>more</span>
      </div>
    </div>
  );
}
