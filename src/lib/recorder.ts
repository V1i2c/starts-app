/**
 * Thin wrapper around MediaRecorder for in-app voice notes. Deliberately not a
 * React hook by itself — the UI hook (useVoiceRecorder) owns the React state,
 * this class owns the messy browser API + cleans up its own tracks/stream.
 */
export class VoiceRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private chunks: BlobPart[] = [];

  async start(): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = ["audio/webm", "audio/mp4", "audio/ogg"].find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
    this.mediaRecorder = new MediaRecorder(this.stream, mimeType ? { mimeType } : undefined);
    this.chunks = [];
    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.chunks.push(e.data);
    };
    this.mediaRecorder.start();
  }

  pause(): void {
    if (this.mediaRecorder?.state === "recording") this.mediaRecorder.pause();
  }

  resume(): void {
    if (this.mediaRecorder?.state === "paused") this.mediaRecorder.resume();
  }

  get state(): "inactive" | "recording" | "paused" {
    return this.mediaRecorder?.state ?? "inactive";
  }

  stop(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error("Recorder was never started"));
        return;
      }
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: this.mediaRecorder?.mimeType || "audio/webm" });
        this.cleanupStream();
        resolve(blob);
      };
      this.mediaRecorder.stop();
    });
  }

  cancel(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      this.mediaRecorder.onstop = null;
      this.mediaRecorder.stop();
    }
    this.cleanupStream();
  }

  private cleanupStream() {
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
  }
}
