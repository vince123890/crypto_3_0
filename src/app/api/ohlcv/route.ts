import { NextRequest, NextResponse } from "next/server";
import { fetchMultiTimeframeOHLCV, fetchLivePrices } from "@/lib/binance";
import { fetchFearGreed } from "@/lib/fearGreed";
import { Pair } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const pair: Pair = body.pair === "ETHUSDT" ? "ETHUSDT" : "BTCUSDT";

    const [ohlcv, prices, fearGreed] = await Promise.all([
      fetchMultiTimeframeOHLCV(pair),
      fetchLivePrices([pair]),
      fetchFearGreed(),
    ]);

    return NextResponse.json({
      pair,
      ...ohlcv,
      currentPrice: prices[0]?.price ?? 0,
      change24h: prices[0]?.changePercent24h ?? 0,
      fearGreed,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
