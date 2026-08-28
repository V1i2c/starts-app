import { useState } from "react";
import { Camera, Mic, BellRing, Download, RotateCcw, Info } from "lucide-react";
import { useStore } from "@/store/useStore";
import { usePermissions } from "@/hooks/usePermissions";
import { PermissionCard } from "@/components/onboarding/PermissionCard";
import { SubjectManager } from "@/components/settings/SubjectManager";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { isNative } from "@/lib/platform";

export default function SettingsPage() {
  const studentName = useStore((s) => s.studentName);
  const setStudentName = useStore((s) => s.setStudentName);
  const resetAllData = useStore((s) => s.resetAllData);
  const { permissions, requestCamera, requestMicrophone, requestNotifications } = usePermissions();
  const [confirmReset, setConfirmReset] = useState(false);

  const exportData = () => {
    const state = useStore.getState();
    const payload = {
      exportedAt: new Date().toISOString(),
      studentName: state.studentName,
      subjects: state.subjects,
      tasks: state.tasks,
      planEvents: state.planEvents,
      errors: state.errors,
      dailyLogs: state.dailyLogs,
      note: "Screenshots and voice notes are stored on-device and are not included in this export.",
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `starts-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 rise-in pb-6">
      <h1 className="font-display text-2xl font-semibold text-ink">Settings</h1>

      <section>
        <SectionTitle>Profile</SectionTitle>
        <Field label="Your name">
          <Input value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Your name" />
        </Field>
      </section>

      <section>
        <SectionTitle>Permissions</SectionTitle>
        <div className="space-y-2.5">
          <PermissionCard icon={Camera} title="Camera & Photos" description="For attaching screenshots to mistakes." status={permissions.camera} onRequest={requestCamera} />
          <PermissionCard icon={Mic} title="Microphone" description="For recording voice notes." status={permissions.microphone} onRequest={requestMicrophone} />
          <PermissionCard icon={BellRing} title="Notifications" description="For plan reminders." status={permissions.notifications} onRequest={requestNotifications} />
        </div>
        {(permissions.camera === "denied" || permissions.microphone === "denied" || permissions.notifications === "denied") && (
          <p className="mt-2 text-xs text-ink-soft">
            Denied permissions can only be re-enabled from your device's App Settings → Starts → Permissions.
          </p>
        )}
      </section>

      <section>
        <SectionTitle>My subjects & chapters</SectionTitle>
        <p className="mb-3 text-xs text-ink-soft">
          Uncheck a subject to hide it from To‑Do, Plan and quick pickers without deleting its history. Seeded from the
          JAC Class 12 Arts syllabus — edit freely to match your exact textbook edition.
        </p>
        <SubjectManager />
      </section>

      <section>
        <SectionTitle>Data</SectionTitle>
        <div className="flex flex-col gap-2">
          <Button variant="outline" onClick={exportData}>
            <Download size={15} /> Export backup (JSON)
          </Button>
          <Button variant="outline" className="text-rose-600" onClick={() => setConfirmReset(true)}>
            <RotateCcw size={15} /> Reset all data
          </Button>
        </div>
      </section>

      <section className="rounded-2xl bg-ink/5 p-4 text-xs leading-relaxed text-ink-soft">
        <p className="mb-1.5 flex items-center gap-1.5 font-semibold text-ink">
          <Info size={13} /> About reminders
        </p>
        {isNative() ? (
          <p>Running as an installed app — plan reminders are scheduled with Android directly and will fire even if Starts is closed.</p>
        ) : (
          <p>Running in a browser — reminders only fire while this tab stays open. Install the Android build for real background reminders.</p>
        )}
      </section>

      <ConfirmDialog
        open={confirmReset}
        title="Reset everything?"
        description="Tasks, plan items, errors book entries, subjects and your streak history will all be permanently deleted from this device."
        confirmLabel="Reset"
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          resetAllData();
          setConfirmReset(false);
        }}
      />
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-ink-soft">{children}</h2>;
}
