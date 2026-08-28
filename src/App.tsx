import { HashRouter, Route, Routes } from "react-router-dom";
import { useStore } from "@/store/useStore";
import { Onboarding } from "@/components/onboarding/Onboarding";
import { AppShell } from "@/components/layout/AppShell";
import { useAndroidBack } from "@/hooks/useAndroidBack";
import { useNativeChrome } from "@/hooks/useNativeChrome";
import DashboardPage from "@/pages/DashboardPage";
import TodoPage from "@/pages/TodoPage";
import PlanPage from "@/pages/PlanPage";
import ErrorsHomePage from "@/pages/errors/ErrorsHomePage";
import ChapterListPage from "@/pages/errors/ChapterListPage";
import ChapterDetailPage from "@/pages/errors/ChapterDetailPage";
import SettingsPage from "@/pages/SettingsPage";

function AppRoutes() {
  useAndroidBack();
  useNativeChrome();
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/todo" element={<TodoPage />} />
        <Route path="/plan" element={<PlanPage />} />
        <Route path="/errors" element={<ErrorsHomePage />} />
        <Route path="/errors/:subjectId" element={<ChapterListPage />} />
        <Route path="/errors/:subjectId/:chapterId" element={<ChapterDetailPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

function SplashLoader() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-paper">
      <span className="flex h-16 w-16 animate-pulse items-center justify-center rounded-[24px] bg-ink text-3xl text-paper">✺</span>
      <p className="font-display text-sm text-ink-soft">Starts</p>
    </div>
  );
}

export default function App() {
  const hasHydrated = useStore((s) => s.hasHydrated);
  const onboardingComplete = useStore((s) => s.onboardingComplete);

  if (!hasHydrated) return <SplashLoader />;
  if (!onboardingComplete) return <Onboarding />;

  return (
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  );
}
