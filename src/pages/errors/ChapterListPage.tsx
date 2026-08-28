import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Layers, Plus } from "lucide-react";
import { useStore } from "@/store/useStore";
import { SUBJECT_COLOR_STYLES } from "@/lib/subjectColors";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { todayKey } from "@/lib/date";
import { cn } from "@/utils/cn";

export default function ChapterListPage() {
  const { subjectId = "" } = useParams();
  const navigate = useNavigate();
  const subjects = useStore((s) => s.subjects);
  const errors = useStore((s) => s.errors);
  const addChapter = useStore((s) => s.addChapter);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");

  const subject = subjects.find((s) => s.id === subjectId);
  if (!subject) {
    return <EmptyState icon={Layers} title="Subject not found" description="It may have been removed from Settings." />;
  }
  const style = SUBJECT_COLOR_STYLES[subject.color];
  const today = todayKey();

  const submitChapter = () => {
    if (name.trim()) addChapter(subject.id, name.trim());
    setName("");
    setAdding(false);
  };

  return (
    <div className="space-y-4 rise-in">
      <Link to="/errors" className="flex items-center gap-1 text-sm text-ink-soft">
        <ChevronLeft size={15} /> Errors Book
      </Link>
      <div className="flex items-center gap-3">
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl", style.soft, style.text)}>
          <Layers size={20} />
        </div>
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">{subject.name}</h1>
          <p className="text-xs text-ink-soft">{subject.chapters.length} chapters</p>
        </div>
      </div>

      {subject.chapters.length === 0 && !adding ? (
        <EmptyState
          icon={Layers}
          title="No chapters yet"
          description="Add the chapters from your textbook to keep mistakes organised."
          action={
            <Button size="sm" onClick={() => setAdding(true)}>
              <Plus size={14} /> Add chapter
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {subject.chapters.map((chapter) => {
            const count = errors.filter((e) => e.chapterId === chapter.id).length;
            const due = errors.filter((e) => e.chapterId === chapter.id && !e.resolved && e.nextReviewDate <= today).length;
            return (
              <button
                key={chapter.id}
                onClick={() => navigate(`/errors/${subject.id}/${chapter.id}`)}
                className="flex w-full items-center gap-3 rounded-2xl border border-ink/10 bg-white/60 p-3.5 text-left"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{chapter.name}</p>
                  <p className="text-xs text-ink-soft">{count} logged</p>
                </div>
                {due > 0 && <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">{due} due</span>}
                <ChevronRight size={15} className="shrink-0 text-ink-soft" />
              </button>
            );
          })}

          {adding ? (
            <div className="flex items-center gap-2 rounded-2xl border border-dashed border-ink/20 p-3">
              <Input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Chapter name"
                onKeyDown={(e) => e.key === "Enter" && submitChapter()}
              />
              <Button size="sm" onClick={submitChapter}>
                Add
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-ink/20 py-3 text-sm font-medium text-ink-soft"
            >
              <Plus size={14} /> Add chapter
            </button>
          )}
        </div>
      )}
    </div>
  );
}
