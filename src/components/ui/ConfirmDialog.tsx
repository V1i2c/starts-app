import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { TriangleAlert } from "lucide-react";
import { Button } from "./Button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Every destructive delete in the app (tasks, plan events, error entries,
 * subjects, chapters) routes through this instead of window.confirm — the
 * brief specifically calls out "delete only after confirmation".
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  danger = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-ink/50"
            onClick={onCancel}
          />
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 340 }}
            className="relative w-full max-w-sm rounded-2xl bg-paper p-5 shadow-2xl"
          >
            <div
              className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full ${danger ? "bg-rose-100 text-rose-600" : "bg-brand-100 text-brand-600"}`}
            >
              <TriangleAlert size={20} />
            </div>
            <h3 className="font-display text-base font-semibold text-ink">{title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{description}</p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={onCancel}>
                Cancel
              </Button>
              <Button variant={danger ? "danger" : "secondary"} size="sm" onClick={onConfirm}>
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
