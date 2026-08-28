import { useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ChevronLeft, NotebookPen, Plus } from "lucide-react";
import { useStore } from "@/store/useStore";
import { EntryCard } from "@/components/errors/EntryCard";
import { EntryViewer } from "@/components/errors/EntryViewer";
import { AddErrorSheet } from "@/components/errors/AddErrorSheet";
import { EditErrorSheet } from "@/components/errors/EditErrorSheet";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import type { ErrorEntry } from "@/types";

export default function ChapterDetailPage() {
  const { subjectId = "", chapterId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const subjects = useStore((s) => s.subjects);
  const errors = useStore((s) => s.errors);
  const addError = useStore((s) => s.addError);
  const updateError = useStore((s) => s.updateError);
  const deleteError = useStore((s) => s.deleteError);
  const markErrorReviewed = useStore((s) => s.markErrorReviewed);
  const toggleErrorResolved = useStore((s) => s.toggleErrorResolved);

  const subject = subjects.find((s) => s.id === subjectId);
  const chapter = subject?.chapters.find((c) => c.id === chapterId);

  const entries = useMemo(
    () => errors.filter((e) => e.chapterId === chapterId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [errors, chapterId],
  );

  const preselectId = searchParams.get("entry");
  const preselectIndex = preselectId ? entries.findIndex((e) => e.id === preselectId) : -1;

  const [viewerIndex, setViewerIndex] = useState<number | null>(preselectIndex >= 0 ? preselectIndex : null);
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<ErrorEntry | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!subject || !chapter) {
    return <EmptyState icon={NotebookPen} title="Chapter not found" description="It may have been removed." />;
  }

  return (
    <div className="space-y-4 rise-in">
      <Link to={`/errors/${subject.id}`} className="flex items-center gap-1 text-sm text-ink-soft">
        <ChevronLeft size={15} /> {subject.name}
      </Link>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-semibold text-ink">{chapter.name}</h1>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus size={14} /> Log mistake
        </Button>
      </div>

      {entries.length === 0 ? (
        <EmptyState
          icon={NotebookPen}
          title="This chapter is clean"
          description="No mistakes logged yet — nice, or you just haven't recorded one."
        />
      ) : (
        <div className="space-y-2">
          {entries.map((entry, i) => (
            <EntryCard key={entry.id} entry={entry} onClick={() => setViewerIndex(i)} />
          ))}
        </div>
      )}

      {viewerIndex !== null && entries[viewerIndex] && (
        <EntryViewer
          entries={entries}
          index={viewerIndex}
          subject={subject}
          onIndexChange={setViewerIndex}
          onClose={() => setViewerIndex(null)}
          onReview={markErrorReviewed}
          onToggleResolved={toggleErrorResolved}
          onEdit={(entry) => setEditing(entry)}
          onDelete={(id) => setConfirmDeleteId(id)}
        />
      )}

      <AddErrorSheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        defaultSubjectId={subject.id}
        defaultChapterId={chapter.id}
        onSave={(input) => addError(input)}
      />

      <EditErrorSheet entry={editing} onClose={() => setEditing(null)} onSave={(id, patch) => updateError(id, patch)} />

      <ConfirmDialog
        open={!!confirmDeleteId}
        title="Delete this mistake?"
        description="Its screenshots and voice notes will be permanently removed. This can't be undone."
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          if (confirmDeleteId) {
            deleteError(confirmDeleteId);
            setViewerIndex(null);
          }
          setConfirmDeleteId(null);
        }}
      />
    </div>
  );
}
