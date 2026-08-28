import { Outlet, useNavigate } from "react-router-dom";
import { Settings } from "lucide-react";
import { BottomNav } from "./BottomNav";

export function AppShell() {
  const navigate = useNavigate();
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col bg-paper">
      <header className="safe-top sticky top-0 z-30 flex items-center justify-between border-b border-ink/10 bg-paper/90 px-5 py-3 backdrop-blur-md">
        <button onClick={() => navigate("/")} className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-ink text-sm font-bold text-paper">
            ✺
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-ink">Starts</span>
        </button>
        <button
          onClick={() => navigate("/settings")}
          aria-label="Settings"
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft hover:bg-ink/5"
        >
          <Settings size={19} />
        </button>
      </header>
      <main className="flex-1 px-5 pb-28 pt-4">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
