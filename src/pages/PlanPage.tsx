import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Plus, CalendarDays } from "lucide-react";
import { useStore, useVisibleSubjects } from "@/store/useStore";
import { daysOfWeek, shiftWeek } from "@/lib/date";
import { scheduleEventReminder, cancelEventReminder } from "@/lib/notifications";
import { WeekStrip } from "@/components/plan/WeekStrip";
import { EventItem } from "@/components/plan/EventItem";
import { EventFormSheet } from "@/components/plan/EventFormSheet";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import type { PlanEvent } from "@/types";

export default function PlanPage() {
  const [anchor, setAnchor] = useState(new Date());
  const [selected, setSelected] = useState(new Date());
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PlanEvent | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const planEvents = useStore((s) => s.planEvents);
  const subjects = useVisibleSubjects();
  const addPlanEvent = useStore((s) => s.addPlanEvent);
  const updatePlanEvent = useStore((s) => s.updatePlanEvent);
  const toggleEventDone = useStore((s) => s.toggleEventDone);
  const deleteEvent = useStore((s) => s.deleteEvent);

  const days = useMemo(() => daysOfWeek(anchor), [anchor]);
  const selectedKey = format(selected, "yyyy-MM-dd");
  const dayEvents = useMemo(
    () => planEvents.filter((e) => e.date === selectedKey).sort((a, b) => (a.time ?? "99:99").localeCompare(b.time ?? "99:99")),
    [planEvents, selectedKey],
  );

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (e: PlanEvent) => {
    setEditing(e);
    setFormOpen(true);
  };

  const handleSubmit = async (input: Parameters<typeof addPlanEvent>[0]) => {
    if (editing) {
      updatePlanEvent(editing.id, input);
      const updated = { ...editing, ...input };
      if (input.reminder) await scheduleEventReminder(updated);
      else await cancelEventReminder(editing.id);
    } else {
      const created = addPlanEvent(input);
      if (created.reminder) await scheduleEventReminder(created);
    }
  };

  return (
    <div className="space-y-4 rise-in">
      <h1 className="font-display text-2xl font-semibold text-ink">Plan</h1>

      <div className="rounded-3xl border border-ink/10 bg-white/60 p-4">
        <WeekStrip
          days={days}
          selected={selected}
          onSelect={setSelected}
          onPrevWeek={() => setAnchor((a) => shiftWeek(a, -1))}
          onNextWeek={() => setAnchor((a) => shiftWeek(a, 1))}
          onToday={() => {
            setAnchor(new Date());
            setSelected(new Date());
          }}
          events={planEvents}
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-ink">{format(selected, "EEEE, d MMMM")}</p>
        <Button size="sm" variant="secondary" onClick={openAdd}>
          <Plus size={14} /> Add
        </Button>
      </div>

      {dayEvents.length === 0 ? (
        <EmptyState icon={CalendarDays} title="Nothing planned" description="Add a task, revision slot, or reminder for this day." />
      ) : (
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {dayEvents.map((e) => (
              <EventItem
                key={e.id}
                event={e}
                subject={subjects.find((s) => s.id === e.subjectId)}
                onToggle={() => toggleEventDone(e.id)}
                onEdit={() => openEdit(e)}
                onDelete={() => setConfirmDeleteId(e.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <EventFormSheet
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        defaultDate={selectedKey}
        initial={editing}
      />
      <ConfirmDialog
        open={!!confirmDeleteId}
        title="Delete this plan item?"
        description="Any scheduled reminder for it will be cancelled too."
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          if (confirmDeleteId) {
            deleteEvent(confirmDeleteId);
            cancelEventReminder(confirmDeleteId);
          }
          setConfirmDeleteId(null);
        }}
      />
    </div>
  );
}
