import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
}

const variants = {
  default: "bg-blue-600 hover:bg-blue-700 text-white border-transparent",
  outline: "bg-transparent hover:bg-gray-800 text-gray-300 border-gray-700",
  ghost: "bg-transparent hover:bg-gray-800 text-gray-400 border-transparent",
  danger: "bg-red-600 hover:bg-red-700 text-white border-transparent",
  success: "bg-green-600 hover:bg-green-700 text-white border-transparent",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({
  children,
  className,
  variant = "default",
  size = "md",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg border font-medium",
        "transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/50",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
