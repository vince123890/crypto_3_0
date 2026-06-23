import { OHLCVCandle, LivePrice, Pair } from "@/types";

const BASE_URL = "https://api.binance.com";
const TIMEOUT_MS = 8000;

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res;
  } finally {
    clearTimeout(timer);
  }
}

function parseCandles(raw: unknown[][]): OHLCVCandle[] {
  return raw.map((c) => ({
    openTime: Number(c[0]),
    open: parseFloat(c[1] as string),
    high: parseFloat(c[2] as string),
    low: parseFloat(c[3] as string),
    close: parseFloat(c[4] as string),
    volume: parseFloat(c[5] as string),
    closeTime: Number(c[6]),
  }));
}

export async function fetchOHLCV(
  symbol: Pair,
  interval: "1d" | "4h" | "1h" | "15m",
  limit = 100
): Promise<OHLCVCandle[]> {
  const url = `${BASE_URL}/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
  const res = await fetchWithTimeout(url);
  const data = (await res.json()) as unknown[][];
  return parseCandles(data);
}

export async function fetchLivePrices(pairs: Pair[]): Promise<LivePrice[]> {
  const results = await Promise.allSettled(
    pairs.map(async (pair): Promise<LivePrice> => {
      const url = `${BASE_URL}/api/v3/ticker/24hr?symbol=${pair}`;
      const res = await fetchWithTimeout(url);
      const d = await res.json();
      return {
        symbol: pair,
        price: parseFloat(d.lastPrice),
        change24h: parseFloat(d.priceChange),
        changePercent24h: parseFloat(d.priceChangePercent),
        volume24h: parseFloat(d.volume),
      };
    })
  );

  return results
    .filter((r): r is PromiseFulfilledResult<LivePrice> => r.status === "fulfilled")
    .map((r) => r.value);
}

export async function fetchMultiTimeframeOHLCV(pair: Pair) {
  const [daily, h4, h1, m15] = await Promise.all([
    fetchOHLCV(pair, "1d", 50),
    fetchOHLCV(pair, "4h", 100),
    fetchOHLCV(pair, "1h", 100),
    fetchOHLCV(pair, "15m", 100),
  ]);
  return { daily, h4, h1, m15 };
}
