import { cn } from "@/utils/cn";

interface SegmentedProps<T extends string> {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  className?: string;
}

export function Segmented<T extends string>({ value, onChange, options, className }: SegmentedProps<T>) {
  return (
    <div className={cn("inline-flex rounded-full bg-ink/5 p-1", className)}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-full px-3.5 py-1.5 text-sm font-medium transition-all",
            value === opt.value ? "bg-white text-ink shadow-sm" : "text-ink-soft hover:text-ink",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
