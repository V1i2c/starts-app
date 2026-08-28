import { useEffect, useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useVisibleSubjects } from "@/store/useStore";
import type { Task } from "@/types";
import { todayKey } from "@/lib/date";

interface TaskFormSheetProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: { title: string; subjectId: string | null; notes?: string; date: string; time: string | null }) => void;
  initial?: Task | null;
}

export function TaskFormSheet({ open, onClose, onSubmit, initial }: TaskFormSheetProps) {
  const subjects = useVisibleSubjects();
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState<string>("");
  const [date, setDate] = useState(todayKey());
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) return;
    setTitle(initial?.title ?? "");
    setSubjectId(initial?.subjectId ?? "");
    setDate(initial?.date ?? todayKey());
    setTime(initial?.time ?? "");
    setNotes(initial?.notes ?? "");
  }, [open, initial]);

  const canSave = title.trim().length > 0;

  const submit = () => {
    if (!canSave) return;
    onSubmit({ title, subjectId: subjectId || null, notes: notes || undefined, date, time: time || null });
    onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={initial ? "Edit task" : "New task"}
      footer={
        <Button className="w-full" size="lg" disabled={!canSave} onClick={submit}>
          {initial ? "Save changes" : "Add task"}
        </Button>
      }
    >
      <Field label="Task">
        <Input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Finish shading study" />
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
        <Field label="Deadline" hint="Blank = 11:59 PM">
          <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </Field>
      </div>
      <Field label="Notes (optional)">
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any extra detail…" />
      </Field>
    </Sheet>
  );
}
