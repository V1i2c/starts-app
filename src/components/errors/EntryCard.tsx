import { CheckCircle2, Mic, StickyNote } from "lucide-react";
import type { ErrorEntry } from "@/types";
import { ScreenshotThumb } from "./ScreenshotThumb";
import { formatFriendlyDate } from "@/lib/date";
import { todayKey } from "@/lib/date";
import { cn } from "@/utils/cn";

export function EntryCard({ entry, onClick }: { entry: ErrorEntry; onClick: () => void }) {
  const due = !entry.resolved && entry.nextReviewDate <= todayKey();
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl border border-ink/10 bg-white/60 p-3 text-left"
    >
      {entry.screenshots[0] ? (
        <ScreenshotThumb blobId={entry.screenshots[0].blobId} className="h-14 w-14 shrink-0" />
      ) : (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-ink/5 text-ink-soft">
          <StickyNote size={18} />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{entry.title || "Untitled mistake"}</p>
        <p className="mt-0.5 truncate text-xs text-ink-soft">{entry.note || "No note"}</p>
        <div className="mt-1 flex items-center gap-2 text-[11px] text-ink-soft/80">
          <span>{formatFriendlyDate(entry.createdAt.slice(0, 10))}</span>
          {entry.voiceNotes.length > 0 && (
            <span className="flex items-center gap-0.5">
              <Mic size={10} /> {entry.voiceNotes.length}
            </span>
          )}
        </div>
      </div>
      {entry.resolved ? (
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 size={15} />
        </span>
      ) : (
        due && <span className={cn("shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold", "bg-amber-100 text-amber-700")}>Due</span>
      )}
    </button>
  );
}
