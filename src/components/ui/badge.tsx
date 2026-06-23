import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "success" | "danger" | "warning" | "neutral";
}

const variants = {
  default: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  success: "bg-green-500/20 text-green-400 border-green-500/30",
  danger: "bg-red-500/20 text-red-400 border-red-500/30",
  warning: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  neutral: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

export function Badge({ children, className, variant = "default" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
