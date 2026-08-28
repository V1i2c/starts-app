import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import type { StreakInfo } from "@/lib/streak";
import { cn } from "@/utils/cn";

export function StreakCard({ streak }: { streak: StreakInfo }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl p-5 text-white shadow-lg",
        streak.current > 0 ? "bg-gradient-to-br from-brand-500 via-brand-600 to-rose-700 shadow-brand-500/30" : "bg-ink/80",
      )}
    >
      <div className="pointer-events-none absolute -right-6 -top-8 h-32 w-32 rounded-full bg-white/10" />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-white/70">Current streak</p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <motion.span
              key={streak.current}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 14 }}
              className="font-display text-4xl font-bold"
            >
              {streak.current}
            </motion.span>
            <span className="text-sm text-white/80">day{streak.current === 1 ? "" : "s"}</span>
          </div>
        </div>
        <motion.div
          animate={streak.current > 0 ? { scale: [1, 1.12, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15"
        >
          <Flame size={28} className={streak.current > 0 ? "fill-amber-300 text-amber-300" : "text-white/60"} />
        </motion.div>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-white/75">
        <span>Best: {streak.best} day{streak.best === 1 ? "" : "s"}</span>
        {streak.atRisk && (
          <span className="rounded-full bg-white/15 px-2.5 py-1 font-medium text-amber-200">
            Do something today to keep it alive
          </span>
        )}
      </div>
    </div>
  );
}
