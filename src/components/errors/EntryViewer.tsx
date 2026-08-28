import { useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { CheckCheck, ChevronLeft, ChevronRight, Pencil, RotateCcw, Trash2, X } from "lucide-react";
import type { ErrorEntry, Subject } from "@/types";
import { ScreenshotThumb } from "./ScreenshotThumb";
import { AudioPlayer } from "./AudioPlayer";
import { ImageViewer } from "./ImageViewer";
import { Button } from "@/components/ui/Button";
import { SUBJECT_COLOR_STYLES } from "@/lib/subjectColors";
import { formatFriendlyDate } from "@/lib/date";
import { cn } from "@/utils/cn";

/**
 * Prev/Next here is intentionally bounded to `entries` (already filtered to the
 * current chapter by the caller) and simply disables at the edges — no wraparound,
 * per the brief: "scrollable to next or previous but within the chapter, not infinite".
 */
export function EntryViewer({
  entries,
  index,
  subject,
  onIndexChange,
  onClose,
  onReview,
  onToggleResolved,
  onEdit,
  onDelete,
}: {
  entries: ErrorEntry[];
  index: number;
  subject: Subject | undefined;
  onIndexChange: (i: number) => void;
  onClose: () => void;
  onReview: (id: string) => void;
  onToggleResolved: (id: string) => void;
  onEdit: (entry: ErrorEntry) => void;
  onDelete: (id: string) => void;
}) {
  const entry = entries[index];
  const [lightbox, setLightbox] = useState<number | null>(null);
  const chapter = subject?.chapters.find((c) => c.id === entry.chapterId);
  const style = subject ? SUBJECT_COLOR_STYLES[subject.color] : SUBJECT_COLOR_STYLES.amber;

  return createPortal(
    <div className="fixed inset-0 z-[65] flex flex-col bg-paper">
      <div className="safe-top flex items-center justify-between border-b border-ink/10 px-4 py-3">
        <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft hover:bg-ink/5">
          <X size={19} />
        </button>
        <div className="text-center">
          <p className="text-xs font-medium text-ink-soft">
            {subject?.name} · {chapter?.name}
          </p>
          <p className="text-[11px] text-ink-soft/70">
            {index + 1} of {entries.length}
          </p>
        </div>
        <div className="flex gap-0.5">
          <button onClick={() => onIndexChange(index - 1)} disabled={index === 0} className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft hover:bg-ink/5 disabled:opacity-25">
            <ChevronLeft size={19} />
          </button>
          <button
            onClick={() => onIndexChange(index + 1)}
            disabled={index === entries.length - 1}
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft hover:bg-ink/5 disabled:opacity-25"
          >
            <ChevronRight size={19} />
          </button>
        </div>
      </div>

      <motion.div
        key={entry.id}
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
        className="flex-1 overflow-y-auto px-5 py-4"
      >
        <div className="mb-3 flex items-center gap-2">
          <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", style.soft, style.text)}>{subject?.name}</span>
          {entry.resolved && <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">Resolved</span>}
        </div>
        <h2 className="font-display text-xl font-semibold text-ink">{entry.title || "Untitled mistake"}</h2>
        <p className="mt-1 text-xs text-ink-soft">
          Logged {formatFriendlyDate(entry.createdAt.slice(0, 10))} · Reviewed {entry.reviewCount}×
        </p>
        {entry.note && <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink">{entry.note}</p>}

        {entry.screenshots.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-2">
            {entry.screenshots.map((s, i) => (
              <ScreenshotThumb key={s.blobId} blobId={s.blobId} className="aspect-square" onClick={() => setLightbox(i)} />
            ))}
          </div>
        )}

        {entry.voiceNotes.length > 0 && (
          <div className="mt-4 space-y-2">
            {entry.voiceNotes.map((v) => (
              <AudioPlayer key={v.blobId} blobId={v.blobId} />
            ))}
          </div>
        )}

        <p className="mt-5 text-xs text-ink-soft">
          Next revision due {entry.resolved ? "—" : formatFriendlyDate(entry.nextReviewDate)}
        </p>
      </motion.div>

      <div className="safe-bottom flex items-center gap-2 border-t border-ink/10 px-4 py-3">
        <Button variant="outline" size="icon" onClick={() => onEdit(entry)} aria-label="Edit">
          <Pencil size={16} />
        </Button>
        <Button variant="outline" size="icon" onClick={() => onDelete(entry.id)} aria-label="Delete" className="text-rose-600">
          <Trash2 size={16} />
        </Button>
        <Button variant="outline" className="flex-1" onClick={() => onToggleResolved(entry.id)}>
          <RotateCcw size={15} /> {entry.resolved ? "Reopen" : "Mark resolved"}
        </Button>
        <Button className="flex-1" onClick={() => onReview(entry.id)} disabled={entry.resolved}>
          <CheckCheck size={15} /> Reviewed
        </Button>
      </div>

      {lightbox !== null && (
        <ImageViewer blobIds={entry.screenshots.map((s) => s.blobId)} initialIndex={lightbox} onClose={() => setLightbox(null)} />
      )}
    </div>,
    document.body,
  );
}
