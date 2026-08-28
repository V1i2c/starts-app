import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
import { addDays, format } from "date-fns";
import type {
  DailyLog,
  ErrorAttachmentRef,
  ErrorEntry,
  PermissionKey,
  PermissionState,
  PermissionStatus,
  PlanEvent,
  Subject,
  SubjectColor,
  Task,
} from "@/types";
import { SEED_SUBJECTS } from "@/data/syllabus";
import { makeId } from "@/lib/id";
import { todayKey, dateKey } from "@/lib/date";
import { idbStorage } from "./persist";
import { deleteBlob } from "@/lib/blobStore";

function cleanupBlobs(entries: ErrorEntry[]) {
  for (const entry of entries) {
    for (const ref of [...entry.screenshots, ...entry.voiceNotes]) {
      void deleteBlob(ref.blobId);
    }
  }
}

const LEITNER_INTERVALS_DAYS = [1, 3, 7, 16, 35];

function nextReviewFrom(reviewCount: number, from: Date = new Date()): string {
  const interval = LEITNER_INTERVALS_DAYS[Math.min(reviewCount, LEITNER_INTERVALS_DAYS.length - 1)];
  return format(addDays(from, interval), "yyyy-MM-dd");
}

interface State {
  hasHydrated: boolean;
  onboardingComplete: boolean;
  studentName: string;
  activeSubjectIds: string[] | null; // null = "hasn't chosen yet, show all"
  permissions: PermissionStatus;
  subjects: Subject[];
  tasks: Task[];
  planEvents: PlanEvent[];
  errors: ErrorEntry[];
  dailyLogs: Record<string, DailyLog>;
}

interface Actions {
  setHasHydrated: (v: boolean) => void;
  completeOnboarding: (name: string, subjectIds: string[]) => void;
  setStudentName: (name: string) => void;
  setPermission: (key: PermissionKey, state: PermissionState) => void;
  setActiveSubjects: (ids: string[]) => void;
  toggleActiveSubject: (id: string) => void;
  resetAllData: () => void;

  addSubject: (name: string, color: SubjectColor) => Subject;
  renameSubject: (id: string, name: string) => void;
  deleteSubject: (id: string) => void;
  addChapter: (subjectId: string, name: string) => void;
  renameChapter: (subjectId: string, chapterId: string, name: string) => void;
  deleteChapter: (subjectId: string, chapterId: string) => void;

