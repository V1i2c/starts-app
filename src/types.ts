// Core domain model for Starts.
// Kept as plain, serializable data (no class instances) so it can be
// persisted to IndexedDB / JSON without transformation.

export type ID = string;

export interface Chapter {
  id: ID;
  name: string;
}

export interface Subject {
  id: ID;
  name: string;
  color: SubjectColor;
  chapters: Chapter[];
  /** true for the JAC Arts seed data, false for anything the student added themselves */
  builtin: boolean;
}

export type SubjectColor =
  | "rose"
  | "sky"
  | "amber"
  | "indigo"
  | "emerald"
  | "orange"
  | "pink"
  | "teal"
  | "fuchsia"
  | "violet"
  | "cyan"
  | "lime"
  | "yellow";

export type TaskStatus = "pending" | "done";

export interface Task {
  id: ID;
  title: string;
  subjectId: ID | null;
  notes?: string;
  /** ISO date the task belongs to, e.g. "2026-02-10" */
  date: string;
  /** "HH:mm" 24h deadline time on `date`, or null -> implicitly 23:59 that day */
  time: string | null;
  status: TaskStatus;
  createdAt: string;
  completedAt: string | null;
}

export interface PlanEvent {
  id: ID;
  title: string;
  subjectId: ID | null;
  notes?: string;
  /** ISO date, e.g. "2026-02-10" */
  date: string;
  /** "HH:mm" 24h, or null for an all-day / undated reminder */
  time: string | null;
  reminder: boolean;
  done: boolean;
  createdAt: string;
}

export interface ErrorAttachmentRef {
  /** key under which the Blob is stored in the blob store */
  blobId: ID;
  mime: string;
}

export interface ErrorEntry {
  id: ID;
  subjectId: ID;
  chapterId: ID;
  title: string;
  note: string;
  screenshots: ErrorAttachmentRef[];
  voiceNotes: ErrorAttachmentRef[];
  createdAt: string;
  resolved: boolean;
  resolvedAt: string | null;
  reviewCount: number;
  lastReviewedAt: string | null;
  /** simple Leitner-style spaced repetition due date, ISO date */
  nextReviewDate: string;
}

export interface DailyLog {
  date: string; // ISO date key
  tasksCompleted: number;
  tasksCreated: number;
  planEventsCompleted: number;
  errorsAdded: number;
  errorsReviewed: number;
}

export type PermissionKey = "camera" | "microphone" | "notifications";
export type PermissionState = "granted" | "denied" | "prompt" | "unsupported";

export interface PermissionStatus {
  camera: PermissionState;
  microphone: PermissionState;
  notifications: PermissionState;
}
