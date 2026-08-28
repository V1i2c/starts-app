import { ListChecks, CalendarClock, NotebookPen } from "lucide-react";
import { ProgressRing } from "@/components/ui/ProgressRing";

export function TodaySnapshot({
  tasksDone,
  tasksTotal,
  eventsToday,
  errorsDue,
}: {
  tasksDone: number;
  tasksTotal: number;
  eventsToday: number;
  errorsDue: number;
}) {
  const ratio = tasksTotal === 0 ? 0 : tasksDone / tasksTotal;
  return (
    <div className="rounded-3xl border border-ink/10 bg-white/60 p-5">
      <div className="flex items-center gap-4">
        <ProgressRing value={ratio} size={84} stroke={8}>
          <div className="text-center">
            <p className="font-display text-lg font-bold text-ink">
              {tasksDone}/{tasksTotal}
            </p>
            <p className="text-[10px] uppercase tracking-wide text-ink-soft">today</p>
          </div>
        </ProgressRing>
        <div className="flex-1 space-y-2.5">
          <Row icon={ListChecks} label="Tasks done today" value={`${tasksDone} of ${tasksTotal}`} />
          <Row icon={CalendarClock} label="Plan items today" value={`${eventsToday}`} />
          <Row icon={NotebookPen} label="Errors due for revision" value={`${errorsDue}`} accent={errorsDue > 0} />
        </div>
      </div>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof ListChecks;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon size={15} className={accent ? "text-brand-600" : "text-ink-soft"} />
      <span className="flex-1 text-ink-soft">{label}</span>
      <span className={accent ? "font-semibold text-brand-600" : "font-medium text-ink"}>{value}</span>
    </div>
  );
}
