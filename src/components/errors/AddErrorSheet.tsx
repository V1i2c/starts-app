import { useEffect, useRef, useState } from "react";
import { Camera, ImagePlus, Mic, Trash2 } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { ChapterSelectorFields } from "./ChapterSelectorFields";
import { AudioRecorderField } from "./AudioRecorderField";
import { putBlob } from "@/lib/blobStore";
import type { ErrorAttachmentRef } from "@/types";

interface PendingImage {
  file: File;
  url: string;
}
interface PendingAudio {
  blob: Blob;
  url: string;
}

export function AddErrorSheet({
  open,
  onClose,
  defaultSubjectId,
  defaultChapterId,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  defaultSubjectId?: string;
  defaultChapterId?: string;
  onSave: (input: {
    subjectId: string;
    chapterId: string;
    title: string;
    note: string;
    screenshots: ErrorAttachmentRef[];
    voiceNotes: ErrorAttachmentRef[];
  }) => void;
}) {
  const [subjectId, setSubjectId] = useState(defaultSubjectId ?? "");
  const [chapterId, setChapterId] = useState(defaultChapterId ?? "");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [images, setImages] = useState<PendingImage[]>([]);
  const [audios, setAudios] = useState<PendingAudio[]>([]);
  const [saving, setSaving] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setSubjectId(defaultSubjectId ?? "");
    setChapterId(defaultChapterId ?? "");
    setTitle("");
    setNote("");
    setImages([]);
    setAudios([]);
  }, [open, defaultSubjectId, defaultChapterId]);

  // Refs mirror the latest images/audios so the cleanup below (which only
  // re-subscribes when `open` toggles) always revokes the *current* object
  // URLs on close, instead of whatever was captured the moment the sheet opened.
  const imagesRef = useRef(images);
  imagesRef.current = images;
  const audiosRef = useRef(audios);
  audiosRef.current = audios;

  useEffect(
    () => () => {
      imagesRef.current.forEach((i) => URL.revokeObjectURL(i.url));
      audiosRef.current.forEach((a) => URL.revokeObjectURL(a.url));
    },
    [open],
  );

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const next = Array.from(files).map((file) => ({ file, url: URL.createObjectURL(file) }));
    setImages((prev) => [...prev, ...next]);
  };

  const removeImage = (idx: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[idx].url);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const removeAudio = (idx: number) => {
    setAudios((prev) => {
      URL.revokeObjectURL(prev[idx].url);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const canSave = subjectId && chapterId && title.trim().length > 0;

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const screenshots: ErrorAttachmentRef[] = [];
      for (const img of images) {
        const blobId = await putBlob(img.file);
        screenshots.push({ blobId, mime: img.file.type || "image/jpeg" });
      }
      const voiceNotes: ErrorAttachmentRef[] = [];
      for (const a of audios) {
        const blobId = await putBlob(a.blob);
        voiceNotes.push({ blobId, mime: a.blob.type || "audio/webm" });
      }
      onSave({ subjectId, chapterId, title, note, screenshots, voiceNotes });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Log a mistake"
      footer={
        <Button className="w-full" size="lg" disabled={!canSave || saving} onClick={save}>
          {saving ? "Saving…" : "Save to Errors Book"}
        </Button>
      }
    >
      <ChapterSelectorFields
        subjectId={subjectId}
        chapterId={chapterId}
        onSubjectChange={(v) => {
          setSubjectId(v);
          setChapterId("");
        }}
        onChapterChange={setChapterId}
      />
      <Field label="What went wrong">
        <Input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Mixed up perspective vanishing points" />
      </Field>
      <Field label="Short note (optional)">
        <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="What's the correct approach, in your own words…" />
      </Field>

      <Field label="Screenshots (optional)">
        <div className="flex flex-wrap gap-2">
          {images.map((img, i) => (
            <div key={img.url} className="relative h-16 w-16 overflow-hidden rounded-xl">
              <img src={img.url} alt="" className="h-full w-full object-cover" />
              <button
                onClick={() => removeImage(i)}
                className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))}
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-ink/25 text-ink-soft"
          >
            <Camera size={16} />
            <span className="text-[9px]">Camera</span>
          </button>
          <button
            onClick={() => galleryInputRef.current?.click()}
            className="flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-ink/25 text-ink-soft"
          >
            <ImagePlus size={16} />
            <span className="text-[9px]">Gallery</span>
          </button>
        </div>
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </Field>

      <Field label="Voice notes (optional)">
        <div className="space-y-2">
          {audios.map((a, i) => (
            <div key={a.url} className="flex items-center gap-2 rounded-xl border border-ink/10 bg-white/60 px-3 py-2">
              <Mic size={14} className="text-ink-soft" />
              <audio src={a.url} controls className="h-8 flex-1" />
              <button onClick={() => removeAudio(i)} className="text-rose-500">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <AudioRecorderField onRecorded={(blob) => setAudios((prev) => [...prev, { blob, url: URL.createObjectURL(blob) }])} />
        </div>
      </Field>
    </Sheet>
  );
}
