import { useMemo } from "react";
import { format } from "date-fns";
import { useStore, useVisibleSubjects } from "@/store/useStore";
import { useLiveClock } from "@/hooks/useLiveClock";
import { computeStreak } from "@/lib/streak";
import { todayKey } from "@/lib/date";
import { StreakCard } from "@/components/dashboard/StreakCard";
import { TodaySnapshot } from "@/components/dashboard/TodaySnapshot";
import { ConsistencyHeatmap } from "@/components/dashboard/ConsistencyHeatmap";
import { ReviewDueList } from "@/components/dashboard/ReviewDueList";

function greeting(hour: number) {
  if (hour < 5) return "Working late";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

export default function DashboardPage() {
  const now = useLiveClock();
  const studentName = useStore((s) => s.studentName);
  const tasks = useStore((s) => s.tasks);
  const planEvents = useStore((s) => s.planEvents);
  const errors = useStore((s) => s.errors);
  const dailyLogs = useStore((s) => s.dailyLogs);
  const markErrorReviewed = useStore((s) => s.markErrorReviewed);
  const subjects = useVisibleSubjects();

  const streak = useMemo(() => computeStreak(dailyLogs, now), [dailyLogs, now]);

  const today = todayKey();
  const todaysTasks = tasks.filter((t) => t.date === today);
  const tasksDone = todaysTasks.filter((t) => t.status === "done").length;
  const eventsToday = planEvents.filter((e) => e.date === today).length;

  const dueEntries = useMemo(
    () =>
      errors
        .filter((e) => !e.resolved && e.nextReviewDate <= today)
        .sort((a, b) => a.nextReviewDate.localeCompare(b.nextReviewDate)),
    [errors, today],
  );

  return (
    <div className="space-y-4 rise-in">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
          {format(now, "EEEE, d MMMM yyyy")} · {format(now, "h:mm:ss a")}
        </p>
        <h1 className="mt-0.5 font-display text-2xl font-semibold text-ink">
          {greeting(now.getHours())}
          {studentName ? `, ${studentName}` : ""}
        </h1>
      </div>

      <StreakCard streak={streak} />
      <TodaySnapshot
        tasksDone={tasksDone}
        tasksTotal={todaysTasks.length}
        eventsToday={eventsToday}
        errorsDue={dueEntries.length}
      />
      <ReviewDueList entries={dueEntries} subjects={subjects} onReview={markErrorReviewed} />
      <ConsistencyHeatmap logs={dailyLogs} />
    </div>
  );
}
