import type { SubjectColor } from "@/types";

/**
 * Tailwind can't resolve `bg-${color}-100` template strings at build time, so
 * every color variant needs to exist as a literal class somewhere in source.
 * This table is that source, and also the single place subject theming lives.
 */
export const SUBJECT_COLOR_STYLES: Record<
  SubjectColor,
  { soft: string; text: string; ring: string; solid: string; dot: string }
> = {
  rose: { soft: "bg-rose-100", text: "text-rose-700", ring: "ring-rose-200", solid: "bg-rose-500", dot: "bg-rose-500" },
  sky: { soft: "bg-sky-100", text: "text-sky-700", ring: "ring-sky-200", solid: "bg-sky-500", dot: "bg-sky-500" },
  amber: {
    soft: "bg-amber-100",
    text: "text-amber-700",
    ring: "ring-amber-200",
    solid: "bg-amber-500",
    dot: "bg-amber-500",
  },
  indigo: {
    soft: "bg-indigo-100",
    text: "text-indigo-700",
    ring: "ring-indigo-200",
    solid: "bg-indigo-500",
    dot: "bg-indigo-500",
  },
  emerald: {
    soft: "bg-emerald-100",
    text: "text-emerald-700",
    ring: "ring-emerald-200",
    solid: "bg-emerald-500",
    dot: "bg-emerald-500",
  },
  orange: {
    soft: "bg-orange-100",
    text: "text-orange-700",
    ring: "ring-orange-200",
    solid: "bg-orange-500",
    dot: "bg-orange-500",
  },
  pink: { soft: "bg-pink-100", text: "text-pink-700", ring: "ring-pink-200", solid: "bg-pink-500", dot: "bg-pink-500" },
  teal: { soft: "bg-teal-100", text: "text-teal-700", ring: "ring-teal-200", solid: "bg-teal-500", dot: "bg-teal-500" },
  fuchsia: {
    soft: "bg-fuchsia-100",
    text: "text-fuchsia-700",
    ring: "ring-fuchsia-200",
    solid: "bg-fuchsia-500",
    dot: "bg-fuchsia-500",
  },
  violet: {
    soft: "bg-violet-100",
    text: "text-violet-700",
    ring: "ring-violet-200",
    solid: "bg-violet-500",
    dot: "bg-violet-500",
  },
  cyan: { soft: "bg-cyan-100", text: "text-cyan-700", ring: "ring-cyan-200", solid: "bg-cyan-500", dot: "bg-cyan-500" },
  lime: { soft: "bg-lime-100", text: "text-lime-700", ring: "ring-lime-200", solid: "bg-lime-500", dot: "bg-lime-500" },
  yellow: {
    soft: "bg-yellow-100",
    text: "text-yellow-700",
    ring: "ring-yellow-200",
    solid: "bg-yellow-500",
    dot: "bg-yellow-500",
  },
};

export const SUBJECT_COLOR_OPTIONS = Object.keys(SUBJECT_COLOR_STYLES) as SubjectColor[];
