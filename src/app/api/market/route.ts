import { NextResponse } from "next/server";
import { fetchLivePrices } from "@/lib/binance";
import { fetchFearGreed } from "@/lib/fearGreed";

export async function GET() {
  try {
    const [prices, fearGreed] = await Promise.all([
      fetchLivePrices(["BTCUSDT", "ETHUSDT"]),
      fetchFearGreed(),
    ]);
    return NextResponse.json({ prices, fearGreed });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
