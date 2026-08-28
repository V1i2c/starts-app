import { useEffect, useState } from "react";
import { getBlobUrl } from "@/lib/blobStore";
import { cn } from "@/utils/cn";

export function ScreenshotThumb({ blobId, onClick, className }: { blobId: string; onClick?: () => void; className?: string }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getBlobUrl(blobId).then((u) => !cancelled && setUrl(u));
    return () => {
      cancelled = true;
    };
  }, [blobId]);

  if (!url) return <div className={cn("animate-pulse rounded-xl bg-ink/5", className)} />;

  return (
    <button onClick={onClick} className={cn("overflow-hidden rounded-xl bg-ink/5", className)}>
      <img src={url} alt="" className="h-full w-full object-cover" />
    </button>
  );
}
