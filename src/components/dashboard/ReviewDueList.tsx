import { useNavigate } from "react-router-dom";
import type { ErrorEntry, Subject } from "@/types";
import { SUBJECT_COLOR_STYLES } from "@/lib/subjectColors";
import { Button } from "@/components/ui/Button";
import { CheckCheck } from "lucide-react";
import { cn } from "@/utils/cn";

export function ReviewDueList({
  entries,
  subjects,
  onReview,
}: {
  entries: ErrorEntry[];
  subjects: Subject[];
  onReview: (id: string) => void;
}) {
  const navigate = useNavigate();
  if (entries.length === 0) return null;

  return (
    <div className="rounded-3xl border border-ink/10 bg-white/60 p-4">
      <p className="mb-3 text-sm font-semibold text-ink">Due for revision</p>
      <div className="space-y-2">
        {entries.slice(0, 4).map((entry) => {
          const subject = subjects.find((s) => s.id === entry.subjectId);
          const style = subject ? SUBJECT_COLOR_STYLES[subject.color] : SUBJECT_COLOR_STYLES.amber;
          return (
            <div key={entry.id} className="flex items-center gap-2.5 rounded-xl bg-ink/[0.03] p-2.5">
              <span className={cn("h-2 w-2 shrink-0 rounded-full", style.dot)} />
              <button
                className="flex-1 truncate text-left text-sm text-ink"
                onClick={() => navigate(`/errors/${entry.subjectId}/${entry.chapterId}?entry=${entry.id}`)}
              >
                {entry.title || "Untitled mistake"}
              </button>
              <Button size="sm" variant="ghost" onClick={() => onReview(entry.id)} title="Mark reviewed">
                <CheckCheck size={16} />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
