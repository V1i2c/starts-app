import { useNavigate } from "react-router-dom";
import { BookOpen, ChevronRight } from "lucide-react";
import { useStore, useVisibleSubjects } from "@/store/useStore";
import { SUBJECT_COLOR_STYLES } from "@/lib/subjectColors";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/utils/cn";

export default function ErrorsHomePage() {
  const navigate = useNavigate();
  const subjects = useVisibleSubjects();
  const errors = useStore((s) => s.errors);

  return (
    <div className="space-y-4 rise-in">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Errors Book</h1>
        <p className="mt-1 text-sm text-ink-soft">Pick a subject, then a chapter, to file or revisit a mistake.</p>
      </div>

      {subjects.length === 0 ? (
        <EmptyState icon={BookOpen} title="No subjects yet" description="Add subjects from Settings to start your Errors Book." />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {subjects.map((subject) => {
            const style = SUBJECT_COLOR_STYLES[subject.color];
            const count = errors.filter((e) => e.subjectId === subject.id).length;
            const due = errors.filter((e) => e.subjectId === subject.id && !e.resolved && e.nextReviewDate <= new Date().toISOString().slice(0, 10)).length;
            return (
              <button
                key={subject.id}
                onClick={() => navigate(`/errors/${subject.id}`)}
                className="flex flex-col gap-3 rounded-2xl border border-ink/10 bg-white/60 p-4 text-left transition-transform active:scale-[0.98]"
              >
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", style.soft, style.text)}>
                  <BookOpen size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">{subject.name}</p>
                  <p className="mt-0.5 text-xs text-ink-soft">
                    {subject.chapters.length} chapters · {count} logged
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  {due > 0 ? (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">{due} due</span>
                  ) : (
                    <span />
                  )}
                  <ChevronRight size={14} className="text-ink-soft" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