  addTask: (input: {
    title: string;
    subjectId: string | null;
    notes?: string;
    date: string;
    time: string | null;
  }) => void;
  updateTask: (id: string, patch: Partial<Pick<Task, "title" | "subjectId" | "notes" | "date" | "time">>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;

  addPlanEvent: (input: {
    title: string;
    subjectId: string | null;
    notes?: string;
    date: string;
    time: string | null;
    reminder: boolean;
  }) => PlanEvent;
  updatePlanEvent: (
    id: string,
    patch: Partial<Pick<PlanEvent, "title" | "subjectId" | "notes" | "date" | "time" | "reminder">>,
  ) => void;
  toggleEventDone: (id: string) => void;
  deleteEvent: (id: string) => void;

  addError: (input: {
    subjectId: string;
    chapterId: string;
    title: string;
    note: string;
    screenshots: ErrorAttachmentRef[];
    voiceNotes: ErrorAttachmentRef[];
  }) => ErrorEntry;
  updateError: (id: string, patch: Partial<Pick<ErrorEntry, "title" | "note">>) => void;
  deleteError: (id: string) => void;
  markErrorReviewed: (id: string) => void;
  toggleErrorResolved: (id: string) => void;
}

function ensureLog(logs: Record<string, DailyLog>, date: string): DailyLog {
  return (
    logs[date] ?? {
      date,
      tasksCompleted: 0,
      tasksCreated: 0,
      planEventsCompleted: 0,
      errorsAdded: 0,
      errorsReviewed: 0,
    }
  );
}

export const useStore = create<State & Actions>()(
  persist(
    (set) => ({
      hasHydrated: false,
      onboardingComplete: false,
      studentName: "",
      activeSubjectIds: null,
      permissions: { camera: "prompt", microphone: "prompt", notifications: "prompt" },
      subjects: SEED_SUBJECTS.map((s) => ({ ...s, id: makeId() })),
      tasks: [],
      planEvents: [],
      errors: [],
      dailyLogs: {},

      setHasHydrated: (v) => set({ hasHydrated: v }),

      completeOnboarding: (name, subjectIds) =>
        set({ onboardingComplete: true, studentName: name.trim(), activeSubjectIds: subjectIds }),

      setStudentName: (name) => set({ studentName: name.trim() }),

      setPermission: (key, state) => set((s) => ({ permissions: { ...s.permissions, [key]: state } })),

      setActiveSubjects: (ids) => set({ activeSubjectIds: ids }),
      toggleActiveSubject: (id) =>
        set((s) => {
          const current = s.activeSubjectIds ?? s.subjects.map((sub) => sub.id);
          const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
          return { activeSubjectIds: next };
        }),
      resetAllData: () => {
        set((s) => {
          cleanupBlobs(s.errors);
          return {
            tasks: [],
            planEvents: [],
            errors: [],
            dailyLogs: {},
            subjects: SEED_SUBJECTS.map((sub) => ({ ...sub, id: makeId() })),
            activeSubjectIds: null,
          };
        });
      },

      addSubject: (name, color) => {
        const subject: Subject = { id: makeId(), name: name.trim(), color, chapters: [], builtin: false };
        set((s) => ({
          subjects: [...s.subjects, subject],
          activeSubjectIds: s.activeSubjectIds ? [...s.activeSubjectIds, subject.id] : null,
        }));
        return subject;
      },
      renameSubject: (id, name) =>
        set((s) => ({ subjects: s.subjects.map((sub) => (sub.id === id ? { ...sub, name: name.trim() } : sub)) })),
      deleteSubject: (id) =>
        set((s) => {
          cleanupBlobs(s.errors.filter((e) => e.subjectId === id));
          return {
            subjects: s.subjects.filter((sub) => sub.id !== id),
            activeSubjectIds: s.activeSubjectIds ? s.activeSubjectIds.filter((x) => x !== id) : null,
            tasks: s.tasks.map((t) => (t.subjectId === id ? { ...t, subjectId: null } : t)),
            planEvents: s.planEvents.map((e) => (e.subjectId === id ? { ...e, subjectId: null } : e)),
            errors: s.errors.filter((e) => e.subjectId !== id),
          };
        }),
      addChapter: (subjectId, name) =>
        set((s) => ({
          subjects: s.subjects.map((sub) =>
            sub.id === subjectId ? { ...sub, chapters: [...sub.chapters, { id: makeId(), name: name.trim() }] } : sub,
          ),
        })),
      renameChapter: (subjectId, chapterId, name) =>
        set((s) => ({
          subjects: s.subjects.map((sub) =>
            sub.id === subjectId
              ? { ...sub, chapters: sub.chapters.map((c) => (c.id === chapterId ? { ...c, name: name.trim() } : c)) }
              : sub,
          ),
        })),
      deleteChapter: (subjectId, chapterId) =>
        set((s) => {
          cleanupBlobs(s.errors.filter((e) => e.chapterId === chapterId));
          return {
            subjects: s.subjects.map((sub) =>
              sub.id === subjectId ? { ...sub, chapters: sub.chapters.filter((c) => c.id !== chapterId) } : sub,
            ),
            errors: s.errors.filter((e) => e.chapterId !== chapterId),
          };
        }),

      addTask: ({ title, subjectId, notes, date, time }) => {
        const task: Task = {
          id: makeId(),
          title: title.trim(),
          subjectId,
          notes: notes?.trim(),
          date,
          time,
          status: "pending",
          createdAt: new Date().toISOString(),
          completedAt: null,
        };
        set((s) => {
          const logs = { ...s.dailyLogs };
          const log = ensureLog(logs, date);
          logs[date] = { ...log, tasksCreated: log.tasksCreated + 1 };
          return { tasks: [...s.tasks, task], dailyLogs: logs };
        });
      },
      updateTask: (id, patch) => set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
      toggleTask: (id) =>
        set((s) => {
          const task = s.tasks.find((t) => t.id === id);
          if (!task) return s;
          const nowDone = task.status !== "done";
          const completedAt = nowDone ? new Date().toISOString() : null;
          const logDate = todayKey();
          const logs = { ...s.dailyLogs };
          const log = ensureLog(logs, logDate);
          logs[logDate] = { ...log, tasksCompleted: Math.max(0, log.tasksCompleted + (nowDone ? 1 : -1)) };
          return {
            tasks: s.tasks.map((t) => (t.id === id ? { ...t, status: nowDone ? "done" : "pending", completedAt } : t)),
            dailyLogs: logs,
          };
        }),
      deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      addPlanEvent: ({ title, subjectId, notes, date, time, reminder }) => {
        const event: PlanEvent = {
          id: makeId(),
          title: title.trim(),
          subjectId,
          notes: notes?.trim(),
          date,
          time,
          reminder,
          done: false,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ planEvents: [...s.planEvents, event] }));
        return event;
      },
      updatePlanEvent: (id, patch) =>
        set((s) => ({ planEvents: s.planEvents.map((e) => (e.id === id ? { ...e, ...patch } : e)) })),
      toggleEventDone: (id) =>
        set((s) => {
          const ev = s.planEvents.find((e) => e.id === id);
          if (!ev) return s;
          const nowDone = !ev.done;
          const logDate = todayKey();
          const logs = { ...s.dailyLogs };
          const log = ensureLog(logs, logDate);
          logs[logDate] = { ...log, planEventsCompleted: Math.max(0, log.planEventsCompleted + (nowDone ? 1 : -1)) };
          return {
            planEvents: s.planEvents.map((e) => (e.id === id ? { ...e, done: nowDone } : e)),
            dailyLogs: logs,
          };
        }),
      deleteEvent: (id) => set((s) => ({ planEvents: s.planEvents.filter((e) => e.id !== id) })),

      addError: ({ subjectId, chapterId, title, note, screenshots, voiceNotes }) => {
        const entry: ErrorEntry = {
          id: makeId(),
          subjectId,
          chapterId,
          title: title.trim(),
          note: note.trim(),
          screenshots,
          voiceNotes,
          createdAt: new Date().toISOString(),
          resolved: false,
          resolvedAt: null,
          reviewCount: 0,
          lastReviewedAt: null,
          nextReviewDate: nextReviewFrom(0),
        };
        set((s) => {
          const logDate = todayKey();
          const logs = { ...s.dailyLogs };
          const log = ensureLog(logs, logDate);
          logs[logDate] = { ...log, errorsAdded: log.errorsAdded + 1 };
          return { errors: [...s.errors, entry], dailyLogs: logs };
        });
        return entry;
      },
      updateError: (id, patch) =>
        set((s) => ({ errors: s.errors.map((e) => (e.id === id ? { ...e, ...patch } : e)) })),
      deleteError: (id) =>
        set((s) => {
          const entry = s.errors.find((e) => e.id === id);
          if (entry) cleanupBlobs([entry]);
          return { errors: s.errors.filter((e) => e.id !== id) };
        }),
      markErrorReviewed: (id) =>
        set((s) => {
          const entry = s.errors.find((e) => e.id === id);
          if (!entry) return s;
          const reviewCount = entry.reviewCount + 1;
          const logDate = todayKey();
          const logs = { ...s.dailyLogs };
          const log = ensureLog(logs, logDate);
          logs[logDate] = { ...log, errorsReviewed: log.errorsReviewed + 1 };
          return {
            errors: s.errors.map((e) =>
              e.id === id
                ? { ...e, reviewCount, lastReviewedAt: new Date().toISOString(), nextReviewDate: nextReviewFrom(reviewCount) }
                : e,
            ),
            dailyLogs: logs,
          };
        }),
      toggleErrorResolved: (id) =>
        set((s) => ({
          errors: s.errors.map((e) =>
            e.id === id ? { ...e, resolved: !e.resolved, resolvedAt: !e.resolved ? new Date().toISOString() : null } : e,
          ),
        })),

    }),
    {
      name: "starts-app-state",
      storage: idbStorage(),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (s) => {
        const { hasHydrated: _hasHydrated, ...rest } = s;
        void _hasHydrated;
        return rest;
      },
    },
  ),
);

export function dateKeyOf(d: Date) {
  return dateKey(d);
}

// convenience selector hooks
export const useSubjects = () => useStore((s) => s.subjects);
export const useVisibleSubjects = () =>
  useStore(
    useShallow((s) => (s.activeSubjectIds ? s.subjects.filter((sub) => s.activeSubjectIds!.includes(sub.id)) : s.subjects)),
  );
