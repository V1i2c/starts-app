import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Plus, ListTodo } from "lucide-react";
import { useStore, useVisibleSubjects } from "@/store/useStore";
import { todayKey } from "@/lib/date";
import { Segmented } from "@/components/ui/Segmented";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { TaskFormSheet } from "@/components/todo/TaskFormSheet";
import { TaskItem } from "@/components/todo/TaskItem";
import { HistoryView } from "@/components/todo/HistoryView";
import { SUBJECT_COLOR_STYLES } from "@/lib/subjectColors";
import type { Task } from "@/types";
import { cn } from "@/utils/cn";

export default function TodoPage() {
  const tasks = useStore((s) => s.tasks);
  const dailyLogs = useStore((s) => s.dailyLogs);
  const subjects = useVisibleSubjects();
  const addTask = useStore((s) => s.addTask);
  const updateTask = useStore((s) => s.updateTask);
  const toggleTask = useStore((s) => s.toggleTask);
  const deleteTask = useStore((s) => s.deleteTask);

  const [view, setView] = useState<"today" | "history">("today");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const todaysTasks = useMemo(() => tasks.filter((t) => t.date === todayKey()), [tasks]);
  const filtered = subjectFilter === "all" ? todaysTasks : todaysTasks.filter((t) => t.subjectId === subjectFilter);

  const grouped = useMemo(() => {
    if (subjectFilter !== "all") return null;
    const map = new Map<string, Task[]>();
    for (const t of filtered) {
      const key = t.subjectId ?? "__none__";
      map.set(key, [...(map.get(key) ?? []), t]);
    }
    return map;
  }, [filtered, subjectFilter]);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (t: Task) => {
    setEditing(t);
    setFormOpen(true);
  };

  const handleSubmit = (input: Parameters<typeof addTask>[0]) => {
    if (editing) updateTask(editing.id, input);
    else addTask(input);
  };

  return (
    <div className="space-y-4 rise-in">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">To‑Do</h1>
        <Segmented
          value={view}
          onChange={setView}
          options={[
            { value: "today", label: "Today" },
            { value: "history", label: "History" },
          ]}
        />
      </div>

      {view === "today" ? (
        <>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <FilterChip active={subjectFilter === "all"} onClick={() => setSubjectFilter("all")} label="All" />
            {subjects.map((s) => (
              <FilterChip
                key={s.id}
                active={subjectFilter === s.id}
                onClick={() => setSubjectFilter(s.id)}
                label={s.name}
                dotClass={SUBJECT_COLOR_STYLES[s.color].dot}
              />
            ))}
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={ListTodo}
              title="Nothing here yet"
              description="Add today's first task — you can always edit the deadline later."
              action={
                <Button size="sm" onClick={openAdd}>
                  <Plus size={15} /> Add task
                </Button>
              }
            />
          ) : grouped ? (
            <div className="space-y-4">
              {[...grouped.entries()].map(([key, list]) => {
                const subject = subjects.find((s) => s.id === key);
                return (
                  <div key={key}>
                    <p className="mb-2 flex items-center gap-1.5 px-1 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                      {subject && <span className={cn("h-1.5 w-1.5 rounded-full", SUBJECT_COLOR_STYLES[subject.color].dot)} />}
                      {subject ? subject.name : "No subject"}
                    </p>
                    <div className="space-y-2">
                      <AnimatePresence initial={false}>
                        {list.map((t) => (
                          <TaskItem
                            key={t.id}
                            task={t}
                            subject={subject}
                            onToggle={() => toggleTask(t.id)}
                            onEdit={() => openEdit(t)}
                            onDelete={() => setConfirmDeleteId(t.id)}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {filtered.map((t) => (
                  <TaskItem
                    key={t.id}
                    task={t}
                    subject={subjects.find((s) => s.id === t.subjectId)}
                    onToggle={() => toggleTask(t.id)}
                    onEdit={() => openEdit(t)}
                    onDelete={() => setConfirmDeleteId(t.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}

          <button
            onClick={openAdd}
            className="fixed bottom-24 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-white shadow-xl shadow-brand-500/40 transition-transform active:scale-95 sm:right-[max(1.5rem,calc(50vw-224px+1.5rem))]"
            aria-label="Add task"
          >
            <Plus size={24} />
          </button>
        </>
      ) : (
        <HistoryView logs={dailyLogs} tasks={tasks} subjects={subjects} />
      )}

      <TaskFormSheet open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} initial={editing} />
      <ConfirmDialog
        open={!!confirmDeleteId}
        title="Delete this task?"
        description="This can't be undone. Its history record for today will stay so your streak isn't affected."
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          if (confirmDeleteId) deleteTask(confirmDeleteId);
          setConfirmDeleteId(null);
        }}
      />
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  dotClass,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  dotClass?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active ? "border-ink bg-ink text-paper" : "border-ink/15 text-ink-soft",
      )}
    >
      {dotClass && <span className={cn("h-1.5 w-1.5 rounded-full", dotClass)} />}
      {label}
    </button>
  );
}
