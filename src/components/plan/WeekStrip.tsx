import { format, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PlanEvent } from "@/types";
import { cn } from "@/utils/cn";

export function WeekStrip({
  days,
  selected,
  onSelect,
  onPrevWeek,
  onNextWeek,
  onToday,
  events,
}: {
  days: Date[];
  selected: Date;
  onSelect: (d: Date) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  events: PlanEvent[];
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="font-display text-sm font-semibold text-ink">
          {format(days[0], "d MMM")} – {format(days[6], "d MMM yyyy")}
        </p>
        <div className="flex items-center gap-1">
          <button onClick={onToday} className="rounded-full px-2.5 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50">
            Today
          </button>
          <button onClick={onPrevWeek} className="flex h-7 w-7 items-center justify-center rounded-full text-ink-soft hover:bg-ink/5">
            <ChevronLeft size={16} />
          </button>
          <button onClick={onNextWeek} className="flex h-7 w-7 items-center justify-center rounded-full text-ink-soft hover:bg-ink/5">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day) => {
          const isSelected = isSameDay(day, selected);
          const isToday = isSameDay(day, new Date());
          const dayEvents = events.filter((e) => e.date === format(day, "yyyy-MM-dd"));
          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelect(day)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-2xl py-2 transition-colors",
                isSelected ? "bg-ink text-paper" : "text-ink hover:bg-ink/5",
              )}
            >
              <span className={cn("text-[10px] uppercase", isSelected ? "text-paper/70" : "text-ink-soft")}>
                {format(day, "EEE")}
              </span>
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                  isToday && !isSelected && "bg-brand-100 text-brand-600",
                )}
              >
                {format(day, "d")}
              </span>
              <span className="flex h-1.5 items-center gap-0.5">
                {dayEvents.slice(0, 3).map((e) => (
                  <span key={e.id} className={cn("h-1 w-1 rounded-full", isSelected ? "bg-paper/80" : "bg-brand-400")} />
                ))}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
