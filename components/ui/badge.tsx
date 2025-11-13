import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variant === "default"
          ? "border-brand-400/30 bg-brand-500/10 text-brand-100"
          : "border-white/20 text-slate-200",
        className,
      )}
      {...props}
    />
  );
}
