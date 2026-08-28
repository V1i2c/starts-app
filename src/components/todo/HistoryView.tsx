import { useMemo, useState } from "react";
import { ChevronDown, ListChecks, NotebookPen, CalendarClock } from "lucide-react";
import type { DailyLog, Subject, Task } from "@/types";
import { formatFriendlyDate } from "@/lib/date";
import { SUBJECT_COLOR_STYLES } from "@/lib/subjectColors";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/utils/cn";

export function HistoryView({
  logs,
  tasks,
  subjects,
}: {
  logs: Record<string, DailyLog>;
  tasks: Task[];
  subjects: Subject[];
}) {
  const [openDate, setOpenDate] = useState<string | null>(null);

  const dates = useMemo(
    () =>
      Object.values(logs)
        .filter((l) => l.tasksCreated + l.tasksCompleted + l.errorsAdded + l.errorsReviewed + l.planEventsCompleted > 0)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [logs],
  );

  if (dates.length === 0) {
    return (
      <EmptyState
        icon={CalendarClock}
        title="No history yet"
        description="Once you complete tasks or review a mistake, your day-by-day record shows up here."
      />
    );
  }

  return (
    <div className="space-y-2">
      {dates.map((log) => {
        const dayTasks = tasks.filter((t) => t.date === log.date);
        const open = openDate === log.date;
        return (
          <div key={log.date} className="overflow-hidden rounded-2xl border border-ink/10 bg-white/60">
            <button
              className="flex w-full items-center justify-between px-4 py-3 text-left"
              onClick={() => setOpenDate(open ? null : log.date)}
            >
              <div>
                <p className="text-sm font-semibold text-ink">{formatFriendlyDate(log.date)}</p>
                <p className="mt-0.5 flex items-center gap-3 text-xs text-ink-soft">
                  <span className="flex items-center gap-1">
                    <ListChecks size={11} /> {log.tasksCompleted}/{log.tasksCreated} tasks
                  </span>
                  <span className="flex items-center gap-1">
                    <NotebookPen size={11} /> {log.errorsAdded} logged · {log.errorsReviewed} reviewed
                  </span>
                </p>
              </div>
              <ChevronDown size={16} className={cn("text-ink-soft transition-transform", open && "rotate-180")} />
            </button>
            {open && dayTasks.length > 0 && (
              <div className="space-y-1.5 border-t border-ink/10 px-4 py-3">
                {dayTasks.map((t) => {
                  const subject = subjects.find((s) => s.id === t.subjectId);
                  const style = subject ? SUBJECT_COLOR_STYLES[subject.color] : null;
                  return (
                    <div key={t.id} className="flex items-center gap-2 text-xs">
                      <span className={cn("h-1.5 w-1.5 rounded-full", t.status === "done" ? "bg-emerald-500" : "bg-ink/20")} />
                      <span className={cn("flex-1 truncate", t.status === "done" ? "text-ink-soft line-through" : "text-ink")}>
                        {t.title}
                      </span>
                      {subject && style && <span className={cn("rounded-full px-1.5 py-0.5", style.soft, style.text)}>{subject.name}</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
