import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Mic, BellRing, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { useStore } from "@/store/useStore";
import { usePermissions } from "@/hooks/usePermissions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { PermissionCard } from "./PermissionCard";
import { SUBJECT_COLOR_STYLES } from "@/lib/subjectColors";
import { cn } from "@/utils/cn";

const STEPS = ["welcome", "name", "permissions", "subjects"] as const;
type Step = (typeof STEPS)[number];

export function Onboarding() {
  const [step, setStep] = useState<Step>("welcome");
  const [name, setName] = useState("");
  const subjects = useStore((s) => s.subjects);
  const [selected, setSelected] = useState<string[]>(() => subjects.map((s) => s.id));
  const completeOnboarding = useStore((s) => s.completeOnboarding);
  const { permissions, requestCamera, requestMicrophone, requestNotifications } = usePermissions();

  const idx = STEPS.indexOf(step);
  const goNext = () => setStep(STEPS[Math.min(idx + 1, STEPS.length - 1)]);
  const goBack = () => setStep(STEPS[Math.max(idx - 1, 0)]);

  const toggleSubject = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const finish = () => completeOnboarding(name || "Artist", selected.length ? selected : subjects.map((s) => s.id));

  return (
    <div className="flex min-h-screen flex-col bg-paper px-6 py-8">
      <div className="mb-6 flex items-center gap-1.5">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={cn("h-1.5 flex-1 rounded-full transition-colors", i <= idx ? "bg-brand-500" : "bg-ink/10")}
          />
        ))}
      </div>

      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.22 }}
          >
            {step === "welcome" && (
              <div className="pt-6 text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[28px] bg-ink text-4xl text-paper shadow-xl shadow-ink/20">
                  ✺
                </div>
                <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">Starts</h1>
                <p className="mx-auto mt-3 max-w-[30ch] text-sm leading-relaxed text-ink-soft">
                  Your everyday companion for Class 12 Arts — todos, weekly plans, and a mistake journal that
                  actually helps you stop repeating errors.
                </p>
              </div>
            )}

            {step === "name" && (
              <div className="pt-6">
                <h2 className="font-display text-2xl font-semibold text-ink">What should we call you?</h2>
                <p className="mt-1.5 text-sm text-ink-soft">Shown on your dashboard. You can change it later.</p>
                <Input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ananya"
                  className="mt-5"
                />
              </div>
            )}

            {step === "permissions" && (
              <div className="pt-6">
                <h2 className="font-display text-2xl font-semibold text-ink">A few permissions</h2>
                <p className="mt-1.5 text-sm text-ink-soft">
                  Asked once, up front, so nothing interrupts you mid-task later.
                </p>
                <div className="mt-5 space-y-3">
                  <PermissionCard
                    icon={Camera}
                    title="Camera & Photos"
                    description="Attach a photo of a mistake straight from your textbook or notebook."
                    status={permissions.camera}
                    onRequest={requestCamera}
                  />
                  <PermissionCard
                    icon={Mic}
                    title="Microphone"
                    description="Record a quick voice note explaining where you went wrong."
                    status={permissions.microphone}
                    onRequest={requestMicrophone}
                  />
                  <PermissionCard
                    icon={BellRing}
                    title="Notifications"
                    description="Gentle reminders for the plan items you schedule."
                    status={permissions.notifications}
                    onRequest={requestNotifications}
                  />
                </div>
                <p className="mt-4 text-xs text-ink-soft/70">
                  You can say no — everything still works, you'll just be prompted again the moment you try to use
                  that feature.
                </p>
              </div>
            )}

            {step === "subjects" && (
              <div className="pt-6">
                <h2 className="font-display text-2xl font-semibold text-ink">Pick your subjects</h2>
                <p className="mt-1.5 text-sm text-ink-soft">
                  Seeded from the JAC Class 12 Arts syllabus. Add/edit/remove anytime in Settings.
                </p>
                <div className="mt-5 grid grid-cols-2 gap-2.5">
                  {subjects.map((subject) => {
                    const active = selected.includes(subject.id);
                    const style = SUBJECT_COLOR_STYLES[subject.color];
                    return (
                      <button
                        key={subject.id}
                        onClick={() => toggleSubject(subject.id)}
                        className={cn(
                          "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-all",
                          active ? `${style.soft} ${style.text} border-transparent` : "border-ink/10 text-ink-soft",
                        )}
                      >
                        <span className={cn("h-2 w-2 shrink-0 rounded-full", style.dot)} />
                        <span className="line-clamp-1">{subject.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        {idx > 0 ? (
          <Button variant="ghost" onClick={goBack}>
            <ArrowLeft size={16} /> Back
          </Button>
        ) : (
          <span />
        )}
        {step === "subjects" ? (
          <Button onClick={finish}>
            Let's go <Sparkles size={16} />
          </Button>
        ) : (
          <Button onClick={goNext}>
            Continue <ArrowRight size={16} />
          </Button>
        )}
      </div>
    </div>
  );
}
