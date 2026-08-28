import { useEffect, useRef, useState } from "react";
import { Mic, Pause, Play, Square, Trash2 } from "lucide-react";
import { VoiceRecorder } from "@/lib/recorder";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function AudioRecorderField({ onRecorded }: { onRecorded: (blob: Blob) => void }) {
  const recorderRef = useRef<VoiceRecorder | null>(null);
  const [state, setState] = useState<"idle" | "recording" | "paused">("idle");
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      recorderRef.current?.cancel();
      if (timerRef.current) window.clearInterval(timerRef.current);
    },
    [],
  );

  const startTimer = () => {
    timerRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
  };
  const stopTimer = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
  };

  const start = async () => {
    setError(null);
    try {
      recorderRef.current = new VoiceRecorder();
      await recorderRef.current.start();
      setState("recording");
      setSeconds(0);
      startTimer();
    } catch {
      setError("Microphone permission is needed to record a voice note.");
    }
  };

  const pauseResume = () => {
    if (!recorderRef.current) return;
    if (state === "recording") {
      recorderRef.current.pause();
      setState("paused");
      stopTimer();
    } else {
      recorderRef.current.resume();
      setState("recording");
      startTimer();
    }
  };

  const stop = async () => {
    if (!recorderRef.current) return;
    stopTimer();
    const blob = await recorderRef.current.stop();
    setState("idle");
    setSeconds(0);
    onRecorded(blob);
  };

  const cancel = () => {
    recorderRef.current?.cancel();
    stopTimer();
    setState("idle");
    setSeconds(0);
  };

  if (state === "idle") {
    return (
      <div>
        <Button type="button" variant="outline" size="sm" onClick={start}>
          <Mic size={14} /> Record voice note
        </Button>
        {error && <p className="mt-1.5 text-xs text-rose-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2">
      <span className={cn("h-2.5 w-2.5 rounded-full bg-rose-500", state === "recording" && "animate-pulse")} />
      <span className="w-10 font-mono text-xs text-ink">{formatTime(seconds)}</span>
      <div className="flex-1" />
      <button onClick={pauseResume} className="flex h-8 w-8 items-center justify-center rounded-full text-ink hover:bg-white/60">
        {state === "recording" ? <Pause size={15} /> : <Play size={15} />}
      </button>
      <button onClick={stop} className="flex h-8 w-8 items-center justify-center rounded-full text-emerald-600 hover:bg-white/60">
        <Square size={14} />
      </button>
      <button onClick={cancel} className="flex h-8 w-8 items-center justify-center rounded-full text-rose-500 hover:bg-white/60">
        <Trash2 size={14} />
      </button>
    </div>
  );
}
