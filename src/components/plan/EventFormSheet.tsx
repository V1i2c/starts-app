import { useEffect, useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useVisibleSubjects } from "@/store/useStore";
import type { PlanEvent } from "@/types";
import { BellRing } from "lucide-react";
import { cn } from "@/utils/cn";

interface EventFormSheetProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: {
    title: string;
    subjectId: string | null;
    notes?: string;
    date: string;
    time: string | null;
    reminder: boolean;
  }) => void;
  defaultDate: string;
  initial?: PlanEvent | null;
}

export function EventFormSheet({ open, onClose, onSubmit, defaultDate, initial }: EventFormSheetProps) {
  const subjects = useVisibleSubjects();
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState("");
  const [reminder, setReminder] = useState(true);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) return;
    setTitle(initial?.title ?? "");
    setSubjectId(initial?.subjectId ?? "");
    setDate(initial?.date ?? defaultDate);
    setTime(initial?.time ?? "");
    setReminder(initial?.reminder ?? true);
    setNotes(initial?.notes ?? "");
  }, [open, initial, defaultDate]);

  const canSave = title.trim().length > 0;
  const submit = () => {
    if (!canSave) return;
    onSubmit({ title, subjectId: subjectId || null, notes: notes || undefined, date, time: time || null, reminder });
    onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={initial ? "Edit plan item" : "New plan item"}
      footer={
        <Button className="w-full" size="lg" disabled={!canSave} onClick={submit}>
          {initial ? "Save changes" : "Add to plan"}
        </Button>
      }
    >
      <Field label="What's planned">
        <Input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Still-life practice sheet" />
      </Field>
      <Field label="Subject (optional)">
        <Select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
          <option value="">No subject</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Date">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="Time (optional)">
          <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </Field>
      </div>
      <button
        type="button"
        onClick={() => setReminder((r) => !r)}
        className={cn(
          "mb-4 flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left text-sm transition-colors",
          reminder ? "border-brand-300 bg-brand-50 text-brand-700" : "border-ink/15 text-ink-soft",
        )}
      >
        <BellRing size={16} />
        <span className="flex-1">Remind me 5 minutes before</span>
        <span className={cn("h-5 w-9 rounded-full p-0.5 transition-colors", reminder ? "bg-brand-500" : "bg-ink/15")}>
          <span className={cn("block h-4 w-4 rounded-full bg-white transition-transform", reminder && "translate-x-4")} />
        </span>
      </button>
      <Field label="Notes (optional)">
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Materials needed, reference links…" />
      </Field>
    </Sheet>
  );
}
