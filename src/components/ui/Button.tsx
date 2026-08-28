import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
}

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-ink text-paper hover:bg-ink/90 shadow-sm shadow-ink/10",
  secondary: "bg-brand-500 text-white hover:bg-brand-600 shadow-sm shadow-brand-500/30",
  outline: "border border-ink/15 text-ink hover:bg-ink/5",
  ghost: "text-ink-soft hover:bg-ink/5",
  danger: "bg-rose-600 text-white hover:bg-rose-700",
};

const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-5 text-base gap-2",
  icon: "h-10 w-10 shrink-0",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium transition-all active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
