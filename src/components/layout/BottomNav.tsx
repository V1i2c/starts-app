import { NavLink } from "react-router-dom";
import { Compass, ListChecks, CalendarDays, NotebookPen } from "lucide-react";
import { cn } from "@/utils/cn";

const TABS = [
  { to: "/", label: "Dashboard", icon: Compass, end: true },
  { to: "/todo", label: "To‑Do", icon: ListChecks, end: false },
  { to: "/plan", label: "Plan", icon: CalendarDays, end: false },
  { to: "/errors", label: "Errors Book", icon: NotebookPen, end: false },
];

export function BottomNav() {
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-paper/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-stretch justify-between px-2">
        {TABS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                isActive ? "text-brand-600" : "text-ink-soft/70 hover:text-ink-soft",
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    "flex h-8 w-9 items-center justify-center rounded-xl transition-all",
                    isActive && "bg-brand-100",
                  )}
                >
                  <Icon size={19} strokeWidth={isActive ? 2.4 : 2} />
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
