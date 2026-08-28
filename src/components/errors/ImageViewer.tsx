import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { getBlobUrl } from "@/lib/blobStore";
import { cn } from "@/utils/cn";

/** Full-screen pinch-zoom / pan / double-tap-to-zoom image viewer for one or more screenshots. */
export function ImageViewer({
  blobIds,
  initialIndex = 0,
  onClose,
}: {
  blobIds: string[];
  initialIndex?: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const [url, setUrl] = useState<string | null>(null);
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchStart = useRef<{ dist: number; scale: number } | null>(null);
  const dragStart = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);

  useEffect(() => {
    setTransform({ scale: 1, x: 0, y: 0 });
    let cancelled = false;
    getBlobUrl(blobIds[index]).then((u) => !cancelled && setUrl(u));
    return () => {
      cancelled = true;
    };
  }, [blobIds, index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIndex((i) => Math.min(i + 1, blobIds.length - 1));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, blobIds.length]);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) {
      dragStart.current = { x: e.clientX, y: e.clientY, tx: transform.x, ty: transform.y };
    } else if (pointers.current.size === 2) {
      const pts = [...pointers.current.values()];
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      pinchStart.current = { dist, scale: transform.scale };
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2 && pinchStart.current) {
      const pts = [...pointers.current.values()];
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const nextScale = Math.min(4, Math.max(1, pinchStart.current.scale * (dist / pinchStart.current.dist)));
      setTransform((t) => ({ ...t, scale: nextScale }));
    } else if (pointers.current.size === 1 && dragStart.current && transform.scale > 1) {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setTransform((t) => ({ ...t, x: dragStart.current!.tx + dx, y: dragStart.current!.ty + dy }));
    }
  };

  const endPointer = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchStart.current = null;
    if (pointers.current.size === 0) dragStart.current = null;
  };

  const toggleZoom = () => setTransform((t) => (t.scale > 1 ? { scale: 1, x: 0, y: 0 } : { scale: 2.4, x: 0, y: 0 }));

  return createPortal(
    <div className="fixed inset-0 z-[70] flex flex-col bg-black/95">
      <div className="safe-top flex items-center justify-between px-4 py-3">
        <span className="text-xs font-medium text-white/70">
          {index + 1} / {blobIds.length}
        </span>
        <div className="flex items-center gap-3">
          <button onClick={toggleZoom} className="text-white/80" aria-label="Toggle zoom">
            <ZoomIn size={18} />
          </button>
          <button onClick={onClose} className="text-white/80" aria-label="Close">
            <X size={20} />
          </button>
        </div>
      </div>

      <div
        className="relative flex flex-1 touch-none items-center justify-center overflow-hidden select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        onDoubleClick={toggleZoom}
      >
        <AnimatePresence mode="wait">
          {url && (
            <motion.img
              key={url}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              src={url}
              alt="Screenshot"
              draggable={false}
              className="max-h-full max-w-full object-contain"
              style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})` }}
            />
          )}
        </AnimatePresence>

        {index > 0 && (
          <button
            onClick={() => setIndex((i) => i - 1)}
            className="absolute left-2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white"
          >
            <ChevronLeft size={18} />
          </button>
        )}
        {index < blobIds.length - 1 && (
          <button
            onClick={() => setIndex((i) => i + 1)}
            className="absolute right-2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white"
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>

      {blobIds.length > 1 && (
        <div className="safe-bottom flex justify-center gap-1.5 py-3">
          {blobIds.map((id, i) => (
            <span key={id} className={cn("h-1.5 w-1.5 rounded-full", i === index ? "bg-white" : "bg-white/30")} />
          ))}
        </div>
      )}
    </div>,
    document.body,
  );
}
