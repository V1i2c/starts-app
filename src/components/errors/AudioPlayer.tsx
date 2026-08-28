import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { getBlobUrl } from "@/lib/blobStore";

function fmt(sec: number) {
  if (!isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function AudioPlayer({ blobId }: { blobId: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    getBlobUrl(blobId).then((u) => {
      if (!cancelled) setUrl(u);
    });
    return () => {
      cancelled = true;
    };
  }, [blobId]);

  if (!url) {
    return <div className="h-11 animate-pulse rounded-full bg-ink/5" />;
  }

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) el.pause();
    else el.play();
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = Number(e.target.value);
    setCurrent(el.currentTime);
  };

  return (
    <div className="flex items-center gap-2.5 rounded-full border border-ink/10 bg-white/70 px-3 py-2">
      <audio
        ref={audioRef}
        src={url}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        preload="metadata"
      />
      <button
        onClick={toggle}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-paper"
        aria-label={playing ? "Pause" : "Play"}
      >
        {playing ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
      </button>
      <input
        type="range"
        min={0}
        max={duration || 0}
        value={current}
        onChange={seek}
        className="h-1 flex-1 accent-brand-500"
      />
      <span className="w-16 shrink-0 text-right font-mono text-[11px] text-ink-soft">
        {fmt(current)} / {fmt(duration)}
      </span>
    </div>
  );
}
