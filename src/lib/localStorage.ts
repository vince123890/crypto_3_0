import { Signal, Preferences, Stats } from "@/types";

const KEYS = {
  signals: "csp_signals",
  preferences: "csp_preferences",
  stats: "csp_stats",
  lastFetch: "csp_last_fetch",
} as const;

const MAX_SIGNALS = 100;

const DEFAULT_PREFERENCES: Preferences = {
  defaultPair: "BTCUSDT",
  defaultInterval: "4h",
  theme: "dark",
  autoRefreshMinutes: 15,
  showDisclaimer: true,
};

function safeRead<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function safeWrite(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full — silently ignore
  }
}

// Signals
export function getSignals(): Signal[] {
  return safeRead<Signal[]>(KEYS.signals) ?? [];
}

export function saveSignal(signal: Signal): void {
  const signals = getSignals();
  const updated = [signal, ...signals.filter((s) => s.id !== signal.id)];
  // FIFO: keep max 100
  safeWrite(KEYS.signals, updated.slice(0, MAX_SIGNALS));
}

export function updateSignalStatus(
  id: string,
  status: Signal["status"],
  closedAt?: string
): void {
  const signals = getSignals().map((s) =>
    s.id === id ? { ...s, status, closedAt: closedAt ?? s.closedAt } : s
  );
  safeWrite(KEYS.signals, signals);
}

export function clearSignals(): void {
  if (typeof window !== "undefined") localStorage.removeItem(KEYS.signals);
}

// Preferences
export function getPreferences(): Preferences {
  return safeRead<Preferences>(KEYS.preferences) ?? DEFAULT_PREFERENCES;
}

export function savePreferences(prefs: Partial<Preferences>): void {
  const current = getPreferences();
  safeWrite(KEYS.preferences, { ...current, ...prefs });
}

// Stats
export function recalculateStats(signals: Signal[]): Stats {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const closed = signals.filter((s) =>
    ["tp1_hit", "tp2_hit", "tp3_hit", "sl_hit"].includes(s.status)
  );
  const wins = closed.filter((s) =>
    ["tp1_hit", "tp2_hit", "tp3_hit"].includes(s.status)
  );

  const signals7d = closed.filter(
    (s) => new Date(s.generatedAt) >= sevenDaysAgo
  );
  const wins7d = signals7d.filter((s) =>
    ["tp1_hit", "tp2_hit", "tp3_hit"].includes(s.status)
  );

  const signals30d = closed.filter(
    (s) => new Date(s.generatedAt) >= thirtyDaysAgo
  );
  const wins30d = signals30d.filter((s) =>
    ["tp1_hit", "tp2_hit", "tp3_hit"].includes(s.status)
  );

  const avgRR =
    signals.length > 0
      ? signals.reduce((acc, s) => acc + s.rrRatio, 0) / signals.length
      : 0;

  const stats: Stats = {
    totalSignals: signals.length,
    winCount: wins.length,
    lossCount: closed.length - wins.length,
    winRate7d: signals7d.length > 0 ? (wins7d.length / signals7d.length) * 100 : 0,
    winRate30d: signals30d.length > 0 ? (wins30d.length / signals30d.length) * 100 : 0,
    avgRR: Math.round(avgRR * 100) / 100,
    lastUpdated: now.toISOString(),
  };

  safeWrite(KEYS.stats, stats);
  return stats;
}

export function getStats(): Stats | null {
  return safeRead<Stats>(KEYS.stats);
}

// Last fetch timestamp
export function getLastFetch(): string | null {
  return safeRead<string>(KEYS.lastFetch);
}

export function setLastFetch(): void {
  safeWrite(KEYS.lastFetch, new Date().toISOString());
}

// Export CSV
export function exportSignalsCSV(signals: Signal[]): void {
  const headers = [
    "ID",
    "Pair",
    "Bias",
    "Entry Low",
    "Entry High",
    "Stop Loss",
    "TP1",
    "TP2",
    "TP3",
    "R:R",
    "Confidence",
    "Status",
    "Fear Greed",
    "Generated At",
    "Closed At",
  ];

  const rows = signals.map((s) => [
    s.id,
    s.pair,
    s.bias,
    s.entryLow,
    s.entryHigh,
    s.stopLoss,
    s.tp1,
    s.tp2,
    s.tp3,
    s.rrRatio,
    s.confidenceScore,
    s.status,
    `${s.fearGreedScore} (${s.fearGreedLabel})`,
    s.generatedAt,
    s.closedAt ?? "",
  ]);

  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `cryptosignal-pro-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
