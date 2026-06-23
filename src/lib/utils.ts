import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, pair: string): string {
  const decimals = pair === "BTCUSDT" ? 0 : 2;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(price);
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(new Date(iso));
}

export function getFearGreedColor(value: number): string {
  if (value <= 25) return "text-red-400";
  if (value <= 45) return "text-orange-400";
  if (value <= 55) return "text-yellow-400";
  if (value <= 75) return "text-green-400";
  return "text-emerald-400";
}

export function getConfidenceColor(score: number): string {
  if (score >= 85) return "text-emerald-400";
  if (score >= 75) return "text-green-400";
  if (score >= 60) return "text-yellow-400";
  return "text-red-400";
}

export function getConfidenceLabel(score: number): string {
  if (score >= 95) return "PREMIUM ⭐";
  if (score >= 85) return "HIGH ✅✅";
  if (score >= 75) return "MEDIUM ✅";
  if (score >= 60) return "LOW";
  return "WAIT";
}

export function getBiasColor(bias: string): string {
  if (bias === "LONG") return "text-green-400";
  if (bias === "SHORT") return "text-red-400";
  return "text-gray-400";
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    active: "AKTIF",
    tp1_hit: "TP1 HIT ✅",
    tp2_hit: "TP2 HIT ✅✅",
    tp3_hit: "TP3 HIT ✅✅✅",
    sl_hit: "SL HIT ❌",
    expired: "EXPIRED",
  };
  return map[status] ?? status.toUpperCase();
}
