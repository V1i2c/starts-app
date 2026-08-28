import { motion } from "framer-motion";
import { Check, BellRing, Pencil, Trash2 } from "lucide-react";
import type { PlanEvent, Subject } from "@/types";
import { SUBJECT_COLOR_STYLES } from "@/lib/subjectColors";
import { cn } from "@/utils/cn";

export function EventItem({
  event,
  subject,
  onToggle,
  onEdit,
  onDelete,
}: {
  event: PlanEvent;
  subject: Subject | undefined;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const style = subject ? SUBJECT_COLOR_STYLES[subject.color] : null;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      className="group flex items-start gap-3 rounded-2xl border border-ink/10 bg-white/60 p-3.5"
    >
      <div className="w-12 shrink-0 pt-0.5 text-center">
        <p className="text-xs font-semibold text-ink">{event.time ?? "All day"}</p>
      </div>
      <button
        onClick={onToggle}
        className={cn(
          "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          event.done ? "border-brand-500 bg-brand-500 text-white" : "border-ink/25 text-transparent hover:border-brand-400",
        )}
      >
        <Check size={14} strokeWidth={3} />
      </button>
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm font-medium text-ink", event.done && "text-ink-soft line-through")}>{event.title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink-soft">
          {subject && style && (
            <span className={cn("flex items-center gap-1 rounded-full px-2 py-0.5", style.soft, style.text)}>
              <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
              {subject.name}
            </span>
          )}
          {event.reminder && (
            <span className="flex items-center gap-1 text-brand-600">
              <BellRing size={11} /> Reminder set
            </span>
          )}
        </div>
        {event.notes && <p className="mt-1.5 text-xs leading-relaxed text-ink-soft/90">{event.notes}</p>}
      </div>
      <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 sm:opacity-100">
        <button onClick={onEdit} className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-ink/5">
          <Pencil size={14} />
        </button>
        <button onClick={onDelete} className="flex h-8 w-8 items-center justify-center rounded-full text-rose-500 hover:bg-rose-50">
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  );
}
