import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  className?: string;
  barClassName?: string;
}

export function Progress({ value, className, barClassName }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={cn("w-full bg-gray-800 rounded-full h-2 overflow-hidden", className)}>
      <div
        className={cn("h-full rounded-full transition-all duration-500", barClassName ?? "bg-blue-500")}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
