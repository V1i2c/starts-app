import type { LucideIcon } from "lucide-react";
import { Check, X } from "lucide-react";
import type { PermissionState } from "@/types";
import { Button } from "@/components/ui/Button";

export function PermissionCard({
  icon: Icon,
  title,
  description,
  status,
  onRequest,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  status: PermissionState;
  onRequest: () => void;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-ink/10 bg-white/60 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
        <Icon size={19} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-ink">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">{description}</p>
      </div>
      {status === "granted" ? (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <Check size={16} />
        </span>
      ) : status === "denied" ? (
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-500">
            <X size={16} />
          </span>
        </div>
      ) : (
        <Button size="sm" variant="secondary" onClick={onRequest} className="shrink-0">
          Allow
        </Button>
      )}
    </div>
  );
}
