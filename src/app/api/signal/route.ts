import { NextRequest, NextResponse } from "next/server";
import { generateSignal } from "@/lib/signalEngine";
import { fetchMultiTimeframeOHLCV, fetchLivePrices } from "@/lib/binance";
import { fetchFearGreed } from "@/lib/fearGreed";
import { MarketData, Pair } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const pair: Pair = body.pair === "ETHUSDT" ? "ETHUSDT" : "BTCUSDT";

    // API key: prioritas dari body (user input di browser), fallback ke env var
    const apiKey = body.apiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key belum dikonfigurasi. Masukkan API key di dashboard." },
        { status: 400 }
      );
    }

    const [ohlcv, prices, fearGreed] = await Promise.all([
      fetchMultiTimeframeOHLCV(pair),
      fetchLivePrices([pair]),
      fetchFearGreed(),
    ]);

    const currentPrice = prices[0]?.price ?? 0;
    const change24h = prices[0]?.changePercent24h ?? 0;

    const marketData: MarketData = {
      pair,
      ...ohlcv,
      currentPrice,
      change24h,
      fearGreed,
    };

    const signal = await generateSignal(marketData, apiKey);

    return NextResponse.json({ signal });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
