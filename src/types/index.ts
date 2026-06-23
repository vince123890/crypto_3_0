export type Pair = "BTCUSDT" | "ETHUSDT";
export type Bias = "LONG" | "SHORT" | "WAIT";
export type SignalStatus =
  | "active"
  | "tp1_hit"
  | "tp2_hit"
  | "tp3_hit"
  | "sl_hit"
  | "expired";

export interface Signal {
  id: string;
  pair: Pair;
  bias: Bias;
  entryLow: number;
  entryHigh: number;
  stopLoss: number;
  tp1: number;
  tp2: number;
  tp3: number;
  rrRatio: number;
  confidenceScore: number;
  timeframeHTF: string;
  timeframeEntry: string;
  reasoning: string[];
  invalidationNote: string;
  status: SignalStatus;
  fearGreedScore: number;
  fearGreedLabel: string;
  generatedAt: string;
  closedAt: string | null;
}

export interface Preferences {
  defaultPair: Pair;
  defaultInterval: "4h" | "1h" | "15m";
  theme: "dark" | "light";
  autoRefreshMinutes: number;
  showDisclaimer: boolean;
}

export interface Stats {
  totalSignals: number;
  winCount: number;
  lossCount: number;
  winRate7d: number;
  winRate30d: number;
  avgRR: number;
  lastUpdated: string;
}

export interface LivePrice {
  symbol: Pair;
  price: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
}

export interface FearGreedData {
  value: number;
  label: string;
  timestamp: string;
}

export interface OHLCVCandle {
  openTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  closeTime: number;
}

export interface MarketData {
  pair: Pair;
  daily: OHLCVCandle[];
  h4: OHLCVCandle[];
  h1: OHLCVCandle[];
  m15: OHLCVCandle[];
  currentPrice: number;
  change24h: number;
  fearGreed: FearGreedData;
}
