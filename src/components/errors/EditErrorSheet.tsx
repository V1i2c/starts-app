import { useEffect, useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import type { ErrorEntry } from "@/types";

export function EditErrorSheet({
  entry,
  onClose,
  onSave,
}: {
  entry: ErrorEntry | null;
  onClose: () => void;
  onSave: (id: string, patch: { title: string; note: string }) => void;
}) {
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (entry) {
      setTitle(entry.title);
      setNote(entry.note);
    }
  }, [entry]);

  return (
    <Sheet
      open={!!entry}
      onClose={onClose}
      title="Edit mistake"
      footer={
        <Button
          className="w-full"
          size="lg"
          disabled={!title.trim()}
          onClick={() => {
            if (entry) onSave(entry.id, { title, note });
            onClose();
          }}
        >
          Save changes
        </Button>
      }
    >
      <Field label="What went wrong">
        <Input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>
      <Field label="Short note" hint="Screenshots and voice notes can't be changed after saving — delete and re-log if needed.">
        <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
      </Field>
    </Sheet>
  );
}
