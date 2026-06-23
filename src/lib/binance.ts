import { OHLCVCandle, LivePrice, Pair } from "@/types";

// data-api.binance.vision = public market-data endpoint TANPA geo-blocking.
// api.binance.com memblokir IP datacenter (Vercel US) dengan HTTP 451.
const BASE_URLS = [
  "https://data-api.binance.vision",
  "https://api.binance.com",
];
const TIMEOUT_MS = 8000;

async function fetchWithTimeout(path: string): Promise<Response> {
  let lastError: Error | null = null;

  for (const base of BASE_URLS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(`${base}${path}`, {
        signal: controller.signal,
        cache: "no-store",
      });
      if (!res.ok) {
        // 451 / 403 = geo-block -> coba host berikutnya
        lastError = new Error(`HTTP ${res.status}`);
        continue;
      }
      return res;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError ?? new Error("Semua endpoint Binance gagal");
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
  const path = `/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
  const res = await fetchWithTimeout(path);
  const data = (await res.json()) as unknown[][];
  return parseCandles(data);
}

export async function fetchLivePrices(pairs: Pair[]): Promise<LivePrice[]> {
  const results = await Promise.allSettled(
    pairs.map(async (pair): Promise<LivePrice> => {
      const path = `/api/v3/ticker/24hr?symbol=${pair}`;
      const res = await fetchWithTimeout(path);
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
