import { useState } from "react";
import { ChevronDown, Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { useStore } from "@/store/useStore";
import { SUBJECT_COLOR_STYLES, SUBJECT_COLOR_OPTIONS } from "@/lib/subjectColors";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { Subject, SubjectColor } from "@/types";
import { cn } from "@/utils/cn";

export function SubjectManager() {
  const subjects = useStore((s) => s.subjects);
  const activeSubjectIds = useStore((s) => s.activeSubjectIds);
  const toggleActiveSubject = useStore((s) => s.toggleActiveSubject);
  const addSubject = useStore((s) => s.addSubject);
  const renameSubject = useStore((s) => s.renameSubject);
  const deleteSubject = useStore((s) => s.deleteSubject);
  const addChapter = useStore((s) => s.addChapter);
  const renameChapter = useStore((s) => s.renameChapter);
  const deleteChapter = useStore((s) => s.deleteChapter);

  const [expanded, setExpanded] = useState<string | null>(null);
  const [renamingSubjectId, setRenamingSubjectId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [newSubject, setNewSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectColor, setNewSubjectColor] = useState<SubjectColor>("indigo");
  const [confirmDeleteSubject, setConfirmDeleteSubject] = useState<Subject | null>(null);
  const [confirmDeleteChapter, setConfirmDeleteChapter] = useState<{ subjectId: string; chapterId: string; name: string } | null>(null);

  const isActive = (id: string) => (activeSubjectIds ? activeSubjectIds.includes(id) : true);

  return (
    <div className="space-y-2">
      {subjects.map((subject) => {
        const style = SUBJECT_COLOR_STYLES[subject.color];
        const open = expanded === subject.id;
        return (
          <div key={subject.id} className="overflow-hidden rounded-2xl border border-ink/10 bg-white/60">
            <div className="flex items-center gap-2.5 px-3.5 py-3">
              <input
                type="checkbox"
                checked={isActive(subject.id)}
                onChange={() => toggleActiveSubject(subject.id)}
                className="h-4 w-4 accent-brand-500"
                aria-label={`Show ${subject.name}`}
              />
              <span className={cn("h-2 w-2 rounded-full shrink-0", style.dot)} />
              {renamingSubjectId === subject.id ? (
                <>
                  <Input value={renameValue} onChange={(e) => setRenameValue(e.target.value)} className="h-8 flex-1 text-xs" autoFocus />
                  <button
                    onClick={() => {
                      if (renameValue.trim()) renameSubject(subject.id, renameValue.trim());
                      setRenamingSubjectId(null);
                    }}
                    className="text-emerald-600"
                  >
                    <Check size={14} />
                  </button>
                  <button onClick={() => setRenamingSubjectId(null)} className="text-ink-soft">
                    <X size={14} />
                  </button>
                </>
              ) : (
                <>
                  <button className="flex-1 truncate text-left text-sm font-medium text-ink" onClick={() => setExpanded(open ? null : subject.id)}>
                    {subject.name}
                  </button>
                  <span className="text-xs text-ink-soft">{subject.chapters.length} ch.</span>
                  <button
                    onClick={() => {
                      setRenamingSubjectId(subject.id);
                      setRenameValue(subject.name);
                    }}
                    className="text-ink-soft"
                  >
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => setConfirmDeleteSubject(subject)} className="text-rose-500">
                    <Trash2 size={14} />
                  </button>
                  <button onClick={() => setExpanded(open ? null : subject.id)} className="text-ink-soft">
                    <ChevronDown size={16} className={cn("transition-transform", open && "rotate-180")} />
                  </button>
                </>
              )}
            </div>
            {open && (
              <ChapterEditor
                subject={subject}
                onAdd={(name) => addChapter(subject.id, name)}
                onRename={(chapterId, name) => renameChapter(subject.id, chapterId, name)}
                onDelete={(chapterId, name) => setConfirmDeleteChapter({ subjectId: subject.id, chapterId, name })}
              />
            )}
          </div>
        );
      })}

      {newSubject ? (
        <div className="space-y-2 rounded-2xl border border-dashed border-ink/20 p-3">
          <Input autoFocus value={newSubjectName} onChange={(e) => setNewSubjectName(e.target.value)} placeholder="Subject name" />
          <div className="flex flex-wrap gap-1.5">
            {SUBJECT_COLOR_OPTIONS.map((c) => (
              <button
                key={c}
                onClick={() => setNewSubjectColor(c)}
                className={cn("h-6 w-6 rounded-full", SUBJECT_COLOR_STYLES[c].solid, newSubjectColor === c && "ring-2 ring-ink ring-offset-2")}
              />
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => setNewSubject(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (newSubjectName.trim()) addSubject(newSubjectName, newSubjectColor);
                setNewSubjectName("");
                setNewSubject(false);
              }}
            >
              Add subject
            </Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setNewSubject(true)}
          className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-ink/20 py-3 text-sm font-medium text-ink-soft"
        >
          <Plus size={14} /> Add subject
        </button>
      )}

      <ConfirmDialog
        open={!!confirmDeleteSubject}
        title={`Delete ${confirmDeleteSubject?.name}?`}
        description="All its chapters and logged mistakes will be permanently deleted."
        onCancel={() => setConfirmDeleteSubject(null)}
        onConfirm={() => {
          if (confirmDeleteSubject) deleteSubject(confirmDeleteSubject.id);
          setConfirmDeleteSubject(null);
        }}
      />
      <ConfirmDialog
        open={!!confirmDeleteChapter}
        title={`Delete "${confirmDeleteChapter?.name}"?`}
        description="Mistakes logged under this chapter will be permanently deleted."
        onCancel={() => setConfirmDeleteChapter(null)}
        onConfirm={() => {
          if (confirmDeleteChapter) deleteChapter(confirmDeleteChapter.subjectId, confirmDeleteChapter.chapterId);
          setConfirmDeleteChapter(null);
        }}
      />
    </div>
  );
}

function ChapterEditor({
  subject,
  onAdd,
  onRename,
  onDelete,
}: {
  subject: Subject;
  onAdd: (name: string) => void;
  onRename: (chapterId: string, name: string) => void;
  onDelete: (chapterId: string, name: string) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [addValue, setAddValue] = useState("");

  return (
    <div className="space-y-1.5 border-t border-ink/10 px-3.5 py-3">
      {subject.chapters.map((chapter) => (
        <div key={chapter.id} className="flex items-center gap-2">
          {editingId === chapter.id ? (
            <>
              <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="h-8 flex-1 text-xs" autoFocus />
              <button
                onClick={() => {
                  if (editValue.trim()) onRename(chapter.id, editValue.trim());
                  setEditingId(null);
                }}
                className="text-emerald-600"
              >
                <Check size={14} />
              </button>
              <button onClick={() => setEditingId(null)} className="text-ink-soft">
                <X size={14} />
              </button>
            </>
          ) : (
            <>
              <span className="flex-1 truncate text-xs text-ink">{chapter.name}</span>
              <button
                onClick={() => {
                  setEditingId(chapter.id);
                  setEditValue(chapter.name);
                }}
                className="text-ink-soft"
              >
                <Pencil size={12} />
              </button>
              <button onClick={() => onDelete(chapter.id, chapter.name)} className="text-rose-500">
                <Trash2 size={12} />
              </button>
            </>
          )}
        </div>
      ))}
      <div className="flex items-center gap-2 pt-1.5">
        <Input
          value={addValue}
          onChange={(e) => setAddValue(e.target.value)}
          placeholder="New chapter"
          className="h-8 flex-1 text-xs"
          onKeyDown={(e) => {
            if (e.key === "Enter" && addValue.trim()) {
              onAdd(addValue.trim());
              setAddValue("");
            }
          }}
        />
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            if (addValue.trim()) {
              onAdd(addValue.trim());
              setAddValue("");
            }
          }}
        >
          <Plus size={12} />
        </Button>
      </div>
    </div>
  );
}
