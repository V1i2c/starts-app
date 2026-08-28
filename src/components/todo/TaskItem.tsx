import { motion } from "framer-motion";
import { Check, Clock, Pencil, Trash2 } from "lucide-react";
import type { Subject, Task } from "@/types";
import { SUBJECT_COLOR_STYLES } from "@/lib/subjectColors";
import { formatDeadline } from "@/lib/date";
import { cn } from "@/utils/cn";

export function TaskItem({
  task,
  subject,
  onToggle,
  onEdit,
  onDelete,
}: {
  task: Task;
  subject: Subject | undefined;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const done = task.status === "done";
  const style = subject ? SUBJECT_COLOR_STYLES[subject.color] : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      className="group flex items-start gap-3 rounded-2xl border border-ink/10 bg-white/60 p-3.5"
    >
      <button
        onClick={onToggle}
        aria-label={done ? "Mark as pending" : "Mark as done"}
        className={cn(
          "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          done ? "border-brand-500 bg-brand-500 text-white" : "border-ink/25 text-transparent hover:border-brand-400",
        )}
      >
        <Check size={14} strokeWidth={3} />
      </button>

      <div className="min-w-0 flex-1">
        <p className={cn("text-sm font-medium text-ink", done && "text-ink-soft line-through")}>{task.title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink-soft">
          {subject && style && (
            <span className={cn("flex items-center gap-1 rounded-full px-2 py-0.5", style.soft, style.text)}>
              <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
              {subject.name}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {formatDeadline(task.time)}
          </span>
        </div>
        {task.notes && <p className="mt-1.5 text-xs leading-relaxed text-ink-soft/90">{task.notes}</p>}
      </div>

      <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 sm:opacity-100">
        <button onClick={onEdit} aria-label="Edit" className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-ink/5">
          <Pencil size={14} />
        </button>
        <button onClick={onDelete} aria-label="Delete" className="flex h-8 w-8 items-center justify-center rounded-full text-rose-500 hover:bg-rose-50">
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  );
}
