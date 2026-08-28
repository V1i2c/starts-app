import { Field, Select } from "@/components/ui/Field";
import { useVisibleSubjects } from "@/store/useStore";

/**
 * The brief is explicit: error entries must be filed under Subject -> Chapter,
 * everywhere else (the To‑Do list included) only Subject applies. This is the
 * one place a chapter dropdown exists in the whole app, deliberately.
 */
export function ChapterSelectorFields({
  subjectId,
  chapterId,
  onSubjectChange,
  onChapterChange,
}: {
  subjectId: string;
  chapterId: string;
  onSubjectChange: (id: string) => void;
  onChapterChange: (id: string) => void;
}) {
  const subjects = useVisibleSubjects();
  const subject = subjects.find((s) => s.id === subjectId);

  return (
    <div className="grid grid-cols-2 gap-3">
      <Field label="Subject">
        <Select value={subjectId} onChange={(e) => onSubjectChange(e.target.value)}>
          <option value="">Choose…</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Chapter">
        <Select value={chapterId} onChange={(e) => onChapterChange(e.target.value)} disabled={!subject}>
          <option value="">{subject ? "Choose…" : "Pick subject first"}</option>
          {subject?.chapters.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </Field>
    </div>
  );
}
