import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-ink/15 px-6 py-12 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-ink/5 text-ink-soft">
        <Icon size={22} />
      </div>
      <p className="font-display text-base font-semibold text-ink">{title}</p>
      <p className="mt-1 max-w-[26ch] text-sm text-ink-soft">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
